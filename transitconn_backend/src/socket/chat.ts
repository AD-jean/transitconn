import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

// Stocke les utilisateurs connectés
// clé = userId, valeur = socketId
const connectedUsers = new Map<string, string>();

export function initSocket(httpServer: HttpServer): void {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ['GET', 'POST'],
    },
  });

  // Middleware Socket.io — vérifie le token JWT
  io.use((socket: Socket, next) => {
    console.log('[Socket] Tentative de connexion...');
    console.log('[Socket] Token recu:', socket.handshake.auth.token);
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token manquant'));
    }

    try {
      const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
      // Attache l'utilisateur au socket
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as JwtPayload;
    console.info(`[Socket] Connecté: ${user.userId}`);

    // Enregistre l'utilisateur comme connecté
    connectedUsers.set(user.userId, socket.id);

    // Rejoindre une room de fret
    // Le client envoie l'id du fret pour rejoindre sa room
    socket.on('join_fret', (fretId: string) => {
      socket.join(`fret_${fretId}`);
      console.info(`[Socket] ${user.userId} a rejoint fret_${fretId}`);
    });

    // Envoyer un message dans une room de fret
    socket.on('send_message', (data: {
      fretId: string;
      message: string;
    }) => {
      const messageData = {
        userId: user.userId,
        role: user.role,
        message: data.message,
        timestamp: new Date().toISOString(),
      };

      // Envoie le message à tous dans la room
      io.to(`fret_${data.fretId}`).emit('new_message', messageData);
      console.info(`[Socket] Message dans fret_${data.fretId}:`, data.message);
    });

    // Notification en temps réel
    socket.on('send_notification', (data: {
      toUserId: string;
      message: string;
    }) => {
      const targetSocketId = connectedUsers.get(data.toUserId);

      if (targetSocketId) {
        // Envoie uniquement à l'utilisateur ciblé
        io.to(targetSocketId).emit('new_notification', {
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      connectedUsers.delete(user.userId);
      console.info(`[Socket] Déconnecté: ${user.userId}`);
    });
  });
}