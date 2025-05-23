import { Player as SharedPlayer, PlayerRole, PlayerStatus } from '@name-name-name/shared';

export interface PlayerData extends SharedPlayer {
  socketId?: string;
  connectionId?: string;
}

export interface PlayerConnection {
  socketId: string;
  playerId: string;
  roomCode: string;
  connectedAt: Date;
  lastActivity: Date;
}