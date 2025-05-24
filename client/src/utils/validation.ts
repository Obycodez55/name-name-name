import { GAME_CONSTANTS } from '@name-name-name/shared';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AnswerValidationResult extends ValidationResult {
  startsWithLetter: boolean;
  isAppropriateLength: boolean;
  containsInvalidChars: boolean;
}

// Room code validation
export function validateRoomCode(roomCode: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!roomCode || roomCode.trim().length === 0) {
    errors.push('Room code is required');
  } else {
    if (roomCode.length !== GAME_CONSTANTS.ROOM_CODE_LENGTH) {
      errors.push(`Room code must be ${GAME_CONSTANTS.ROOM_CODE_LENGTH} characters long`);
    }

    if (!/^[A-Z0-9]+$/.test(roomCode)) {
      errors.push('Room code can only contain letters and numbers');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Player name validation
export function validatePlayerName(name: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Player name is required');
  } else {
    if (name.trim().length < 2) {
      errors.push('Player name must be at least 2 characters long');
    }

    if (name.length > GAME_CONSTANTS.MAX_PLAYER_NAME_LENGTH) {
      errors.push(`Player name must be no more than ${GAME_CONSTANTS.MAX_PLAYER_NAME_LENGTH} characters long`);
    }

    if (/^\s/.test(name) || /\s$/.test(name)) {
      warnings.push('Player name should not start or end with spaces');
    }

    if (/[<>\"'&]/.test(name)) {
      errors.push('Player name contains invalid characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Answer validation
export function validateAnswer(answer: string, letter: string, category: string): AnswerValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const trimmedAnswer = answer.trim();
  const normalizedAnswer = trimmedAnswer.toLowerCase();
  const normalizedLetter = letter.toLowerCase();

  // Check if answer exists
  if (!trimmedAnswer) {
    return {
      isValid: false,
      errors: ['Answer cannot be empty'],
      warnings: [],
      startsWithLetter: false,
      isAppropriateLength: false,
      containsInvalidChars: false,
    };
  }

  // Check length
  const isAppropriateLength = trimmedAnswer.length <= GAME_CONSTANTS.MAX_ANSWER_LENGTH;
  if (!isAppropriateLength) {
    errors.push(`Answer must be no more than ${GAME_CONSTANTS.MAX_ANSWER_LENGTH} characters long`);
  }

  // Check if starts with correct letter
  const startsWithLetter = normalizedAnswer.startsWith(normalizedLetter);
  if (!startsWithLetter) {
    errors.push(`Answer must start with the letter "${letter.toUpperCase()}"`);
  }

  // Check for invalid characters (basic check)
  const containsInvalidChars = /[<>\"'&%$#@!]/.test(trimmedAnswer);
  if (containsInvalidChars) {
    errors.push('Answer contains invalid characters');
  }

  // Category-specific validation hints
  if (startsWithLetter && isAppropriateLength && !containsInvalidChars) {
    switch (category.toLowerCase()) {
      case 'animals':
        if (/\d/.test(trimmedAnswer)) {
          warnings.push('Animal names usually don\'t contain numbers');
        }
        break;
      case 'foods':
        if (trimmedAnswer.length < 3) {
          warnings.push('Very short food names might not be valid');
        }
        break;
      case 'places':
      case 'cities':
      case 'countries':
        if (!/^[A-Z]/.test(trimmedAnswer)) {
          warnings.push('Place names should typically be capitalized');
        }
        break;
      case 'movies':
      case 'books':
        if (trimmedAnswer.length < 2) {
          warnings.push('Very short titles might not be valid');
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    startsWithLetter,
    isAppropriateLength,
    containsInvalidChars,
  };
}

// Email validation (if user accounts are added later)
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Game configuration validation
export function validateGameConfig(config: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.maxPlayers < GAME_CONSTANTS.MIN_PLAYERS) {
    errors.push(`Game must have at least ${GAME_CONSTANTS.MIN_PLAYERS} players`);
  }

  if (config.maxPlayers > GAME_CONSTANTS.MAX_PLAYERS) {
    errors.push(`Game cannot have more than ${GAME_CONSTANTS.MAX_PLAYERS} players`);
  }

  if (config.roundTimeLimit < GAME_CONSTANTS.MIN_ROUND_TIME) {
    errors.push(`Round time must be at least ${GAME_CONSTANTS.MIN_ROUND_TIME} seconds`);
  }

  if (config.roundTimeLimit > GAME_CONSTANTS.MAX_ROUND_TIME) {
    errors.push(`Round time cannot exceed ${GAME_CONSTANTS.MAX_ROUND_TIME} seconds`);
  }

  if (!config.categories || config.categories.length < 3) {
    errors.push('Game must have at least 3 categories');
  }

  if (config.categories && config.categories.length > 10) {
    warnings.push('Games with more than 10 categories might take very long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Utility function to sanitize input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

// Utility function to normalize answers for comparison
export function normalizeAnswerForComparison(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize spaces
}
