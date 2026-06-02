import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    return;
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      vorname: user.vorname,
      nachname: user.nachname,
      role: user.role,
      stundenansatz: user.stundenansatz,
    },
  });
});

router.post('/register', async (req, res) => {
  const { email, password, vorname, nachname, role, stundenansatz } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    res.status(400).json({ error: 'E-Mail bereits vergeben' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, vorname, nachname, role, stundenansatz: stundenansatz || 250 },
  });
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      vorname: user.vorname,
      nachname: user.nachname,
      role: user.role,
      stundenansatz: user.stundenansatz,
    },
  });
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) { res.status(404).json({ error: 'Benutzer nicht gefunden' }); return; }
  res.json({
    id: user.id, email: user.email, vorname: user.vorname,
    nachname: user.nachname, role: user.role, stundenansatz: user.stundenansatz,
  });
});

export default router;
