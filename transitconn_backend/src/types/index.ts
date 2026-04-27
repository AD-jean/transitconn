export type Role = 'ADMIN' | 'TRANSPORTEUR' | 'TRANSITAIRE';

export type Statut = 'EN_ATTENTE' | 'EN_COURS' | 'LIVRE' | 'ANNULE';

export interface User {
  id: string;
  nom: string;
  email: string;
  password: string;
  role: Role;
  telephone?: string;
  created_at: Date;
}

export interface Fret {
  id: string;
  description: string;
  poids: number;
  origine: string;
  destination: string;
  statut: Statut;
  user_id: string;
  created_at: Date;
}

export interface Demande {
  id: string;
  fret_id: string;
  transporteur_id: string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
  message?: string;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  lu: boolean;
  created_at: Date;
}

// Ce que JWT met dans le token
export interface JwtPayload {
  userId: string;
  role: Role;
}

// Extension du type Request d'Express
// pour ajouter l'utilisateur connecté
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}