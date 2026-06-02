import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/kpis', async (req: AuthRequest, res) => {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const [aktiveDossiers, timeEntriesMonth, offeneInvoices, pendentSignaturen, recentDossiers, todayEntries] =
    await Promise.all([
      prisma.dossier.count({ where: { status: 'AKTIV' } }),
      prisma.timeEntry.findMany({
        where: { datum: { gte: firstOfMonth } },
        select: { dauer: true },
      }),
      prisma.invoice.findMany({
        where: { status: { in: ['VERSENDET', 'UEBERFAELLIG'] } },
        select: { betrag: true, mwst: true },
      }),
      prisma.document.count({ where: { signaturStatus: 'AUSSTEHEND' } }),
      prisma.dossier.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          client: true,
          anwalt: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } },
        },
      }),
      prisma.timeEntry.findMany({
        where: { userId: req.user!.id, datum: { gte: today, lt: tomorrow } },
        include: {
          dossier: { include: { client: true } },
          user: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } },
        },
        orderBy: { datum: 'desc' },
      }),
    ]);

  const erfassteStunden = timeEntriesMonth.reduce((sum, e) => sum + e.dauer, 0);
  const offeneHonorare = offeneInvoices.reduce((sum, i) => sum + i.betrag * (1 + i.mwst / 100), 0);

  res.json({
    aktiveDossiers,
    erfassteStunden,
    offeneHonorare,
    pendentSignaturen,
    recentDossiers,
    todayTimeEntries: todayEntries,
  });
});

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true },
    where: { aktiv: true },
    orderBy: { nachname: 'asc' },
  });
  res.json(users);
});

export default router;
