import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const packages = await prisma.legalPackage.findMany({
    include: { templates: true, _count: { select: { templates: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(packages);
});

router.get('/:id', async (req, res) => {
  const pkg = await prisma.legalPackage.findUnique({
    where: { id: req.params.id },
    include: { templates: true },
  });
  if (!pkg) { res.status(404).json({ error: 'Paket nicht gefunden' }); return; }
  res.json(pkg);
});

router.put('/:id/toggle', async (req, res) => {
  const pkg = await prisma.legalPackage.findUnique({ where: { id: req.params.id } });
  if (!pkg) { res.status(404).json({ error: 'Paket nicht gefunden' }); return; }
  const updated = await prisma.legalPackage.update({
    where: { id: req.params.id },
    data: { aktiv: !pkg.aktiv },
    include: { templates: true },
  });
  res.json(updated);
});

router.get('/:id/templates', async (req, res) => {
  const templates = await prisma.packageTemplate.findMany({
    where: { packageId: req.params.id },
  });
  res.json(templates);
});

export default router;
