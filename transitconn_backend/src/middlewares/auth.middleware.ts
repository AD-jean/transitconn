import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Récupère le token dans le header
  // Format attendu : "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token manquant' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Vérifie et décode le token
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
    req.user = decoded;
    next(); // Token valide → on passe à la route
  } catch {
    res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
}

// Vérifie que l'utilisateur a le bon rôle
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Accès refusé' });
      return;
    }
    next();
  };
}