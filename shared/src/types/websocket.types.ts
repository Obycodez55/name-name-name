export interface WebSocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface WebSocketEvent<T = any> {
  event: string;
  payload: T;
  roomCode?: string;
  playerId?: string;
  timestamp: Date;
}

// Client to Server Events
export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
  avatar?: string;
}

export interface LeaveRoomPayload {
  roomCode: string;
  playerId: string;
}

export interface SelectLetterPayload {
  roomCode: string;
  playerId: string;
  letter: string;
}

export interface SubmitAnswersPayload {
  roomCode: string;
  playerId: string;
  answers: Record<string, string>; // category -> answer
}

export interface VoteOnAnswerPayload {
  roomCode: string;
  voterId: string;
  targetPlayerId: string;
  category: string;
  answer: string;
  isValid: boolean;
}

export interface StartRoundPayload {
  roomCode: string;
  playerId: string;
}

export interface ChatMessagePayload {
  roomCode: string;
  playerId: string;
  message: string;
  type: 'chat' | 'system' | 'game';
}