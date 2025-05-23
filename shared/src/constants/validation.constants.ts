import { ValidationMode } from "../types/game.types";

export const VALIDATION_CONSTANTS = {
  STRATEGIES: {
    [ValidationMode.DICTIONARY]: {
      name: 'Dictionary Validation',
      description: 'Uses predefined word lists to validate answers',
      defaultConfig: {
        strictMode: false,
        allowProperNouns: true,
        minWordLength: 2,
      },
    },
    [ValidationMode.VOTING]: {
      name: 'Player Voting',
      description: 'Players vote on answer validity',
      defaultConfig: {
        requiredVotes: 2,
        votingTimeLimit: 60,
        majorityThreshold: 0.6,
        allowSelfVoting: false,
      },
    },
    [ValidationMode.AI]: {
      name: 'AI Validation',
      description: 'AI model validates answer appropriateness',
      defaultConfig: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.1,
        maxTokens: 100,
      },
    },
    [ValidationMode.HYBRID]: {
      name: 'Hybrid Validation',
      description: 'Combines multiple validation methods',
      defaultConfig: {
        primaryMethod: ValidationMode.DICTIONARY,
        fallbackMethod: ValidationMode.VOTING,
        aiAssisted: true,
      },
    },
  },
  
  ERROR_CODES: {
    INVALID_ANSWER: 'INVALID_ANSWER',
    TOO_SHORT: 'TOO_SHORT',
    TOO_LONG: 'TOO_LONG',
    WRONG_LETTER: 'WRONG_LETTER',
    NOT_IN_CATEGORY: 'NOT_IN_CATEGORY',
    VALIDATION_TIMEOUT: 'VALIDATION_TIMEOUT',
    INSUFFICIENT_VOTES: 'INSUFFICIENT_VOTES',
  },
} as const;
