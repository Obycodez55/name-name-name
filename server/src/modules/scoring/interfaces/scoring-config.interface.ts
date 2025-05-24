export interface ScoringConfig {
  // Point values
  validAnswerPoints: number;
  uniqueAnswerPoints: number;
  invalidAnswerPoints: number;
  emptyAnswerPoints: number;
  
  // Bonus multipliers
  speedBonus: boolean;
  speedBonusMultiplier: number;
  completionBonus: boolean;
  completionBonusPoints: number;
  
  // Penalties
  invalidAnswerPenalty: number;
  
  // Special scoring rules
  allowPartialCredit: boolean;
  categoryWeights: Record<string, number>;
}