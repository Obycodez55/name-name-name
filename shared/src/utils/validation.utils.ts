import { GAME_CONSTANTS } from "../constants/game.constants";

export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '');
}

export function validateAnswerFormat(answer: string, letter: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!answer || answer.trim().length === 0) {
    errors.push('Answer cannot be empty');
  }
  
  if (answer.length > GAME_CONSTANTS.MAX_ANSWER_LENGTH) {
    errors.push(`Answer too long (max ${GAME_CONSTANTS.MAX_ANSWER_LENGTH} characters)`);
  }
  
  const normalized = normalizeAnswer(answer);
  if (normalized.length > 0 && !normalized.startsWith(letter.toLowerCase())) {
    errors.push(`Answer must start with letter "${letter.toUpperCase()}"`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateAnswerScore(
  answer: string,
  isValid: boolean,
  isUnique: boolean
): number {
  if (!isValid || !answer.trim()) {
    return GAME_CONSTANTS.POINTS_INVALID_ANSWER;
  }
  
  return isUnique 
    ? GAME_CONSTANTS.POINTS_UNIQUE_ANSWER 
    : GAME_CONSTANTS.POINTS_VALID_ANSWER;
}
