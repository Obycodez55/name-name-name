export const WEBSOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Room events
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  ROOM_UPDATED: 'roomUpdated',
  
  // Game flow events
  START_GAME: 'startGame',
  GAME_STARTED: 'gameStarted',
  START_ROUND: 'startRound',
  ROUND_STARTED: 'roundStarted',
  END_ROUND: 'endRound',
  ROUND_ENDED: 'roundEnded',
  GAME_ENDED: 'gameEnded',
  
  // Letter selection events
  SELECT_LETTER: 'selectLetter',
  LETTER_SELECTED: 'letterSelected',
  LETTER_REVEAL: 'letterReveal',
  
  // Answer events
  SUBMIT_ANSWERS: 'submitAnswers',
  ANSWERS_SUBMITTED: 'answersSubmitted',
  ALL_ANSWERS_SUBMITTED: 'allAnswersSubmitted',
  
  // Validation events
  VOTE_ON_ANSWER: 'voteOnAnswer',
  VALIDATION_REQUEST: 'validationRequest',
  VALIDATION_COMPLETE: 'validationComplete',
  
  // Scoring events
  SCORES_CALCULATED: 'scoresCalculated',
  SCORES_UPDATED: 'scoresUpdated',
  FINAL_SCORES: 'finalScores',
  
  // Chat events
  CHAT_MESSAGE: 'chatMessage',
  SYSTEM_MESSAGE: 'systemMessage',
  
  // Status events
  PLAYER_STATUS_UPDATE: 'playerStatusUpdate',
  PLAYER_TYPING: 'playerTyping',
  TIMER_UPDATE: 'timerUpdate',
  
  // Error events
  ERROR: 'error',
  GAME_ERROR: 'gameError',
  VALIDATION_ERROR: 'validationError',
} as const;

export const HTTP_ENDPOINTS = {
  // Room endpoints
  CREATE_ROOM: '/api/rooms',
  GET_ROOM: '/api/rooms/:roomCode',
  JOIN_ROOM: '/api/rooms/:roomCode/join',
  LEAVE_ROOM: '/api/rooms/:roomCode/leave',
  
  // Game endpoints
  START_GAME: '/api/games/:roomCode/start',
  GET_GAME_STATE: '/api/games/:roomCode/state',
  
  // Validation endpoints
  VALIDATE_ANSWER: '/api/validation/validate',
  GET_DICTIONARY: '/api/validation/dictionary/:category',
  
  // History endpoints
  GET_GAME_HISTORY: '/api/history/games',
  GET_PLAYER_STATS: '/api/history/players/:playerId',
} as const;