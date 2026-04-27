import { Router } from 'express';
import * as controllers from '../controllers';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// ── Auth ──────────────────────────────────────────────────────
// Routes publiques — pas besoin de token
router.post('/auth/register', controllers.register);
router.post('/auth/login', controllers.login);

// Route protégée — token obligatoire
router.get('/auth/me', authMiddleware, controllers.getMe);

// ── Frets ─────────────────────────────────────────────────────
// Tout le monde connecté peut voir les frets
router.get('/frets', authMiddleware, controllers.getAllFrets);
router.get('/frets/mes-frets', authMiddleware, controllers.getMesFrets);
router.get('/frets/:id', authMiddleware, controllers.getFretById);

// Seuls les transitaires et admins peuvent créer
router.post(
  '/frets',
  authMiddleware,
  requireRole('TRANSITAIRE', 'ADMIN'),
  controllers.createFret,
);

// Modifier le statut
router.put(
  '/frets/:id',
  authMiddleware,
  controllers.updateStatutFret,
);

// Supprimer
router.delete(
  '/frets/:id',
  authMiddleware,
  controllers.deleteFret,
);

// ── Fichiers (upload) ─────────────────────────────────────────
router.post(
  '/frets/:fretId/fichiers',
  authMiddleware,
  upload.single('fichier'),
  controllers.uploadFichier,
);

router.get(
  '/frets/:fretId/fichiers',
  authMiddleware,
  controllers.getFichiers,
);

router.delete(
  '/fichiers/:id',
  authMiddleware,
  controllers.deleteFichier,
);

export default router;
