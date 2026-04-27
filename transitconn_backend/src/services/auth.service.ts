import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { env } from '../config/env';
import { User, JwtPayload } from '../types';
import { AppError } from '../middlewares/error.middleware';

export async function register(
  nom: string,
  email: string,
  password: string,
  role: string,
  telephone?: string,
): Promise<{ token: string; user: Omit<User, 'password'> }> {
  // Vérifier si l'email existe déjà
  const exists = await query<User>(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (exists.rowCount && exists.rowCount > 0) {
    throw new AppError('Email déjà utilisé', 400);
  }

  // Chiffrer le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12);

  // Créer l'utilisateur
  const result = await query<User>(
    `INSERT INTO users (nom, email, password, role, telephone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nom, email, role, telephone, created_at`,
    [nom, email, hashedPassword, role, telephone]
  );

  const user = result.rows[0];

  // Créer le token JWT
  const payload: JwtPayload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as any,
  });

  return { token, user };
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: Omit<User, 'password'> }> {
  // Chercher l'utilisateur
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (!result.rowCount || result.rowCount === 0) {
    throw new AppError('Identifiants invalides', 401);
  }

  const user = result.rows[0];

  // Vérifier le mot de passe
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Identifiants invalides', 401);
  }

  // Créer le token JWT
  const payload: JwtPayload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as any,
  });

  // Retourner sans le mot de passe
  const { password: _, ...userSansPassword } = user;
  return { token, user: userSansPassword };
}