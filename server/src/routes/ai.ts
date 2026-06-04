import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/chat', async (req: AuthRequest, res) => {
  const { messages, dossierId, conversationId } = req.body;

  let systemContext = `Du bist ein erfahrener Schweizer Rechtsassistent für die Kanzlei-Management-Plattform smartlaw.
Du hilfst Schweizer Anwälten bei ihrer täglichen Arbeit. Antworte auf Deutsch.
Du kannst Schriftsätze verfassen, Dokumente zusammenfassen, nächste Schritte vorschlagen und Schweizer Rechtsfragen beantworten.
Beziehe dich auf das Schweizer Recht (OR, ZGB, ZPO, StGB etc.) und zitiere relevante Gesetzesartikel.`;

  if (dossierId) {
    const dossier = await prisma.dossier.findUnique({
      where: { id: dossierId },
      include: { client: true, anwalt: true, tasks: true },
    });
    if (dossier) {
      systemContext += `\n\nAktuelles Dossier:
- Titel: ${dossier.titel}
- Rechtsgebiet: ${dossier.rechtsgebiet}
- Status: ${dossier.status}
- Mandant: ${dossier.client.vorname} ${dossier.client.nachname}${dossier.client.firma ? ` (${dossier.client.firma})` : ''}
- Zuständiger Anwalt: ${dossier.anwalt.vorname} ${dossier.anwalt.nachname}
- Frist: ${dossier.frist ? new Date(dossier.frist).toLocaleDateString('de-CH') : 'keine'}
- Notizen: ${dossier.notizen || 'keine'}
- Offene Aufgaben: ${dossier.tasks.filter(t => t.status !== 'ERLEDIGT').length}`;
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemContext,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    });

    let fullContent = '';

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullContent += chunk.delta.text;
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    // Save conversation
    if (conversationId) {
      await prisma.aIConversation.update({
        where: { id: conversationId },
        data: {
          messages: [
            ...messages,
            { role: 'assistant', content: fullContent },
          ],
          updatedAt: new Date(),
        },
      });
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: 'KI-Fehler aufgetreten' })}\n\n`);
    res.end();
  }
});

router.get('/conversations', async (req: AuthRequest, res) => {
  const { dossierId } = req.query;
  const conversations = await prisma.aIConversation.findMany({
    where: {
      userId: req.user!.id,
      ...(dossierId && { dossierId: dossierId as string }),
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  });
  res.json(conversations);
});

router.post('/conversations', async (req: AuthRequest, res) => {
  const { dossierId } = req.body;
  const conversation = await prisma.aIConversation.create({
    data: { userId: req.user!.id, dossierId, messages: [] },
  });
  res.status(201).json(conversation);
});

router.get('/suggestions', async (req: AuthRequest, res) => {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [upcomingDeadlines, unbilledEntries] = await Promise.all([
    prisma.dossier.findMany({
      where: {
        frist: { gte: now, lte: in7Days },
        status: { not: 'ABGESCHLOSSEN' },
        anwaltId: req.user!.id,
      },
      include: { client: true },
      take: 5,
    }),
    prisma.timeEntry.count({
      where: { verrechenbar: true, userId: req.user!.id, invoiceItems: { none: {} } },
    }),
  ]);

  res.json({ upcomingDeadlines, unbilledEntries });
});

export default router;
