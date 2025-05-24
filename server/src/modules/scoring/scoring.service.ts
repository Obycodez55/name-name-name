import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PlayerAnswers,
  ValidationResults,
  GameConfig,
  GameState,
  ScoreBreakdown,
  GAME_CONSTANTS,
  calculateAnswerScore,
} from '@name-name-name/shared';
import { ScoringConfig } from './interfaces/scoring-config.interface';
import { AnswerScore, RoundScoreData, ScoringResult } from './interfaces/score.interface';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private readonly configService: ConfigService) {}

  async calculateRoundScores(
    playerAnswers: Record<string, PlayerAnswers>,
    validationResults: ValidationResults,
    gameConfig: GameConfig,
    roundNumber?: number
  ): Promise<Record<string, number>> {
    try {
      this.logger.log(`Calculating scores for ${Object.keys(playerAnswers).length} players`);

      const scoringConfig = this.getScoringConfig(gameConfig);
      const result = await this.calculateDetailedScores(
        playerAnswers,
        validationResults,
        scoringConfig,
        roundNumber
      );

      this.logger.log(`Scoring completed. Average score: ${result.summary.averageScore}`);

      return result.roundScores;

    } catch (error) {
      this.logger.error('Calculate round scores error:', error);
      throw error;
    }
  }

  async calculateDetailedScores(
    playerAnswers: Record<string, PlayerAnswers>,
    validationResults: ValidationResults,
    scoringConfig: ScoringConfig,
    roundNumber?: number
  ): Promise<ScoringResult> {
    try {
      const detailedScores: Record<string, RoundScoreData> = {};
      const roundScores: Record<string, number> = {};

      // First pass: collect all answers to determine uniqueness
      const answerFrequency = this.calculateAnswerFrequency(playerAnswers, validationResults);

      // Second pass: calculate scores for each player
      for (const [playerId, answers] of Object.entries(playerAnswers)) {
        const playerValidation = validationResults[playerId] || {};
        const scoreData = await this.calculatePlayerScore(
          playerId,
          answers,
          playerValidation,
          answerFrequency,
          scoringConfig
        );

        detailedScores[playerId] = scoreData;
        roundScores[playerId] = scoreData.totalScore;
      }

      // Calculate summary statistics
      const summary = this.calculateSummaryStats(detailedScores);

      return {
        roundScores,
        detailedScores,
        summary,
      };

    } catch (error) {
      this.logger.error('Calculate detailed scores error:', error);
      throw error;
    }
  }

  async calculateFinalScores(gameState: GameState): Promise<ScoreBreakdown[]> {
    try {
      const finalScores: ScoreBreakdown[] = [];

      for (const [playerId, player] of Object.entries(gameState.players)) {
        const roundScores: number[] = [];
        let validAnswers = 0;
        let uniqueAnswers = 0;

        // Collect round scores and statistics
        for (const round of gameState.rounds) {
          const roundScore = round.scores[playerId] || 0;
          roundScores.push(roundScore);

          // Count valid and unique answers
          const playerAnswers = round.answers[playerId];
          const validationResults = round.validationResults?.[playerId];

          if (playerAnswers && validationResults) {
            for (const [category, answer] of Object.entries(playerAnswers.answers)) {
              if (answer && answer.trim()) {
                const validation = validationResults[category];
                if (validation?.isValid) {
                  validAnswers++;
                  
                  // Check if answer was unique in that round
                  const isUnique = this.wasAnswerUniqueInRound(
                    answer,
                    category,
                    round.answers,
                    round.validationResults || {}
                  );
                  if (isUnique) {
                    uniqueAnswers++;
                  }
                }
              }
            }
          }
        }

        const totalScore = gameState.scores[playerId] || 0;

        finalScores.push({
          playerId,
          playerName: player.name,
          roundScores,
          totalScore,
          validAnswers,
          uniqueAnswers,
          rank: 0, // Will be set after sorting
        });
      }

      // Sort by total score (descending) and assign ranks
      finalScores.sort((a, b) => b.totalScore - a.totalScore);
      finalScores.forEach((score, index) => {
        score.rank = index + 1;
      });

      this.logger.log(`Final scores calculated for ${finalScores.length} players`);

      return finalScores;

    } catch (error) {
      this.logger.error('Calculate final scores error:', error);
      throw error;
    }
  }

  async calculatePlayerScore(
    playerId: string,
    answers: PlayerAnswers,
    validationResults: Record<string, any>,
    answerFrequency: Record<string, Record<string, number>>,
    scoringConfig: ScoringConfig
  ): Promise<RoundScoreData> {
    try {
      const answerScores: Record<string, AnswerScore> = {};
      let totalScore = 0;
      let validAnswers = 0;
      let uniqueAnswers = 0;
      let emptyAnswers = 0;
      let invalidAnswers = 0;

      for (const [category, answer] of Object.entries(answers.answers)) {
        const validation = validationResults[category];
        const normalizedAnswer = answer?.trim().toLowerCase() || '';

        let points = 0;
        let reason = '';
        let isValid = false;
        let isUnique = false;

        if (!answer || !answer.trim()) {
          // Empty answer
          points = scoringConfig.emptyAnswerPoints;
          reason = 'No answer provided';
          emptyAnswers++;
        } else if (!validation || !validation.isValid) {
          // Invalid answer
          points = scoringConfig.invalidAnswerPoints - scoringConfig.invalidAnswerPenalty;
          reason = validation?.reason || 'Answer is invalid';
          invalidAnswers++;
        } else {
          // Valid answer
          isValid = true;
          validAnswers++;

          // Check if answer is unique
          const frequency = answerFrequency[category]?.[normalizedAnswer] || 0;
          isUnique = frequency === 1;

          if (isUnique) {
            points = scoringConfig.uniqueAnswerPoints;
            reason = 'Unique valid answer';
            uniqueAnswers++;
          } else {
            points = scoringConfig.validAnswerPoints;
            reason = `Valid answer (shared by ${frequency} players)`;
          }

          // Apply category weights if configured
          const categoryWeight = scoringConfig.categoryWeights[category.toLowerCase()] || 1.0;
          points = Math.round(points * categoryWeight);
        }

        answerScores[category] = {
          category,
          answer: answer || '',
          isValid,
          isUnique,
          points,
          reason,
        };

        totalScore += points;
      }

      // Apply bonuses
      if (scoringConfig.completionBonus && emptyAnswers === 0) {
        totalScore += scoringConfig.completionBonusPoints;
      }

      // Apply speed bonus if configured (would need submission timing data)
      if (scoringConfig.speedBonus) {
        // This would require submission timing data to implement properly
        // For now, we'll skip this feature
      }

      return {
        playerId,
        playerName: answers.playerId, // This should ideally be the actual player name
        answers: answerScores,
        totalScore: Math.max(0, totalScore), // Ensure non-negative scores
        validAnswers,
        uniqueAnswers,
        emptyAnswers,
        invalidAnswers,
      };

    } catch (error) {
      this.logger.error('Calculate player score error:', error);
      throw error;
    }
  }

  private calculateAnswerFrequency(
    playerAnswers: Record<string, PlayerAnswers>,
    validationResults: ValidationResults
  ): Record<string, Record<string, number>> {
    const frequency: Record<string, Record<string, number>> = {};

    for (const [playerId, answers] of Object.entries(playerAnswers)) {
      const playerValidation = validationResults[playerId] || {};

      for (const [category, answer] of Object.entries(answers.answers)) {
        if (!answer || !answer.trim()) continue;

        const validation = playerValidation[category];
        if (!validation || !validation.isValid) continue;

        const normalizedAnswer = answer.trim().toLowerCase();
        
        if (!frequency[category]) {
          frequency[category] = {};
        }
        
        frequency[category][normalizedAnswer] = (frequency[category][normalizedAnswer] || 0) + 1;
      }
    }

    return frequency;
  }

  private calculateSummaryStats(detailedScores: Record<string, RoundScoreData>) {
    const scores = Object.values(detailedScores);
    const totalPlayers = scores.length;

    if (totalPlayers === 0) {
      return {
        totalPlayers: 0,
        totalAnswers: 0,
        validAnswers: 0,
        uniqueAnswers: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    const totalAnswers = scores.reduce((sum, score) => 
      sum + score.validAnswers + score.invalidAnswers + score.emptyAnswers, 0);
    const validAnswers = scores.reduce((sum, score) => sum + score.validAnswers, 0);
    const uniqueAnswers = scores.reduce((sum, score) => sum + score.uniqueAnswers, 0);
    
    const playerScores = scores.map(score => score.totalScore);
    const averageScore = Math.round(playerScores.reduce((sum, score) => sum + score, 0) / totalPlayers);
    const highestScore = Math.max(...playerScores);
    const lowestScore = Math.min(...playerScores);

    return {
      totalPlayers,
      totalAnswers,
      validAnswers,
      uniqueAnswers,
      averageScore,
      highestScore,
      lowestScore,
    };
  }

  private getScoringConfig(gameConfig: GameConfig): ScoringConfig {
    return {
      validAnswerPoints: GAME_CONSTANTS.POINTS_VALID_ANSWER,
      uniqueAnswerPoints: GAME_CONSTANTS.POINTS_UNIQUE_ANSWER,
      invalidAnswerPoints: GAME_CONSTANTS.POINTS_INVALID_ANSWER,
      emptyAnswerPoints: GAME_CONSTANTS.POINTS_EMPTY_ANSWER,
      speedBonus: false,
      speedBonusMultiplier: 1.2,
      completionBonus: true,
      completionBonusPoints: 5,
      invalidAnswerPenalty: 0,
      allowPartialCredit: false,
      categoryWeights: {},
    };
  }

  private wasAnswerUniqueInRound(
    answer: string,
    category: string,
    allAnswers: Record<string, PlayerAnswers>,
    validationResults: ValidationResults
  ): boolean {
    const normalizedAnswer = answer.trim().toLowerCase();
    let count = 0;

    for (const [playerId, playerAnswers] of Object.entries(allAnswers)) {
      const playerAnswer = playerAnswers.answers[category];
      const validation = validationResults[playerId]?.[category];

      if (playerAnswer && validation?.isValid) {
        const normalizedPlayerAnswer = playerAnswer.trim().toLowerCase();
        if (normalizedPlayerAnswer === normalizedAnswer) {
          count++;
        }
      }
    }

    return count === 1;
  }

  // Utility methods for different scoring scenarios
  async getPlayerRanking(gameState: GameState): Promise<Array<{
    playerId: string;
    playerName: string;
    totalScore: number;
    rank: number;
  }>> {
    const ranking = Object.entries(gameState.scores)
      .map(([playerId, score]) => ({
        playerId,
        playerName: gameState.players[playerId]?.name || 'Unknown',
        totalScore: score,
        rank: 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks (handle ties)
    let currentRank = 1;
    for (let i = 0; i < ranking.length; i++) {
      if (i > 0 && ranking[i].totalScore < ranking[i - 1].totalScore) {
        currentRank = i + 1;
      }
      ranking[i].rank = currentRank;
    }

    return ranking;
  }

  async getScoreHistory(gameState: GameState, playerId: string): Promise<{
    rounds: Array<{
      roundNumber: number;
      score: number;
      validAnswers: number;
      uniqueAnswers: number;
      totalAnswers: number;
    }>;
    totalScore: number;
    averageScore: number;
  }> {
    const rounds = gameState.rounds.map(round => {
      const roundScore = round.scores[playerId] || 0;
      const playerAnswers = round.answers[playerId];
      const validationResults = round.validationResults?.[playerId];

      let validAnswers = 0;
      let uniqueAnswers = 0;
      let totalAnswers = 0;

      if (playerAnswers && validationResults) {
        for (const [category, answer] of Object.entries(playerAnswers.answers)) {
          if (answer && answer.trim()) {
            totalAnswers++;
            const validation = validationResults[category];
            if (validation?.isValid) {
              validAnswers++;
              
              const isUnique = this.wasAnswerUniqueInRound(
                answer,
                category,
                round.answers,
                round.validationResults || {}
              );
              if (isUnique) {
                uniqueAnswers++;
              }
            }
          }
        }
      }

      return {
        roundNumber: round.roundNumber,
        score: roundScore,
        validAnswers,
        uniqueAnswers,
        totalAnswers,
      };
    });

    const totalScore = gameState.scores[playerId] || 0;
    const averageScore = rounds.length > 0 
      ? Math.round(totalScore / rounds.length) 
      : 0;

    return {
      rounds,
      totalScore,
      averageScore,
    };
  }
}