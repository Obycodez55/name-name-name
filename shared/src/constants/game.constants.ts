export const GAME_CONSTANTS = {
  // Room settings
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  DEFAULT_MAX_PLAYERS: 6,
  
  // Time limits (seconds)
  MIN_ROUND_TIME: 30,
  MAX_ROUND_TIME: 600,
  DEFAULT_ROUND_TIME: 180,
  VALIDATION_TIME_LIMIT: 60,
  
  // Room code
  ROOM_CODE_LENGTH: 6,
  ROOM_CODE_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  
  // Game settings
  DEFAULT_CATEGORIES: [
    'Animals',
    'Foods',
    'Cities',
    'Countries',
    'Movies',
    'Books',
    'Sports',
    'Colors',
    'Professions',
    'Brands'
  ],
  
  // Scoring
  POINTS_VALID_ANSWER: 10,
  POINTS_UNIQUE_ANSWER: 15,
  POINTS_INVALID_ANSWER: 0,
  POINTS_EMPTY_ANSWER: 0,
  
  // Letters
  EXCLUDED_LETTERS: ['Q', 'X', 'Z'], // Optionally exclude difficult letters
  
  // Timeouts
  PLAYER_TIMEOUT: 300000, // 5 minutes
  ROOM_CLEANUP_DELAY: 3600000, // 1 hour
  
  // Limits
  MAX_ANSWER_LENGTH: 100,
  MAX_PLAYER_NAME_LENGTH: 50,
  MAX_ROOM_NAME_LENGTH: 100,
  MAX_CHAT_MESSAGE_LENGTH: 500,
  
  // Validation
  DEFAULT_VALIDATION_CONFIDENCE: 0.7,
  MIN_VOTES_REQUIRED: 2,
  MAJORITY_THRESHOLD: 0.6,
} as const;