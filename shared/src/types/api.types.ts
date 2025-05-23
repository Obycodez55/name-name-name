import { GameConfig, GameState, ValidationMode } from "./game.types";
import { Player, Room } from "./room.types";
import { ValidationResult } from "./validation.types";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface CreateRoomRequest {
  creatorName: string;
  config: Partial<GameConfig>;
  roomName?: string;
}

export interface CreateRoomResponse {
  room: Room;
  player: Player;
}

export interface JoinRoomRequest {
  playerName: string;
  avatar?: string;
}

export interface JoinRoomResponse {
  room: Room;
  player: Player;
  gameState?: GameState;
}

export interface GetRoomResponse {
  room: Room;
  gameState?: GameState;
}

export interface ValidateAnswerRequest {
  answer: string;
  category: string;
  letter: string;
  validationMode: ValidationMode;
  config?: Record<string, any>;
}

export interface ValidateAnswerResponse {
  result: ValidationResult;
}

export interface GetGameHistoryResponse {
  games: Array<{
    gameId: string;
    roomCode: string;
    playerCount: number;
    rounds: number;
    winner: string;
    duration: number;
    completedAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
}
