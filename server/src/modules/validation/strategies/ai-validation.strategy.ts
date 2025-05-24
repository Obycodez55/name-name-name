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
export class AiValidationStrategy implements ValidationStrategy {
  private readonly logger = new Logger(AiValidationStrategy.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async validate(request: ValidationRequest): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const normalizedAnswer = normalizeAnswer(request.answer);
      
      // Try OpenAI first, then Anthropic as fallback
      let result = await this.validateWithOpenAI(request);
      
      if (!result || result.confidence < 0.5) {
        const anthropicResult = await this.validateWithAnthropic(request);
        if (anthropicResult && anthropicResult.confidence > result?.confidence) {
          result = anthropicResult;
        }
      }

      return {
        requestId: request.id,
        answer: request.answer,
        category: request.category,
        isValid: result?.isValid || false,
        confidence: result?.confidence || 0.0,
        method: ValidationMode.AI,
        reason: result?.reason || 'AI validation failed',
        suggestions: result?.suggestions,
        processingTime: Date.now() - startTime,
        metadata: {
          normalizedAnswer,
          aiProvider: result?.provider,
        },
      };

    } catch (error) {
      this.logger.error('AI validation error:', error);
      
      return {
        requestId: request.id,
        answer: request.answer,
        category: request.category,
        isValid: false,
        confidence: 0.0,
        method: ValidationMode.AI,
        reason: `AI validation failed: ${error.message}`,
        processingTime: Date.now() - startTime,
      };
    }
  }

  getStrategyName(): string {
    return 'AI Validation';
  }

  isConfigurationValid(config: any): boolean {
    return !!(this.configService.get('OPENAI_API_KEY') || this.configService.get('ANTHROPIC_API_KEY'));
  }

  private async validateWithOpenAI(request: ValidationRequest): Promise<any> {
    try {
      const apiKey = this.configService.get('OPENAI_API_KEY');
      if (!apiKey) return null;

      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: this.configService.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            max_tokens: 150,
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        )
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) return null;

      return this.parseAIResponse(content, 'OpenAI');

    } catch (error) {
      this.logger.warn('OpenAI validation error:', error.message);
      return null;
    }
  }

  private async validateWithAnthropic(request: ValidationRequest): Promise<any> {
    try {
      const apiKey = this.configService.get('ANTHROPIC_API_KEY');
      if (!apiKey) return null;

      const prompt = this.buildAnthropicPrompt(request);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: this.configService.get('ANTHROPIC_MODEL', 'claude-3-haiku-20240307'),
            max_tokens: 150,
            messages: [{ role: 'user', content: prompt }],
          },
          {
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01',
            },
            timeout: 10000,
          }
        )
      );

      const content = response.data.content[0]?.text;
      if (!content) return null;

      return this.parseAIResponse(content, 'Anthropic');

    } catch (error) {
      this.logger.warn('Anthropic validation error:', error.message);
      return null;
    }
  }

  private buildSystemPrompt(): string {
    return `You are a word validation assistant for a word association game. Your task is to determine if a given word is valid for a specific category and starts with the correct letter.

Please respond in JSON format with the following structure:
{
  "isValid": boolean,
  "confidence": number (0-1),
  "reason": "explanation of your decision",
  "suggestions": ["alternative1", "alternative2"] (optional, only if invalid)
}

Rules:
1. The word must start with the specified letter
2. The word must be appropriate for the given category
3. Common nouns, proper nouns, and reasonable interpretations are generally acceptable
4. Be generous but reasonable in your validation
5. Confidence should reflect how certain you are (1.0 = completely certain, 0.5 = uncertain, 0.0 = completely wrong)`;
  }

  private buildUserPrompt(request: ValidationRequest): string {
    return `Please validate this word:
- Word: "${request.answer}"
- Category: "${request.category}"
- Must start with letter: "${request.context?.letter}"

Is this word valid for the given category?`;
  }

  private buildAnthropicPrompt(request: ValidationRequest): string {
    return `${this.buildSystemPrompt()}

${this.buildUserPrompt(request)}`;
  }

  private parseAIResponse(content: string, provider: string): any {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to parse the entire response as JSON
        const parsed = JSON.parse(content);
        return { ...parsed, provider };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, provider };

    } catch (error) {
      this.logger.warn(`Failed to parse ${provider} response:`, error.message);
      
      // Fallback parsing for non-JSON responses
      const isValid = content.toLowerCase().includes('valid') && !content.toLowerCase().includes('not valid');
      const confidence = isValid ? 0.6 : 0.3;
      
      return {
        isValid,
        confidence,
        reason: `${provider} response: ${content.slice(0, 100)}...`,
        provider,
      };
    }
  }
}
