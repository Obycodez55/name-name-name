import { Socket } from 'socket.io';

export interface SocketWithData extends Socket {
  playerId?: string;
  playerName?: string;
  roomCode?: string;
  joinedAt?: Date;
  lastActivity?: Date;
}