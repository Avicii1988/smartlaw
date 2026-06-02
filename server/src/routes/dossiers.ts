import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { status, rechtsgebiet, anwaltId, clientId } = req.query;
  const dossiers = await prisma.dossier.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(rechtsgebiet && { rechtsgebiet: rechtsgebiet as any }),
      ...(anwaltId && { anwaltId: anwaltId as string }),
      ...(clientId && { clientId: clientId as string }),
    },
    include: {
      client: true,
      anwalt: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } },
      _count: { select: { timeEntries: true, documents: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(dossiers);
});

router.get('/:id', async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: req.params.id },
    include: {
      client: true,
      anwalt: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } },
      tasks: {
        include: { assignee: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } } },
        orderBy: { faellig: 'asc' },
      },
      timeEntries: {
        include: { user: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } } },
        orderBy: { datum: 'desc' },
        take: 10,
      },
      documents: {
        include: { uploadedBy: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } } },
        orderBy: { createdAt: 'desc' },
      },
      honorarVereinbarung: true,
      _count: { select: { timeEntries: true, documents: true } },
    },
  });
  if (!dossier) { res.status(404).json({ error: 'Dossier nicht gefunden' }); return; }
  res.json(dossier);
});

router.post('/', async (req, res) => {
  const { titel, rechtsgebiet, status, frist, notizen, clientId, anwaltId } = req.body;
  const dossier = await prisma.dossier.create({
    data: {
      titel, rechtsgebiet, status: status || 'OFFEN',
      frist: frist ? new Date(frist) : undefined,
      notizen, clientId, anwaltId,
    },
    include: { client: true, anwalt: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } } },
  });
  res.status(201).json(dossier);
});

router.put('/:id', async (req, res) => {
  const { titel, rechtsgebiet, status, frist, notizen, anwaltId } = req.body;
  const dossier = await prisma.dossier.update({
    where: { id: req.params.id },
    data: {
      titel, rechtsgebiet, status,
      frist: frist ? new Date(frist) : null,
      notizen, anwaltId,
    },
    include: { client: true, anwalt: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } } },
  });
  res.json(dossier);
});

router.delete('/:id', async (req, res) => {
  await prisma.dossier.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Tasks
router.get('/:id/tasks', async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { dossierId: req.params.id },
    include: { assignee: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } } },
    orderBy: { faellig: 'asc' },
  });
  res.json(tasks);
});

router.post('/:id/tasks', async (req, res) => {
  const { titel, beschreibung, status, faellig, assigneeId } = req.body;
  const task = await prisma.task.create({
    data: {
      titel, beschreibung, status: status || 'OFFEN',
      faellig: faellig ? new Date(faellig) : undefined,
      dossierId: req.params.id, assigneeId,
    },
  });
  res.status(201).json(task);
});

router.put('/:id/tasks/:taskId', async (req, res) => {
  const { titel, beschreibung, status, faellig, assigneeId } = req.body;
  const task = await prisma.task.update({
    where: { id: req.params.taskId },
    data: { titel, beschreibung, status, faellig: faellig ? new Date(faellig) : null, assigneeId },
  });
  res.json(task);
});

router.delete('/:id/tasks/:taskId', async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.taskId } });
  res.status(204).send();
});

export default router;
