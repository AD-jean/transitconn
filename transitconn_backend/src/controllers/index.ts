import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import * as fretsService from '../services/frets.service';
import * as uploadService from '../services/upload.service';
import { AppError } from '../middlewares/error.middleware';

// ── Auth ──────────────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { nom, email, password, role, telephone } = req.body;
    const result = await authService.register(
      nom, email, password, role, telephone
    );
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
): Promise<void> {
  res.json({ success: true, user: req.user });
}

// ── Frets ─────────────────────────────────────────────────────

export async function getAllFrets(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const frets = await fretsService.getAllFrets();
    res.json({ success: true, data: frets });
  } catch (err) {
    next(err);
  }
}

export async function getFretById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const fret = await fretsService.getFretById(id);
    res.json({ success: true, data: fret });
  } catch (err) {
    next(err);
  }
}

export async function createFret(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { description, poids, origine, destination } = req.body;
    const fret = await fretsService.createFret(
      description, poids, origine, destination, req.user!.userId
    );
    res.status(201).json({ success: true, data: fret });
  } catch (err) {
    next(err);
  }
}

export async function updateStatutFret(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const fret = await fretsService.updateStatutFret(
      id, req.body.statut, req.user!.userId
    );
    res.json({ success: true, data: fret });
  } catch (err) {
    next(err);
  }
}

export async function deleteFret(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    await fretsService.deleteFret(id, req.user!.userId);
    res.json({ success: true, message: 'Fret supprimé' });
  } catch (err) {
    next(err);
  }
}

export async function getMesFrets(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const frets = await fretsService.getFretsByUser(req.user!.userId);
    res.json({ success: true, data: frets });
  } catch (err) {
    next(err);
  }
}

// ── Uploads ─────────────────────────────────────────────────────

export async function uploadFichier(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }
    const fretId = req.params.fretId as string;
    const fichier = await uploadService.saveFichier(
      fretId, 
      req.user!.userId, 
      req.file,
    );
    res.status(201).json({ success: true, data: fichier });
  } catch (err) {
    next(err);
  }
}


export async function getFichiers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const fretId = req.params.fretId as string;
    const fichiers = await uploadService.getFichiersByFret(fretId);
    res.json({ success: true, data: fichiers });
  } catch (err) {
    next(err);
  }
}

export async function deleteFichier(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    await uploadService.deleteFichier(id, req.user!.userId);
    res.json({ success: true, message: 'Fichier supprimé' });
  } catch (err) {
    next(err);
  }
}
