export interface WebSocketEventPayload<T = any> {
  event: string;
  payload: T;
  roomCode?: string;
  playerId?: string;
  timestamp: Date;
}

export interface ConnectionData {
  socketId: string;
  playerId?: string;
  roomCode?: string;
  connectedAt: Date;
  lastActivity: Date;
}

export interface RoomBroadcastData {
  roomCode: string;
  event: string;
  data: any;
  excludePlayer?: string;
}