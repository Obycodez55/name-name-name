import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@modules/persistence/redis/redis.service';
import { ValidationStrategy } from '../interfaces/validation-strategy.interface';
import {
  ValidationRequest,
  ValidationResult,
  ValidationMode,
  ValidationVote,
  normalizeAnswer,
} from '@name-name-name/shared';

@Injectable()
export class VotingValidationStrategy implements ValidationStrategy {
  private readonly logger = new Logger(VotingValidationStrategy.name);

  constructor(private readonly redisService: RedisService) {}

  async validate(request: ValidationRequest): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const normalizedAnswer = normalizeAnswer(request.answer);
      const votingKey = this.getVotingKey(request);
      
      // Check if voting is complete
      const votingData = await this.redisService.getObject<any>(votingKey);
      
      if (!votingData || !votingData.isComplete) {
        // Voting is still in progress or hasn't started
        await this.initializeVoting(request, votingKey);
        
        return {
          requestId: request.id,
          answer: request.answer,
          category: request.category,
          isValid: false, // Default until voting completes
          confidence: 0.5, // Neutral confidence
          method: ValidationMode.VOTING,
          reason: 'Voting in progress',
          processingTime: Date.now() - startTime,
          metadata: {
            normalizedAnswer,
            votingStatus: 'pending',
            votingKey,
          },
        };
      }

      // Voting is complete, calculate result
      const result = this.calculateVotingResult(votingData);

      return {
        requestId: request.id,
        answer: request.answer,
        category: request.category,
        isValid: result.isValid,
        confidence: result.confidence,
        method: ValidationMode.VOTING,
        reason: result.reason,
        processingTime: Date.now() - startTime,
        metadata: {
          normalizedAnswer,
          votingStatus: 'complete',
          totalVotes: result.totalVotes,
          validVotes: result.validVotes,
          invalidVotes: result.invalidVotes,
        },
      };

    } catch (error) {
      this.logger.error('Voting validation error:', error);
      
      return {
        requestId: request.id,
        answer: request.answer,
        category: request.category,
        isValid: false,
        confidence: 0.0,
        method: ValidationMode.VOTING,
        reason: `Voting validation failed: ${error.message}`,
        processingTime: Date.now() - startTime,
      };
    }
  }

  async submitVote(
    validationId: string,
    voterId: string,
    isValid: boolean,
    voterWeight: number = 1.0
  ): Promise<void> {
    try {
      const votingKey = `voting:${validationId}`;
      const votingData = await this.redisService.getObject<any>(votingKey);
      
      if (!votingData) {
        throw new Error('Voting session not found');
      }

      if (votingData.isComplete) {
        throw new Error('Voting has already ended');
      }

      // Check if voter already voted
      const existingVoteIndex = votingData.votes.findIndex((vote: any) => vote.voterId === voterId);
      
      const vote: ValidationVote = {
        voterId,
        isValid,
        timestamp: new Date(),
      };

      if (existingVoteIndex >= 0) {
        // Update existing vote
        votingData.votes[existingVoteIndex] = vote;
      } else {
        // Add new vote
        votingData.votes.push(vote);
      }

      // Check if voting should be completed
      const config = votingData.config || {};
      const requiredVotes = config.requiredVotes || 3;
      const majorityThreshold = config.majorityThreshold || 0.6;

      if (votingData.votes.length >= requiredVotes) {
        votingData.isComplete = true;
        votingData.completedAt = new Date();
      }

      // Update voting data
      await this.redisService.setObject(votingKey, votingData, 3600); // 1 hour TTL

      this.logger.log(`Vote submitted for ${validationId}: ${isValid} by ${voterId}`);

    } catch (error) {
      this.logger.error('Submit vote error:', error);
      throw error;
    }
  }

  async getVotingStatus(validationId: string): Promise<any> {
    try {
      const votingKey = `voting:${validationId}`;
      const votingData = await this.redisService.getObject<any>(votingKey);
      
      if (!votingData) {
        return null;
      }

      return {
        validationId,
        answer: votingData.answer,
        category: votingData.category,
        isComplete: votingData.isComplete,
        totalVotes: votingData.votes.length,
        requiredVotes: votingData.config?.requiredVotes || 3,
        votes: votingData.votes.map((vote: any) => ({
          voterId: vote.voterId,
          isValid: vote.isValid,
          timestamp: vote.timestamp,
        })),
      };

    } catch (error) {
      this.logger.error('Get voting status error:', error);
      return null;
    }
  }

  getStrategyName(): string {
    return 'Player Voting Validation';
  }

  isConfigurationValid(config: any): boolean {
    return true; // Voting validation doesn't require specific configuration
  }

  private async initializeVoting(request: ValidationRequest, votingKey: string): Promise<void> {
    const votingData = {
      requestId: request.id,
      answer: request.answer,
      category: request.category,
      letter: request.context?.letter,
      votes: [],
      isComplete: false,
      createdAt: new Date(),
      config: request.context?.gameConfig || {},
    };

    await this.redisService.setObject(votingKey, votingData, 3600); // 1 hour TTL
  }

  private getVotingKey(request: ValidationRequest): string {
    return `voting:${request.id}`;
  }

  private calculateVotingResult(votingData: any): any {
    const votes = votingData.votes || [];
    const validVotes = votes.filter((vote: any) => vote.isValid).length;
    const invalidVotes = votes.length - validVotes;
    const totalVotes = votes.length;

    if (totalVotes === 0) {
      return {
        isValid: false,
        confidence: 0.0,
        reason: 'No votes received',
        totalVotes: 0,
        validVotes: 0,
        invalidVotes: 0,
      };
    }

    const validRatio = validVotes / totalVotes;
    const majorityThreshold = votingData.config?.majorityThreshold || 0.6;
    
    const isValid = validRatio >= majorityThreshold;
    const confidence = Math.abs(validRatio - 0.5) * 2; // Convert to 0-1 scale based on how far from 50/50

    let reason: string;
    if (isValid) {
      reason = `${validVotes}/${totalVotes} players voted valid (${Math.round(validRatio * 100)}%)`;
    } else {
      reason = `${invalidVotes}/${totalVotes} players voted invalid (${Math.round((1 - validRatio) * 100)}%)`;
    }

    return {
      isValid,
      confidence,
      reason,
      totalVotes,
      validVotes,
      invalidVotes,
    };
  }
}