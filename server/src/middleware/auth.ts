import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@smartlaw/shared';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: UserRole };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Nicht authentifiziert' });
    return;
  }
  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string; email: string; role: UserRole;
    };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Ungültiges Token' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Keine Berechtigung' });
      return;
    }
    next();
  };
}
