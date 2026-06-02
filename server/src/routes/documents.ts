import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: './src/uploads',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  const { dossierId } = req.query;
  const docs = await prisma.document.findMany({
    where: dossierId ? { dossierId: dossierId as string } : undefined,
    include: { uploadedBy: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(docs);
});

router.post('/upload', upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'Keine Datei hochgeladen' }); return; }
  const { dossierId } = req.body;
  const doc = await prisma.document.create({
    data: {
      name: req.file.originalname,
      typ: path.extname(req.file.originalname).slice(1).toUpperCase() || 'SONSTIGES',
      groesse: req.file.size,
      path: req.file.filename,
      dossierId,
      uploadedById: req.user!.id,
    },
    include: { uploadedBy: { select: { id: true, vorname: true, nachname: true, email: true, role: true, stundenansatz: true } } },
  });
  res.status(201).json(doc);
});

router.get('/:id/download', async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) { res.status(404).json({ error: 'Dokument nicht gefunden' }); return; }
  res.download(path.resolve('./src/uploads', doc.path), doc.name);
});

router.put('/:id/signature', async (req, res) => {
  const { signaturStatus } = req.body;
  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: { signaturStatus },
  });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  await prisma.document.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
