import { query } from '../config/database';
import { Fret } from '../types';
import { AppError } from '../middlewares/error.middleware';

export async function getAllFrets(): Promise<Fret[]> {
  const result = await query<Fret>(
    `SELECT f.*, u.nom as user_nom, u.email as user_email
     FROM frets f
     JOIN users u ON f.user_id = u.id
     ORDER BY f.created_at DESC`
  );
  return result.rows;
}

export async function getFretById(id: string): Promise<Fret> {
  const result = await query<Fret>(
    `SELECT f.*, u.nom as user_nom, u.email as user_email
     FROM frets f
     JOIN users u ON f.user_id = u.id
     WHERE f.id = $1`,
    [id]
  );

  if (!result.rowCount || result.rowCount === 0) {
    throw new AppError('Fret introuvable', 404);
  }

  return result.rows[0];
}

export async function createFret(
  description: string,
  poids: number,
  origine: string,
  destination: string,
  userId: string,
): Promise<Fret> {
  const result = await query<Fret>(
    `INSERT INTO frets (description, poids, origine, destination, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [description, poids, origine, destination, userId]
  );

  return result.rows[0];
}

export async function updateStatutFret(
  id: string,
  statut: string,
  userId: string,
): Promise<Fret> {
  // Vérifier que le fret appartient à l'utilisateur
  const fret = await getFretById(id);

  if (fret.user_id !== userId) {
    throw new AppError('Non autorisé', 403);
  }

  const result = await query<Fret>(
    `UPDATE frets SET statut = $1
     WHERE id = $2
     RETURNING *`,
    [statut, id]
  );

  return result.rows[0];
}

export async function deleteFret(
  id: string,
  userId: string,
): Promise<void> {
  const fret = await getFretById(id);

  if (fret.user_id !== userId) {
    throw new AppError('Non autorisé', 403);
  }

  await query('DELETE FROM frets WHERE id = $1', [id]);
}

export async function getFretsByUser(userId: string): Promise<Fret[]> {
  const result = await query<Fret>(
    `SELECT * FROM frets
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}