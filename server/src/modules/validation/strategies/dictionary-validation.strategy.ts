import { Injectable, Logger } from '@nestjs/common';
import { MongodbService } from '@modules/persistence/mongodb/mongodb.service';
import { RedisService } from '@modules/persistence/redis/redis.service';
import { ValidationStrategy } from '../interfaces/validation-strategy.interface';
import {
  ValidationRequest,
  ValidationResult,
  ValidationMode,
  normalizeAnswer,
} from '@name-name-name/shared';

@Injectable()
export class DictionaryValidationStrategy implements ValidationStrategy {
  private readonly logger = new Logger(DictionaryValidationStrategy.name);

  constructor(
    private readonly mongodbService: MongodbService,
    private readonly redisService: RedisService,
  ) {}

  async validate(request: ValidationRequest): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const normalizedAnswer = normalizeAnswer(request.answer);
      
      // Check if word exists in dictionary for this category
      const isValidWord = await this.mongodbService.validateDictionaryWord(
        request.category,
        normalizedAnswer
      );

      const confidence = isValidWord ? 1.0 : 0.0;
      const reason = isValidWord 
        ? 'Word found in dictionary'
        : 'Word not found in dictionary';

      // Get suggestions if word is invalid
      let suggestions: string[] = [];
      if (!isValidWord) {
        suggestions = await this.getSuggestions(request.category, normalizedAnswer, request.context?.letter);
      }

      return {
        requestId: request.id,
        answer: request.answer,
        category: request.category,
        isValid: isValidWord,
        confidence,
        method: ValidationMode.DICTIONARY,
        reason,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        processingTime: Date.now() - startTime,
        metadata: {
          dictionarySize: await this.getDictionarySize(request.category),
          normalizedAnswer,
        },
      };

    } catch (error) {
      this.logger.error('Dictionary validation error:', error);
      
      return {
        requestId: request.id,
        answer: request.answer,
        category: request.category,
        isValid: false,
        confidence: 0.0,
        method: ValidationMode.DICTIONARY,
        reason: `Validation failed: ${error.message}`,
        processingTime: Date.now() - startTime,
      };
    }
  }

  getStrategyName(): string {
    return 'Dictionary Validation';
  }

  isConfigurationValid(config: any): boolean {
    // Dictionary validation doesn't require specific configuration
    return true;
  }

  private async getSuggestions(category: string, answer: string, letter: string): Promise<string[]> {
    try {
      const words = await this.mongodbService.getDictionaryWords(category);
      const suggestions: string[] = [];

      // Find words that start with the same letter and are similar
      const similarWords = words.filter(word => {
        return word.toLowerCase().startsWith(letter.toLowerCase()) && 
               this.calculateSimilarity(answer, word) > 0.6;
      });

      // Sort by similarity and take top 3
      similarWords
        .sort((a, b) => this.calculateSimilarity(answer, b) - this.calculateSimilarity(answer, a))
        .slice(0, 3)
        .forEach(word => suggestions.push(word));

      return suggestions;

    } catch (error) {
      this.logger.error('Failed to get suggestions:', error);
      return [];
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private async getDictionarySize(category: string): Promise<number> {
    try {
      const words = await this.mongodbService.getDictionaryWords(category);
      return words.length;
    } catch (error) {
      return 0;
    }
  }
}