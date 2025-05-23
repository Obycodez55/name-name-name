import { GameConfig, ValidationMode } from "./game.types";

export interface ValidationStrategy {
  type: ValidationMode;
  name: string;
  description: string;
  config?: Record<string, any>;
}

export interface ValidationRequest {
  id: string;
  answer: string;
  category: string;
  playerId: string;
  strategy: ValidationMode;
  context?: {
    letter: string;
    roundNumber: number;
    gameConfig: GameConfig;
  };
}

export interface ValidationResult {
  requestId: string;
  answer: string;
  category: string;
  isValid: boolean;
  confidence: number; // 0-1
  method: ValidationMode;
  reason?: string;
  suggestions?: string[];
  processingTime: number; // milliseconds
  metadata?: Record<string, any>;
}

export interface DictionaryValidationConfig {
  dictionaries: string[]; // list of dictionary names
  strictMode: boolean;
  allowProperNouns: boolean;
  minWordLength: number;
}

export interface AIValidationConfig {
  provider: string; // 'openai', 'anthropic', etc.
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface VotingValidationConfig {
  requiredVotes: number;
  votingTimeLimit: number; // seconds
  majorityThreshold: number; // 0-1 (e.g., 0.6 for 60%)
  allowSelfVoting: boolean;
}
