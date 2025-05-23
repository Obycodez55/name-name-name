import { GameConfig, GameState } from "./game.types";

export enum PlayerRole {
  CREATOR = 'creator',
  PLAYER = 'player',
  SPECTATOR = 'spectator'
}

export enum PlayerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  DISCONNECTED = 'disconnected',
  TYPING = 'typing'
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  status: PlayerStatus;
  joinedAt: Date;
  lastActiveAt: Date;
  isReady: boolean;
  avatar?: string;
  connectionId?: string;
}

export interface Room {
  code: string;
  name?: string;
  creatorId: string;
  players: Record<string, Player>;
  config: GameConfig;
  gameState?: GameState;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  currentPlayerCount: number;
  spectatorCount: number;
}

export interface RoomSummary {
  code: string;
  name?: string;
  playerCount: number;
  maxPlayers: number;
  isGameActive: boolean;
  canJoin: boolean;
  categories: string[];
}