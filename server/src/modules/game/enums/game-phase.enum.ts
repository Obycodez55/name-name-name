export enum GamePhase {
  WAITING = 'waiting',
  LETTER_SELECTION = 'letter_selection',
  PLAYING = 'playing',
  VALIDATION = 'validation',
  SCORING = 'scoring',
  ROUND_RESULTS = 'round_results',
  GAME_ENDED = 'game_ended'
}

export enum GameEvent {
  GAME_STARTED = 'game_started',
  ROUND_STARTED = 'round_started',
  LETTER_SELECTED = 'letter_selected',
  ANSWERS_SUBMITTED = 'answers_submitted',
  ALL_ANSWERS_SUBMITTED = 'all_answers_submitted',
  ROUND_ENDED = 'round_ended',
  VALIDATION_COMPLETED = 'validation_completed',
  SCORES_CALCULATED = 'scores_calculated',
  GAME_ENDED = 'game_ended',
  TIMER_UPDATE = 'timer_update',
}