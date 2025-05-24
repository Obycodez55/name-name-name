import { Player, ScoreBreakdown } from '@name-name-name/shared';

export interface RoundScoreData {
  playerId: string;
  playerName: string;
  answers: Record<string, AnswerScore>;
  totalScore: number;
  validAnswers: number;
  uniqueAnswers: number;
  emptyAnswers: number;
  invalidAnswers: number;
}

export interface AnswerScore {
  category: string;
  answer: string;
  isValid: boolean;
  isUnique: boolean;
  points: number;
  reason: string;
}

export interface ScoringResult {
  roundScores: Record<string, number>;
  detailedScores: Record<string, RoundScoreData>;
  summary: {
    totalPlayers: number;
    totalAnswers: number;
    validAnswers: number;
    uniqueAnswers: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
}