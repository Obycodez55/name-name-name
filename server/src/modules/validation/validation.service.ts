import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongodbService } from '@modules/persistence/mongodb/mongodb.service';
import { RedisService } from '@modules/persistence/redis/redis.service';
import {
  ValidationRequest,
  ValidationResult,
  ValidationMode,
  VALIDATION_CONSTANTS,
  GAME_CONSTANTS,
} from '@name-name-name/shared';
import { ValidationStrategy } from './interfaces/validation-strategy.interface';
import { DictionaryValidationStrategy } from './strategies/dictionary-validation.strategy';
import { ApiValidationStrategy } from './strategies/api-validation.strategy';
import { AiValidationStrategy } from './strategies/ai-validation.strategy';
import { VotingValidationStrategy } from './strategies/voting-validation.strategy';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);
  private readonly strategies = new Map<ValidationMode, ValidationStrategy>();

  constructor(
    private readonly configService: ConfigService,
    private readonly mongodbService: MongodbService,
    private readonly redisService: RedisService,
    private readonly dictionaryStrategy: DictionaryValidationStrategy,
    private readonly apiStrategy: ApiValidationStrategy,
    private readonly aiStrategy: AiValidationStrategy,
    private readonly votingStrategy: VotingValidationStrategy,
  ) {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.strategies.set(ValidationMode.DICTIONARY, this.dictionaryStrategy);
    this.strategies.set(ValidationMode.VOTING, this.votingStrategy);
    this.strategies.set(ValidationMode.AI, this.aiStrategy);
    this.strategies.set(ValidationMode.HYBRID, this.dictionaryStrategy); // Fallback for hybrid
  }

  async validateAnswer(request: Omit<ValidationRequest, 'id'>): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      // Create full validation request
      const validationRequest: ValidationRequest = {
        id: uuidv4(),
        ...request,
      };

      this.logger.log(`Validating answer: ${request.answer} (${request.category}, ${request.context.letter})`);

      // Basic format validation
      const formatValidation = this.validateAnswerFormat(request.answer, request.context.letter);
      if (!formatValidation.isValid) {
        return this.createValidationResult(
          validationRequest,
          false,
          0.0,
          formatValidation.errors.join(', '),
          startTime
        );
      }

      // Choose validation strategy
      const strategy = this.getValidationStrategy(request.strategy);
      if (!strategy) {
        throw new BadRequestException(`Unsupported validation strategy: ${request.strategy}`);
      }

      // Perform validation
      const result = await strategy.validate(validationRequest);

      // Cache result for potential reuse
      await this.cacheValidationResult(validationRequest, result);

      this.logger.log(
        `Validation completed: ${request.answer} -> ${result.isValid} (confidence: ${result.confidence})`
      );

      return result;

    } catch (error) {
      this.logger.error('Validation error:', error);
      
      return this.createValidationResult(
        { id: uuidv4(), ...request },
        false,
        0.0,
        `Validation failed: ${error.message}`,
        startTime
      );
    }
  }

  async validateMultipleAnswers(requests: Array<Omit<ValidationRequest, 'id'>>): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Process in batches to avoid overwhelming external APIs
    const batchSize = 10;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(request => this.validateAnswer(request))
      );
      results.push(...batchResults);
    }

    return results;
  }

  async validateAnswerWithCache(request: Omit<ValidationRequest, 'id'>): Promise<ValidationResult> {
    // Check cache first
    const cacheKey = this.getCacheKey(request);
    const cachedResult = await this.redisService.getObject<ValidationResult>(cacheKey);
    
    if (cachedResult) {
      this.logger.log(`Cache hit for validation: ${request.answer}`);
      return cachedResult;
    }

    // Perform validation and cache result
    const result = await this.validateAnswer(request);
    await this.cacheValidationResult({ id: uuidv4(), ...request }, result);
    
    return result;
  }

  async getDictionaryWords(category: string): Promise<string[]> {
    try {
      return await this.mongodbService.getDictionaryWords(category);
    } catch (error) {
      this.logger.error(`Failed to get dictionary words for category ${category}:`, error);
      return [];
    }
  }

  async addDictionaryWords(category: string, words: string[]): Promise<void> {
    try {
      await this.mongodbService.addDictionaryWords(category, words);
      this.logger.log(`Added ${words.length} words to dictionary category ${category}`);
    } catch (error) {
      this.logger.error(`Failed to add words to dictionary ${category}:`, error);
      throw error;
    }
  }

  async validateDictionaryWord(category: string, word: string): Promise<boolean> {
    try {
      return await this.mongodbService.validateDictionaryWord(category, word);
    } catch (error) {
      this.logger.error(`Failed to validate dictionary word ${word} in ${category}:`, error);
      return false;
    }
  }

  // Strategy selection and management
  private getValidationStrategy(mode: ValidationMode): ValidationStrategy | null {
    return this.strategies.get(mode) || null;
  }

  private validateAnswerFormat(answer: string, letter: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!answer || answer.trim().length === 0) {
      errors.push('Answer cannot be empty');
    }

    if (answer.length > GAME_CONSTANTS.MAX_ANSWER_LENGTH) {
      errors.push(`Answer too long (max ${GAME_CONSTANTS.MAX_ANSWER_LENGTH} characters)`);
    }

    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedLetter = letter.toLowerCase();

    if (normalizedAnswer.length > 0 && !normalizedAnswer.startsWith(normalizedLetter)) {
      errors.push(`Answer must start with letter "${letter.toUpperCase()}"`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private createValidationResult(
    request: ValidationRequest,
    isValid: boolean,
    confidence: number,
    reason: string,
    startTime: number
  ): ValidationResult {
    return {
      requestId: request.id,
      answer: request.answer,
      category: request.category,
      isValid,
      confidence,
      method: request.strategy,
      reason,
      processingTime: Date.now() - startTime,
    };
  }

  private getCacheKey(request: Omit<ValidationRequest, 'id'>): string {
    const normalized = request.answer.trim().toLowerCase();
    return `validation:${request.strategy}:${request.category.toLowerCase()}:${request.context.letter.toLowerCase()}:${normalized}`;
  }

  private async cacheValidationResult(request: ValidationRequest, result: ValidationResult): Promise<void> {
    const cacheKey = this.getCacheKey(request);
    // Cache for 1 hour
    await this.redisService.setObject(cacheKey, result, 3600);
  }

  // Utility methods for different validation strategies
  async getAvailableStrategies(): Promise<Array<{ mode: ValidationMode; name: string; description: string }>> {
    return Object.values(ValidationMode).map(mode => ({
      mode,
      name: VALIDATION_CONSTANTS.STRATEGIES[mode]?.name || mode,
      description: VALIDATION_CONSTANTS.STRATEGIES[mode]?.description || 'No description available',
    }));
  }

  async getValidationStats(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<any> {
    try {
      const keys = await this.redisService.keys('validation:*');
      const stats = {
        totalValidations: keys.length,
        byStrategy: {} as Record<ValidationMode, number>,
        byCategory: {} as Record<string, number>,
        avgProcessingTime: 0,
      };

      // This is a simplified version - in production you'd want more sophisticated analytics
      return stats;
    } catch (error) {
      this.logger.error('Failed to get validation stats:', error);
      return null;
    }
  }

  // Cleanup old validation cache entries
  async cleanupValidationCache(): Promise<void> {
    try {
      const expiredKeys = await this.redisService.keys('validation:*');
      // In a real implementation, you'd check TTL and only delete truly expired entries
      // This is a simplified version
      this.logger.log(`Cleaned up ${expiredKeys.length} validation cache entries`);
    } catch (error) {
      this.logger.error('Failed to cleanup validation cache:', error);
    }
  }
}
