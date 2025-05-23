import { Round as SharedRound } from '@name-name-name/shared';

export interface RoundData extends SharedRound {
  // Additional backend-specific properties
  submissionOrder?: string[];
  validationStartTime?: Date;
  allAnswersSubmitted?: boolean;
  processingAnswers?: boolean;
}

export interface RoundSummary {
  roundNumber: number;
  letter: string;
  categories: string[];
  participantCount: number;
  totalAnswers: number;
  validAnswers: number;
  uniqueAnswers: number;
  roundDuration: number;
  topScorer?: {
    playerId: string;
    playerName: string;
    score: number;
  };
}