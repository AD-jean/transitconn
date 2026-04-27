import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} introuvable`,
  });
}

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Erreur personnalisée AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Erreur PostgreSQL — email déjà utilisé
  if ((err as any).code === '23505') {
    res.status(400).json({
      success: false,
      message: 'Cette valeur existe déjà',
    });
    return;
  }

  // Erreur inconnue
  console.error('[ERROR]', err);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'development' ? err.message : 'Erreur serveur',
  });
}