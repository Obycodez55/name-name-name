import { PlayerAnswers, AnswerValidation } from '@name-name-name/shared';

export interface AnswerData extends PlayerAnswers {
  processingStatus?: 'pending' | 'validating' | 'completed';
  validationResults?: Record<string, AnswerValidation>;
  score?: number;
}

export interface AnswerSubmissionResult {
  playerId: string;
  submittedAt: Date;
  isComplete: boolean;
  validAnswerCount: number;
  invalidAnswerCount: number;
  emptyAnswerCount: number;
}
