import { query } from "../config/database";
import { AppError } from "../middlewares/error.middleware";


interface Fichier {
    id: string;
    fret_id: string;
    user_id: string;
    nom: string;
    chemin: string;
    taille: number;
    created_at: Date;
}

export async function saveFichier(
    fretId: string,
    userId: string,
    file: Express.Multer.File,
): Promise<Fichier> {
    const result = await query<Fichier>(
        `INSERT INTO fichiers (fret_id, user_id, nom, chemin, taille)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [fretId, userId, file.originalname, file.filename, file.size]
    );
    return result.rows[0];
}

export async function getFichiersByFret(fretId: string): Promise<Fichier[]> {
    const result = await query<Fichier>(
        `SELECT * FROM fichiers
        WHERE fret_id = $1
        ORDER BY created_at DESC`,
        [fretId]
    );
    return result.rows;
}

export async function deleteFichier(
    id: string,
    userId: string,
): Promise<void> {
    const result = await query<Fichier>(
        'SELECT * FROM fichiers WHERE id = $1',
        [id]
    );

    if (!result.rowCount || result.rowCount === 0) {
        throw new AppError('Fichier non trouvé', 404);
    }

    const fichier = result.rows[0];

    if (fichier.user_id !== userId) {
        throw new AppError('Vous n\'avez pas le droit de supprimer ce fichier', 403);
    }

    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(process.env['UPLOAD_DIR'] ?? 'uploads', fichier.chemin);

    if(fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await query(
        'DELETE FROM fichiers WHERE id = $1',
        [id]
    );
}