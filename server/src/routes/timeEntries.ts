import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  const { dossierId, datum, userId } = req.query;
  const entries = await prisma.timeEntry.findMany({
    where: {
      ...(dossierId && { dossierId: dossierId as string }),
      ...(userId ? { userId: userId as string } : {}),
      ...(datum && {
        datum: {
          gte: new Date(datum as string),
          lt: new Date(new Date(datum as string).getTime() + 86400000),
        },
      }),
    },
    include: {
      dossier: { include: { client: true } },
      user: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } },
    },
    orderBy: { datum: 'desc' },
  });
  res.json(entries);
});

router.get('/today', async (req: AuthRequest, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: req.user!.id,
      datum: { gte: today, lt: tomorrow },
    },
    include: {
      dossier: { include: { client: true } },
      user: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } },
    },
    orderBy: { datum: 'desc' },
  });
  res.json(entries);
});

router.get('/summary', async (req: AuthRequest, res) => {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const entries = await prisma.timeEntry.findMany({
    where: { datum: { gte: firstOfMonth } },
    select: { dauer: true, verrechenbar: true },
  });
  const total = entries.reduce((sum, e) => sum + e.dauer, 0);
  const billable = entries.filter(e => e.verrechenbar).reduce((sum, e) => sum + e.dauer, 0);
  res.json({ total, billable });
});

router.post('/', async (req: AuthRequest, res) => {
  const { datum, taetigkeit, dauer, stundenansatz, verrechenbar, dossierId } = req.body;
  const entry = await prisma.timeEntry.create({
    data: {
      datum: new Date(datum),
      taetigkeit, dauer, stundenansatz,
      verrechenbar: verrechenbar ?? true,
      dossierId, userId: req.user!.id,
    },
    include: {
      dossier: { include: { client: true } },
      user: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } },
    },
  });
  res.status(201).json(entry);
});

router.put('/:id', async (req: AuthRequest, res) => {
  const { datum, taetigkeit, dauer, stundenansatz, verrechenbar } = req.body;
  const entry = await prisma.timeEntry.update({
    where: { id: req.params.id },
    data: { datum: datum ? new Date(datum) : undefined, taetigkeit, dauer, stundenansatz, verrechenbar },
    include: {
      dossier: { include: { client: true } },
      user: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } },
    },
  });
  res.json(entry);
});

router.delete('/:id', async (req, res) => {
  await prisma.timeEntry.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
