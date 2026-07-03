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

  const [
    aktiveDossiers,
    erfassteStunden,
    offeneHonorare,
    pendentSignaturen,
    recentDossiers,
    todayEntries,
  ] = await Promise.all([
    prisma.dossier.count({ where: { status: 'AKTIV' } }),

    prisma.timeEntry.aggregate({
      where: { datum: { gte: firstOfMonth } },
      _sum: { dauer: true },
    }),

    prisma.invoice.findMany({
      where: { status: { in: ['VERSENDET', 'UEBERFAELLIG'] } },
      select: { betrag: true, mwst: true },
    }),

    prisma.document.count({ where: { signaturStatus: 'AUSSTEHEND' } }),

    prisma.dossier.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, titel: true, rechtsgebiet: true, status: true, frist: true,
        client: { select: { vorname: true, nachname: true, firma: true } },
        anwalt: { select: { vorname: true, nachname: true } },
      },
    }),

    prisma.timeEntry.findMany({
      where: { userId: req.user!.id, datum: { gte: today, lt: tomorrow } },
      select: {
        id: true, taetigkeit: true, dauer: true,
        dossier: { select: { titel: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  res.json({
    aktiveDossiers,
    erfassteStunden: erfassteStunden._sum.dauer ?? 0,
    offeneHonorare: offeneHonorare.reduce((s, i) => s + i.betrag * (1 + i.mwst / 100), 0),
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
