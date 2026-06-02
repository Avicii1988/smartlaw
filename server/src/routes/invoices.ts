import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function generateInvoiceNumber() {
  const now = new Date();
  return `RE-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
}

router.get('/', async (req, res) => {
  const { status, dossierId, clientId } = req.query;
  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(dossierId && { dossierId: dossierId as string }),
      ...(clientId && { clientId: clientId as string }),
    },
    include: {
      dossier: { select: { id: true, titel: true, rechtsgebiet: true } },
      client: { select: { id: true, vorname: true, nachname: true, firma: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(invoices);
});

router.get('/:id', async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: {
      dossier: true,
      client: true,
      items: { include: { timeEntry: true } },
    },
  });
  if (!invoice) { res.status(404).json({ error: 'Rechnung nicht gefunden' }); return; }
  res.json(invoice);
});

router.post('/', async (req, res) => {
  const { dossierId, clientId, faelligkeitsdatum, mwst, items } = req.body;
  const betrag = items.reduce((sum: number, item: any) => sum + item.total, 0);
  const invoice = await prisma.invoice.create({
    data: {
      nummer: generateInvoiceNumber(),
      faelligkeitsdatum: new Date(faelligkeitsdatum),
      betrag, mwst: mwst ?? 7.7,
      dossierId, clientId,
      items: { create: items },
    },
    include: {
      dossier: true, client: true,
      items: { include: { timeEntry: true } },
    },
  });
  res.status(201).json(invoice);
});

router.post('/from-time-entries', async (req, res) => {
  const { dossierId, timeEntryIds, faelligkeitsdatum } = req.body;
  const dossier = await prisma.dossier.findUnique({
    where: { id: dossierId },
    include: { client: true },
  });
  if (!dossier) { res.status(404).json({ error: 'Dossier nicht gefunden' }); return; }

  const entries = await prisma.timeEntry.findMany({
    where: { id: { in: timeEntryIds }, verrechenbar: true },
  });

  const items = entries.map(e => ({
    beschreibung: e.taetigkeit,
    menge: e.dauer,
    einheit: 'h',
    einzelpreis: e.stundenansatz,
    total: e.dauer * e.stundenansatz,
    timeEntryId: e.id,
  }));

  const betrag = items.reduce((sum, i) => sum + i.total, 0);
  const invoice = await prisma.invoice.create({
    data: {
      nummer: generateInvoiceNumber(),
      faelligkeitsdatum: new Date(faelligkeitsdatum),
      betrag, mwst: 7.7,
      dossierId, clientId: dossier.clientId,
      items: { create: items },
    },
    include: { dossier: true, client: true, items: true },
  });
  res.status(201).json(invoice);
});

router.put('/:id', async (req, res) => {
  const { status, faelligkeitsdatum } = req.body;
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status, faelligkeitsdatum: faelligkeitsdatum ? new Date(faelligkeitsdatum) : undefined },
  });
  res.json(invoice);
});

router.delete('/:id', async (req, res) => {
  await prisma.invoice.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
