import { Player } from "./room.types";

export enum GamePhase {
  WAITING = 'waiting',
  LETTER_SELECTION = 'letter_selection',
  PLAYING = 'playing',
  VALIDATION = 'validation',
  SCORING = 'scoring',
  ROUND_RESULTS = 'round_results',
  GAME_ENDED = 'game_ended'
}

export enum ValidationMode {
  DICTIONARY = 'dictionary',
  VOTING = 'voting',
  AI = 'ai',
  HYBRID = 'hybrid'
}

export enum LetterSelectionMode {
  RANDOM = 'random',
  PLAYER_CHOICE = 'player_choice',
  ROUND_ROBIN = 'round_robin'
}

export interface GameConfig {
  maxPlayers: number;
  roundTimeLimit: number; // seconds
  validationMode: ValidationMode;
  letterSelectionMode: LetterSelectionMode;
  categories: string[];
  maxRounds?: number;
  enableChat: boolean;
  allowSpectators: boolean;
}

export interface Round {
  roundNumber: number;
  letter: string;
  categories: string[];
  timeLimit: number;
  startTime: Date;
  endTime?: Date;
  roundMasterId: string;
  answers: Record<string, PlayerAnswers>; // playerId -> answers
  scores: Record<string, number>; // playerId -> round score
  validationResults?: ValidationResults;
}

export interface PlayerAnswers {
  playerId: string;
  answers: Record<string, string>; // category -> answer
  submittedAt: Date;
  isComplete: boolean;
}

export interface ValidationResults {
  [playerId: string]: {
    [category: string]: AnswerValidation;
  };
}

export interface AnswerValidation {
  answer: string;
  isValid: boolean;
  validationMethod: ValidationMode;
  confidence?: number; // 0-1 for AI validation
  votes?: ValidationVote[];
  reason?: string;
}

export interface ValidationVote {
  voterId: string;
  isValid: boolean;
  timestamp: Date;
}

export interface GameState {
  gameId: string;
  roomCode: string;
  phase: GamePhase;
  config: GameConfig;
  currentRound?: Round;
  rounds: Round[];
  players: Record<string, Player>;
  scores: Record<string, number>; // playerId -> total score
  roundMasterRotation: string[]; // player IDs
  currentRoundMasterIndex: number;
  gameStartTime?: Date;
  gameEndTime?: Date;
  winner?: string;
  isActive: boolean;
}

export interface ScoreBreakdown {
  playerId: string;
  playerName: string;
  roundScores: number[];
  totalScore: number;
  validAnswers: number;
  uniqueAnswers: number;
  rank: number;
}