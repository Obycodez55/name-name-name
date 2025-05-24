import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ValidationStrategy } from '../interfaces/validation-strategy.interface';
import {
  ValidationRequest,
  ValidationResult,
  ValidationMode,
  normalizeAnswer,
} from '@name-name-name/shared';

@Injectable()
export class ApiValidationStrategy implements ValidationStrategy {
  private readonly logger = new Logger(ApiValidationStrategy.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async validate(request: ValidationRequest): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const normalizedAnswer = normalizeAnswer(request.answer);
      
      // Try multiple API sources for better coverage
      const results = await Promise.allSettled([
        this.validateWithWordnik(normalizedAnswer),
        this.validateWithDictionaryApi(normalizedAnswer),
        this.validateWithDataMuse(normalizedAnswer, request.category),
      ]);

      // Analyze results from different APIs
      let isValid = false;
      let confidence = 0.0;
      let reason = 'Word not found in any dictionary API';
      const apiResults: any[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const apiName = ['Wordnik', 'Dictionary API', 'DataMuse'][index];
          apiResults.push({ api: apiName, result: result.value });
          
          if (result.value.isValid) {
            isValid = true;
            confidence = Math.max(confidence, result.value.confidence || 0.8);
            reason = `Word validated by ${apiName}`;
          }
        }
      });

      // If no API validated it, but we got partial matches, lower confidence
      if (!isValid && apiResults.some(r => r.result.confidence > 0.3)) {
        confidence = 0.3;
        reason = 'Partial matches found in dictionary APIs';
      }

      return {
        requestId: request.id,
        answer: request.answer,
        category: request.category,
        isValid,
        confidence,
        method: ValidationMode.VOTING, // Using VOTING as placeholder for API
        reason,
        processingTime: Date.now() - startTime,
        metadata: {
          apiResults,
          normalizedAnswer,
        },
      };

    } catch (error) {
      this.logger.error('API validation error:', error);
      
      return {
        requestId: request.id,
        answer: request.answer,
        category: request.category,
        isValid: false,
        confidence: 0.0,
        method: ValidationMode.VOTING,
        reason: `API validation failed: ${error.message}`,
        processingTime: Date.now() - startTime,
      };
    }
  }

  getStrategyName(): string {
    return 'API Validation';
  }

  isConfigurationValid(config: any): boolean {
    return true; // API validation doesn't require specific configuration
  }

  private async validateWithWordnik(word: string): Promise<any> {
    try {
      const apiKey = this.configService.get('WORDNIK_API_KEY');
      if (!apiKey) return { isValid: false, confidence: 0 };

      const url = `https://api.wordnik.com/v4/word.json/${word}/definitions`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: { api_key: apiKey, limit: 1 },
          timeout: 5000,
        })
      );

      const isValid = response.data && response.data.length > 0;
      return {
        isValid,
        confidence: isValid ? 0.9 : 0,
        definitions: response.data,
      };

    } catch (error) {
      this.logger.warn('Wordnik API error:', error.message);
      return { isValid: false, confidence: 0 };
    }
  }

  private async validateWithDictionaryApi(word: string): Promise<any> {
    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );

      const isValid = response.data && Array.isArray(response.data) && response.data.length > 0;
      return {
        isValid,
        confidence: isValid ? 0.85 : 0,
        definitions: response.data,
      };

    } catch (error) {
      // Dictionary API returns 404 for unknown words, which is expected
      if (error.response?.status === 404) {
        return { isValid: false, confidence: 0 };
      }
      this.logger.warn('Dictionary API error:', error.message);
      return { isValid: false, confidence: 0 };
    }
  }

  private async validateWithDataMuse(word: string, category?: string): Promise<any> {
    try {
      const url = 'https://api.datamuse.com/words';
      const params: any = { sp: word, max: 1 };
      
      // Add category-specific constraints if available
      if (category) {
        const topicMap: Record<string, string> = {
          animals: 'animal',
          foods: 'food',
          cities: 'place',
          countries: 'place',
          sports: 'sport',
        };
        
        if (topicMap[category.toLowerCase()]) {
          params.topics = topicMap[category.toLowerCase()];
        }
      }

      const response = await firstValueFrom(
        this.httpService.get(url, { params, timeout: 5000 })
      );

      const isValid = response.data && Array.isArray(response.data) && response.data.length > 0;
      return {
        isValid,
        confidence: isValid ? 0.7 : 0,
        matches: response.data,
      };

    } catch (error) {
      this.logger.warn('DataMuse API error:', error.message);
      return { isValid: false, confidence: 0 };
    }
  }
}
