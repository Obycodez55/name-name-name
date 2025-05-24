import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
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
import { GameService } from './game.service';
import { RoomCodeValidationPipe } from '@common/pipes/room-code-validation.pipe';
import { RoomExistsGuard } from '@common/guards/room-exists.guard';
import { ApiResponse as CustomApiResponse } from '@name-name-name/shared';
import { StartGameDto } from './dto/round-config.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { SelectLetterDto } from './dto/select-letter.dto';

@ApiTags('games')
@Controller('games')
export class GameController {
  private readonly logger = new Logger(GameController.name);

  constructor(private readonly gameService: GameService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new game' })
  @ApiBody({ type: StartGameDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Game started successfully',
    schema: {
      example: {
        success: true,
        data: {
          gameState: {
            gameId: 'uuid-here',
            roomCode: 'ABC123',
            phase: 'letter_selection',
            players: {},
            scores: {},
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot start game (not enough players, not all ready, etc.)',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only room creator can start the game',
  })
  async startGame(@Body() startGameDto: StartGameDto): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Starting game in room ${startGameDto.roomCode}`);
      
      const gameState = await this.gameService.startGame(startGameDto);
      
      return {
        success: true,
        data: { gameState },
        message: 'Game started successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to start game:', error);
      throw error;
    }
  }

  @Get(':roomCode/state')
  @UseGuards(RoomExistsGuard)
  @ApiOperation({ summary: 'Get current game state' })
  @ApiParam({ name: 'roomCode', description: 'Room code', example: 'ABC123' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Game state retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Game not found',
  })
  async getGameState(
    @Param('roomCode', RoomCodeValidationPipe) roomCode: string,
  ): Promise<CustomApiResponse> {
    try {
      const gameState = await this.gameService.getGameState(roomCode);
      
      if (!gameState) {
        return {
          success: false,
          error: 'GAME_NOT_FOUND',
          message: 'No active game found in this room',
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: { gameState },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get game state for room ${roomCode}:`, error);
      throw error;
    }
  }

  @Post('submit-answers')
  @ApiOperation({ summary: 'Submit answers for current round' })
  @ApiBody({ type: SubmitAnswersDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Answers submitted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid submission (wrong phase, already submitted, etc.)',
  })
  async submitAnswers(@Body() submitAnswersDto: SubmitAnswersDto): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Player ${submitAnswersDto.playerId} submitting answers in room ${submitAnswersDto.roomCode}`);
      
      const result = await this.gameService.submitAnswers(submitAnswersDto);
      
      return {
        success: true,
        data: { submission: result },
        message: 'Answers submitted successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to submit answers:', error);
      throw error;
    }
  }

  @Post('select-letter')
  @ApiOperation({ summary: 'Select letter for round (round master only)' })
  @ApiBody({ type: SelectLetterDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Letter selected and round started',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid letter selection (wrong phase, not round master, etc.)',
  })
  async selectLetter(@Body() selectLetterDto: SelectLetterDto): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Player ${selectLetterDto.playerId} selecting letter ${selectLetterDto.letter} in room ${selectLetterDto.roomCode}`);
      
      await this.gameService.selectLetter(selectLetterDto);
      
      return {
        success: true,
        message: 'Letter selected and round started',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to select letter:', error);
      throw error;
    }
  }

  @Post(':roomCode/end')
  @UseGuards(RoomExistsGuard)
  @ApiOperation({ summary: 'Force end the current game (creator only)' })
  @ApiParam({ name: 'roomCode', description: 'Room code', example: 'ABC123' })
  @ApiQuery({ name: 'playerId', description: 'Player ID (must be creator)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Game ended successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only room creator can end the game',
  })
  async endGame(
    @Param('roomCode', RoomCodeValidationPipe) roomCode: string,
    @Query('playerId') playerId: string,
  ): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Force ending game in room ${roomCode} by player ${playerId}`);
      
      // TODO: Add validation that player is room creator
      await this.gameService.endGame(roomCode);
      
      return {
        success: true,
        message: 'Game ended successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to end game in room ${roomCode}:`, error);
      throw error;
    }
  }
}