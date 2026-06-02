import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { search } = req.query;
  const clients = await prisma.client.findMany({
    where: search ? {
      OR: [
        { vorname: { contains: search as string, mode: 'insensitive' } },
        { nachname: { contains: search as string, mode: 'insensitive' } },
        { firma: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ],
    } : undefined,
    include: { _count: { select: { dossiers: true } } },
    orderBy: { nachname: 'asc' },
  });
  res.json(clients);
});

router.get('/:id', async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id },
    include: {
      dossiers: {
        include: { anwalt: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { dossiers: true } },
    },
  });
  if (!client) { res.status(404).json({ error: 'Mandant nicht gefunden' }); return; }
  res.json(client);
});

router.post('/', async (req, res) => {
  const { vorname, nachname, firma, typ, email, telefon, strasse, plz, ort, land } = req.body;
  const client = await prisma.client.create({
    data: { vorname, nachname, firma, typ, email, telefon, strasse, plz, ort, land: land || 'Schweiz' },
  });
  res.status(201).json(client);
});

router.put('/:id', async (req, res) => {
  const { vorname, nachname, firma, typ, email, telefon, strasse, plz, ort, land } = req.body;
  const client = await prisma.client.update({
    where: { id: req.params.id },
    data: { vorname, nachname, firma, typ, email, telefon, strasse, plz, ort, land },
  });
  res.json(client);
});

router.delete('/:id', async (req, res) => {
  await prisma.client.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
