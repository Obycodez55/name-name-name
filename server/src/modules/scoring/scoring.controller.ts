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
import { ScoringService } from './scoring.service';
import { ApiResponse as CustomApiResponse } from '@name-name-name/shared';
import { CalculateScoresDto } from './dto/calculate-scores.dto';

@ApiTags('scoring')
@Controller('scoring')
export class ScoringController {
  private readonly logger = new Logger(ScoringController.name);

  constructor(private readonly scoringService: ScoringService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate scores for a round' })
  @ApiBody({ type: CalculateScoresDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scores calculated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid scoring request',
  })
  async calculateScores(@Body() calculateScoresDto: CalculateScoresDto): Promise<CustomApiResponse> {
    try {
      this.logger.log('Calculating scores for round');
      
      const scores = await this.scoringService.calculateRoundScores(
        calculateScoresDto.playerAnswers,
        calculateScoresDto.validationResults,
        calculateScoresDto.gameConfig,
        calculateScoresDto.roundNumber
      );

      return {
        success: true,
        data: { scores },
        message: 'Scores calculated successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to calculate scores:', error);
      throw error;
    }
  }

  @Post('detailed')
  @ApiOperation({ summary: 'Calculate detailed scores with breakdown' })
  @ApiBody({ type: CalculateScoresDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detailed scores calculated successfully',
  })
  async calculateDetailedScores(@Body() calculateScoresDto: CalculateScoresDto): Promise<CustomApiResponse> {
    try {
      this.logger.log('Calculating detailed scores for round');
      
      const scoringConfig = this.scoringService['getScoringConfig'](calculateScoresDto.gameConfig);
      const result = await this.scoringService.calculateDetailedScores(
        calculateScoresDto.playerAnswers,
        calculateScoresDto.validationResults,
        scoringConfig,
        calculateScoresDto.roundNumber
      );

      return {
        success: true,
        data: result,
        message: 'Detailed scores calculated successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to calculate detailed scores:', error);
      throw error;
    }
  }

  @Get('constants')
  @ApiOperation({ summary: 'Get scoring constants and configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scoring constants retrieved successfully',
  })
  async getScoringConstants(): Promise<CustomApiResponse> {
    try {
      const constants = {
        POINTS_VALID_ANSWER: 10,
        POINTS_UNIQUE_ANSWER: 15,
        POINTS_INVALID_ANSWER: 0,
        POINTS_EMPTY_ANSWER: 0,
        COMPLETION_BONUS_POINTS: 5,
        DEFAULT_CATEGORY_WEIGHT: 1.0,
      };

      return {
        success: true,
        data: { constants },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get scoring constants:', error);
      throw error;
    }
  }
}