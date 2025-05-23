import { 
  GameState as SharedGameState,
  GamePhase,
  Round,
  Player,
  GameConfig,
} from '@name-name-name/shared';

export interface GameStateData extends SharedGameState {
  // Additional backend-specific properties
  timers?: {
    roundTimer?: NodeJS.Timeout;
    validationTimer?: NodeJS.Timeout;
  };
  roundMasterQueue?: string[];
  lastActivity?: Date;
}

export interface GameTransition {
  from: GamePhase;
  to: GamePhase;
  triggeredBy: string;
  timestamp: Date;
  reason?: string;
}
