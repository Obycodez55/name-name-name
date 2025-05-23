import { Room, Player, GameConfig } from '@name-name-name/shared';

export interface CreateRoomResult {
  room: Room;
  player: Player;
}

export interface JoinRoomResult {
  room: Room;
  player: Player;
  gameState?: any;
}

export interface RoomListItem {
  code: string;
  name?: string;
  playerCount: number;
  maxPlayers: number;
  isGameActive: boolean;
  canJoin: boolean;
  categories: string[];
  createdAt: Date;
}