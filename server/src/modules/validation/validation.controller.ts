import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ValidationService } from './validation.service';
import { ApiResponse as CustomApiResponse } from '@name-name-name/shared';
import { ValidateAnswerDto } from './dto/validate-answer.dto';
import { ValidationResultDto } from './dto/validation-result.dto';

@ApiTags('validation')
@Controller('validation')
export class ValidationController {
  private readonly logger = new Logger(ValidationController.name);

  constructor(private readonly validationService: ValidationService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a single answer' })
  @ApiBody({ type: ValidateAnswerDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Answer validated successfully',
    type: ValidationResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid validation request',
  })
  async validateAnswer(@Body() validateAnswerDto: ValidateAnswerDto): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Validating answer: ${validateAnswerDto.answer} for category ${validateAnswerDto.category}`);
      
      const result = await this.validationService.validateAnswer({
        answer: validateAnswerDto.answer,
        category: validateAnswerDto.category,
        strategy: validateAnswerDto.validationMode,
        playerId: validateAnswerDto.playerId || 'standalone-validation',
        context: {
          roundNumber: 1, // Default for standalone validation
          gameConfig: validateAnswerDto.config,
          letter: validateAnswerDto.letter,
        },
      });

      return {
        success: true,
        data: { result },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to validate answer:', error);
      throw error;
    }
  }

  @Post('validate-batch')
  @ApiOperation({ summary: 'Validate multiple answers at once' })
  @ApiBody({ 
    type: [ValidateAnswerDto],
    description: 'Array of answers to validate'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Answers validated successfully',
  })
  async validateMultipleAnswers(@Body() requests: ValidateAnswerDto[]): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Validating ${requests.length} answers`);
      
      const validationRequests = requests.map(req => ({
        answer: req.answer,
        category: req.category,
        letter: req.letter,
        strategy: req.validationMode,
        context: {
          letter: req.letter,
          roundNumber: 1,
          gameConfig: req.config || {},
        },
      }));

      const results = await this.validationService.validateMultipleAnswers(validationRequests);

      return {
        success: true,
        data: { results },
        message: `Validated ${results.length} answers`,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to validate multiple answers:', error);
      throw error;
    }
  }

  @Get('dictionary/:category')
  @ApiOperation({ summary: 'Get dictionary words for a category' })
  @ApiParam({ name: 'category', description: 'Category name', example: 'animals' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dictionary words retrieved successfully',
  })
  async getDictionaryWords(@Param('category') category: string): Promise<CustomApiResponse> {
    try {
      const words = await this.validationService.getDictionaryWords(category);
      
      return {
        success: true,
        data: { 
          category,
          words,
          count: words.length 
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get dictionary words for ${category}:`, error);
      throw error;
    }
  }

  @Post('dictionary/:category/words')
  @ApiOperation({ summary: 'Add words to dictionary category' })
  @ApiParam({ name: 'category', description: 'Category name', example: 'animals' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        words: {
          type: 'array',
          items: { type: 'string' },
          example: ['elephant', 'eagle', 'emu']
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Words added to dictionary successfully',
  })
  async addDictionaryWords(
    @Param('category') category: string,
    @Body() body: { words: string[] },
  ): Promise<CustomApiResponse> {
    try {
      await this.validationService.addDictionaryWords(category, body.words);
      
      return {
        success: true,
        message: `Added ${body.words.length} words to ${category} dictionary`,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to add words to dictionary ${category}:`, error);
      throw error;
    }
  }

  @Get('strategies')
  @ApiOperation({ summary: 'Get available validation strategies' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available strategies retrieved successfully',
  })
  async getAvailableStrategies(): Promise<CustomApiResponse> {
    try {
      const strategies = await this.validationService.getAvailableStrategies();
      
      return {
        success: true,
        data: { strategies },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get available strategies:', error);
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get validation statistics' })
  @ApiQuery({ 
    name: 'timeframe', 
    required: false, 
    enum: ['day', 'week', 'month'],
    description: 'Statistics timeframe' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation statistics retrieved successfully',
  })
  async getValidationStats(
    @Query('timeframe') timeframe: 'day' | 'week' | 'month' = 'day',
  ): Promise<CustomApiResponse> {
    try {
      const stats = await this.validationService.getValidationStats(timeframe);
      
      return {
        success: true,
        data: { stats, timeframe },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get validation stats:', error);
      throw error;
    }
  }
}