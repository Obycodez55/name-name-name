import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { RedisService } from '@modules/persistence/redis/redis.service';
import { MongodbService } from '@modules/persistence/mongodb/mongodb.service';
import { RoomService } from '@modules/room/room.service';
import { WebsocketGateway } from '@modules/websocket/websocket.gateway';
import { GameLogger } from '@common/utils/logger';
import {
  GameState,
  GamePhase,
  Round,
  PlayerAnswers,
  LetterSelectionMode,
  ValidationResults,
  GAME_CONSTANTS,
  WEBSOCKET_EVENTS,
  getRandomLetter,
} from '@name-name-name/shared';
import { v4 as uuidv4 } from 'uuid';
import { StartGameDto } from './dto/round-config.dto';
import { GameStateData } from './interfaces/game-state.interface';
import { SelectLetterDto } from './dto/select-letter.dto';
import { RoundData } from './interfaces/round.interface';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { AnswerSubmissionResult } from './interfaces/answer.interface';

@Injectable()
export class GameService {
  private readonly logger = new GameLogger(GameService.name);
  private activeTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly redisService: RedisService,
    private readonly mongodbService: MongodbService,
    private readonly roomService: RoomService,
    private readonly validationService: ValidationService,
    private readonly scoringService: ScoringService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async startGame(startGameDto: StartGameDto): Promise<GameState> {
    try {
      const { roomCode, playerId } = startGameDto;

      // Validate room and player permissions
      const room = await this.roomService.getRoomData(roomCode);
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      if (room.creatorId !== playerId) {
        throw new BadRequestException('Only room creator can start the game');
      }

      // Check if all players are ready
      const allReady = await this.roomService.areAllPlayersReady(roomCode);
      if (!allReady) {
        throw new BadRequestException('Not all players are ready');
      }

      // Check minimum player count
      if (room.currentPlayerCount < GAME_CONSTANTS.MIN_PLAYERS) {
        throw new BadRequestException(`Minimum ${GAME_CONSTANTS.MIN_PLAYERS} players required to start game`);
      }

      // Create initial game state
      const players = Object.values(room.players);
      const roundMasterRotation = players.map(p => p.id);

      const gameState: GameStateData = {
        gameId: uuidv4(),
        roomCode,
        phase: GamePhase.LETTER_SELECTION,
        config: room.config,
        currentRound: undefined,
        rounds: [],
        players: room.players,
        scores: Object.fromEntries(players.map(p => [p.id, 0])),
        roundMasterRotation,
        currentRoundMasterIndex: 0,
        gameStartTime: new Date(),
        isActive: true,
      };

      // Save game state
      await this.redisService.setGameState(roomCode, gameState);

      this.logger.logRoomEvent(roomCode, 'Game started', { playerCount: players.length });

      // Broadcast game started event
      await this.websocketGateway.broadcastGameEvent(roomCode, WEBSOCKET_EVENTS.GAME_STARTED, {
        gameState,
        roundMaster: players[0],
      });

      // Start first round preparation
      await this.prepareNextRound(roomCode);

      return gameState;

    } catch (error) {
      this.logger.logError('Start game error', error, { startGameDto });
      throw error;
    }
  }

  async selectLetter(selectLetterDto: SelectLetterDto): Promise<void> {
    try {
      const { roomCode, playerId, letter } = selectLetterDto;

      const gameState = await this.getGameState(roomCode);
      if (!gameState) {
        throw new NotFoundException('Game not found');
      }

      // Validate game phase
      if (gameState.phase !== GamePhase.LETTER_SELECTION) {
        throw new BadRequestException('Letter selection not allowed in current game phase');
      }

      // Validate round master
      const currentRoundMaster = gameState.roundMasterRotation[gameState.currentRoundMasterIndex];
      if (currentRoundMaster !== playerId) {
        throw new BadRequestException('Only the round master can select the letter');
      }

      // Validate letter (optional: check if excluded)
    //   if (GAME_CONSTANTS.EXCLUDED_LETTERS?.includes(letter)) {
    //     throw new BadRequestException(`Letter ${letter} is not allowed`);
    //   }

      this.logger.logGameEvent(roomCode, gameState.rounds.length + 1, 'Letter selected', { letter, playerId });

      // Start the round with selected letter
      await this.startRound(roomCode, letter, playerId);

    } catch (error) {
      this.logger.logError('Select letter error', error, { selectLetterDto });
      throw error;
    }
  }

  async startRound(roomCode: string, letter?: string, triggeredBy?: string): Promise<Round> {
    try {
      const gameState = await this.getGameState(roomCode);
      if (!gameState) {
        throw new NotFoundException('Game not found');
      }

      // Auto-select letter if not provided
      if (!letter) {
        letter = getRandomLetter();
      }

      const roundNumber = gameState.rounds.length + 1;
      const currentRoundMaster = gameState.roundMasterRotation[gameState.currentRoundMasterIndex];

      // Create new round
      const round: RoundData = {
        roundNumber,
        letter,
        categories: gameState.config.categories,
        timeLimit: gameState.config.roundTimeLimit,
        startTime: new Date(),
        roundMasterId: currentRoundMaster,
        answers: {},
        scores: {},
        submissionOrder: [],
        allAnswersSubmitted: false,
      };

      // Update game state
      gameState.currentRound = round;
      gameState.phase = GamePhase.PLAYING;
      await this.redisService.setGameState(roomCode, gameState);

      this.logger.logGameEvent(roomCode, roundNumber, 'Round started', { letter, timeLimit: round.timeLimit });

      // Broadcast round started event
      await this.websocketGateway.broadcastGameEvent(roomCode, WEBSOCKET_EVENTS.ROUND_STARTED, {
        round,
        gameState,
      });

      // Set round timer
      await this.startRoundTimer(roomCode, round.timeLimit);

      return round;

    } catch (error) {
      this.logger.logError('Start round error', error, { roomCode, letter });
      throw error;
    }
  }

  async submitAnswers(submitAnswersDto: SubmitAnswersDto): Promise<AnswerSubmissionResult> {
    try {
      const { roomCode, playerId, answers } = submitAnswersDto;

      const gameState = await this.getGameState(roomCode);
      if (!gameState) {
        throw new NotFoundException('Game not found');
      }

      // Validate game phase
      if (gameState.phase !== GamePhase.PLAYING) {
        throw new BadRequestException('Answer submission not allowed in current game phase');
      }

      // Validate player is in game
      if (!gameState.players[playerId]) {
        throw new BadRequestException('Player not found in game');
      }

      // Validate round exists
      if (!gameState.currentRound) {
        throw new BadRequestException('No active round');
      }

      // Check if player already submitted
      if (gameState.currentRound.answers[playerId]) {
        throw new ConflictException('Answers already submitted for this round');
      }

      // Validate and process answers
      const processedAnswers = await this.processPlayerAnswers(
        answers,
        gameState.currentRound.letter,
        gameState.currentRound.categories
      );

      // Create player answers object
      const playerAnswers: PlayerAnswers = {
        playerId,
        answers: processedAnswers.answers,
        submittedAt: new Date(),
        isComplete: processedAnswers.isComplete,
      };

      // Store answers
      gameState.currentRound.answers[playerId] = playerAnswers;
      (gameState.currentRound as RoundData).submissionOrder?.push(playerId);

      // Save to Redis
      await this.redisService.setGameState(roomCode, gameState);
      await this.redisService.setRoundAnswers(roomCode, gameState.currentRound.roundNumber, playerId, playerAnswers);

      this.logger.logPlayerEvent(
        roomCode,
        playerId,
        'Answers submitted',
        { roundNumber: gameState.currentRound.roundNumber, answerCount: Object.keys(processedAnswers.answers).length }
      );

      // Broadcast submission event
      await this.websocketGateway.broadcastGameEvent(roomCode, WEBSOCKET_EVENTS.ANSWERS_SUBMITTED, {
        playerId,
        playerName: gameState.players[playerId].name,
        submissionTime: playerAnswers.submittedAt,
        playersRemaining: this.getPlayersWhoHaventSubmitted(gameState),
      });

      // Check if all players have submitted
      if (this.haveAllPlayersSubmitted(gameState)) {
        await this.endRound(roomCode);
      }

      return {
        playerId,
        submittedAt: playerAnswers.submittedAt,
        isComplete: playerAnswers.isComplete,
        validAnswerCount: processedAnswers.validAnswerCount,
        invalidAnswerCount: processedAnswers.invalidAnswerCount,
        emptyAnswerCount: processedAnswers.emptyAnswerCount,
      };

    } catch (error) {
      this.logger.logError('Submit answers error', error, { submitAnswersDto });
      throw error;
    }
  }

  async endRound(roomCode: string): Promise<void> {
    try {
      const gameState = await this.getGameState(roomCode);
      if (!gameState || !gameState.currentRound) {
        throw new NotFoundException('Active round not found');
      }

      // Clear round timer
      this.clearTimer(roomCode);

      // Mark round as ended
      gameState.currentRound.endTime = new Date();
      gameState.phase = GamePhase.VALIDATION;

      await this.redisService.setGameState(roomCode, gameState);

      this.logger.logGameEvent(roomCode, gameState.currentRound.roundNumber, 'Round ended');

      // Broadcast round ended event
      await this.websocketGateway.broadcastGameEvent(roomCode, WEBSOCKET_EVENTS.ROUND_ENDED, {
        round: gameState.currentRound,
      });

      // Start validation process
      await this.validateRoundAnswers(roomCode);

    } catch (error) {
      this.logger.logError('End round error', error, { roomCode });
      throw error;
    }
  }

  async validateRoundAnswers(roomCode: string): Promise<void> {
    try {
      const gameState = await this.getGameState(roomCode);
      if (!gameState || !gameState.currentRound) {
        throw new NotFoundException('Active round not found');
      }

      this.logger.logGameEvent(roomCode, gameState.currentRound.roundNumber, 'Starting answer validation');

      // Collect all answers for validation
      const allAnswers: { playerId: string; category: string; answer: string }[] = [];
      
      for (const [playerId, playerAnswers] of Object.entries(gameState.currentRound.answers)) {
        for (const [category, answer] of Object.entries(playerAnswers.answers)) {
          if (answer && answer.trim()) {
            allAnswers.push({ playerId, category, answer: answer.trim() });
          }
        }
      }

      // Validate answers based on game configuration
      const validationResults: ValidationResults = {};

      for (const answerData of allAnswers) {
        if (!validationResults[answerData.playerId]) {
          validationResults[answerData.playerId] = {};
        }

        const validation = await this.validationService.validateAnswer({
          answer: answerData.answer,
          category: answerData.category,
          letter: gameState.currentRound.letter,
          validationMode: gameState.config.validationMode,
        });

        validationResults[answerData.playerId][answerData.category] = validation;
      }

      // Store validation results
      gameState.currentRound.validationResults = validationResults;
      gameState.phase = GamePhase.SCORING;

      await this.redisService.setGameState(roomCode, gameState);

      this.logger.logGameEvent(roomCode, gameState.currentRound.roundNumber, 'Validation completed');

      // Calculate scores
      await this.calculateRoundScores(roomCode);

    } catch (error) {
      this.logger.logError('Validate answers error', error, { roomCode });
      throw error;
    }
  }

  async calculateRoundScores(roomCode: string): Promise<void> {
    try {
      const gameState = await this.getGameState(roomCode);
      if (!gameState || !gameState.currentRound) {
        throw new NotFoundException('Active round not found');
      }

      this.logger.logGameEvent(roomCode, gameState.currentRound.roundNumber, 'Calculating scores');

      // Calculate scores for this round
      const roundScores = await this.scoringService.calculateRoundScores(
        gameState.currentRound.answers,
        gameState.currentRound.validationResults || {},
        gameState.config
      );

      // Update round scores
      gameState.currentRound.scores = roundScores;

      // Update total scores
      for (const [playerId, roundScore] of Object.entries(roundScores)) {
        gameState.scores[playerId] = (gameState.scores[playerId] || 0) + roundScore;
      }

      // Move round to completed rounds
      gameState.rounds.push(gameState.currentRound);
      gameState.currentRound = undefined;
      gameState.phase = GamePhase.ROUND_RESULTS;

      await this.redisService.setGameState(roomCode, gameState);

      this.logger.logGameEvent(roomCode, gameState.rounds.length, 'Scores calculated');

      // Broadcast scores
      await this.websocketGateway.broadcastGameEvent(roomCode, WEBSOCKET_EVENTS.SCORES_CALCULATED, {
        roundScores,
        totalScores: gameState.scores,
        roundNumber: gameState.rounds.length,
      });

      // Check if game should end
      setTimeout(async () => {
        if (this.shouldGameEnd(gameState)) {
          await this.endGame(roomCode);
        } else {
          await this.prepareNextRound(roomCode);
        }
      }, 5000); // Give players time to see results

    } catch (error) {
      this.logger.logError('Calculate scores error', error, { roomCode });
      throw error;
    }
  }

  async prepareNextRound(roomCode: string): Promise<void> {
    try {
      const gameState = await this.getGameState(roomCode);
      if (!gameState) {
        throw new NotFoundException('Game not found');
      }

      // Advance round master
      gameState.currentRoundMasterIndex = (gameState.currentRoundMasterIndex + 1) % gameState.roundMasterRotation.length;
      
      // Set phase to letter selection or auto-start based on configuration
      if (gameState.config.letterSelectionMode === LetterSelectionMode.PLAYER_CHOICE) {
        gameState.phase = GamePhase.LETTER_SELECTION;
        
        await this.redisService.setGameState(roomCode, gameState);

        // Notify round master to select letter
        const roundMasterId = gameState.roundMasterRotation[gameState.currentRoundMasterIndex];
        await this.websocketGateway.broadcastGameEvent(roomCode, WEBSOCKET_EVENTS.SELECT_LETTER, {
          roundMasterId,
          roundMasterName: gameState.players[roundMasterId].name,
          roundNumber: gameState.rounds.length + 1,
        });

      } else {
        // Auto-start with random letter
        await this.startRound(roomCode);
      }

    } catch (error) {
      this.logger.logError('Prepare next round error', error, { roomCode });
      throw error;
    }
  }

  async endGame(roomCode: string): Promise<void> {
    try {
      const gameState = await this.getGameState(roomCode);
      if (!gameState) {
        throw new NotFoundException('Game not found');
      }

      // Determine winner
      const winner = this.determineWinner(gameState.scores);
      
      gameState.winner = winner;
      gameState.gameEndTime = new Date();
      gameState.phase = GamePhase.GAME_ENDED;
      gameState.isActive = false;

      await this.redisService.setGameState(roomCode, gameState);

      this.logger.logRoomEvent(roomCode, 'Game ended', { winner, totalRounds: gameState.rounds.length });

      // Calculate final scores and statistics
      const finalScores = await this.scoringService.calculateFinalScores(gameState);

      // Broadcast game ended event
      await this.websocketGateway.broadcastGameEvent(roomCode, WEBSOCKET_EVENTS.GAME_ENDED, {
        finalScores,
        winner: gameState.players[winner],
        gameStats: {
          totalRounds: gameState.rounds.length,
          gameDuration: gameState.gameEndTime.getTime() - gameState.gameStartTime!.getTime(),
          totalAnswers: this.calculateTotalAnswers(gameState),
        },
      });

      // Save game history to MongoDB
      const room = await this.roomService.getRoomData(roomCode);
      if (room) {
        await this.mongodbService.saveGameHistory(gameState, room);
      }

      // Clear all timers
      this.clearTimer(roomCode);

    } catch (error) {
      this.logger.logError('End game error', error, { roomCode });
      throw error;
    }
  }

  // Timer management methods
  private async startRoundTimer(roomCode: string, timeLimit: number): Promise<void> {
    const timer = setTimeout(async () => {
      try {
        await this.endRound(roomCode);
      } catch (error) {
        this.logger.logError('Round timer error', error, { roomCode });
      }
    }, timeLimit * 1000);

    this.activeTimers.set(roomCode, timer);

    // Send periodic timer updates
    this.sendTimerUpdates(roomCode, timeLimit);
  }

  private sendTimerUpdates(roomCode: string, totalTime: number): void {
    const startTime = Date.now();
    const updateInterval = setInterval(async () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, totalTime - elapsed);

      await this.websocketGateway.broadcastGameEvent(roomCode, WEBSOCKET_EVENTS.TIMER_UPDATE, {
        remaining,
        total: totalTime,
        elapsed,
      });

      if (remaining <= 0) {
        clearInterval(updateInterval);
      }
    }, 1000);
  }

  private clearTimer(roomCode: string): void {
    const timer = this.activeTimers.get(roomCode);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(roomCode);
    }
  }

  // Utility methods
  async getGameState(roomCode: string): Promise<GameStateData | null> {
    return await this.redisService.getGameState<GameStateData>(roomCode);
  }

  private async processPlayerAnswers(
    answers: Record<string, string>,
    letter: string,
    categories: string[]
  ): Promise<{
    answers: Record<string, string>;
    isComplete: boolean;
    validAnswerCount: number;
    invalidAnswerCount: number;
    emptyAnswerCount: number;
  }> {
    const processedAnswers: Record<string, string> = {};
    let validAnswerCount = 0;
    let invalidAnswerCount = 0;
    let emptyAnswerCount = 0;

    for (const category of categories) {
      const answer = answers[category]?.trim() || '';
      
      if (!answer) {
        emptyAnswerCount++;
        processedAnswers[category] = '';
      } else if (answer.toLowerCase().startsWith(letter.toLowerCase())) {
        validAnswerCount++;
        processedAnswers[category] = answer;
      } else {
        invalidAnswerCount++;
        processedAnswers[category] = answer; // Store invalid answers too for display
      }
    }

    return {
      answers: processedAnswers,
      isComplete: emptyAnswerCount === 0,
      validAnswerCount,
      invalidAnswerCount,
      emptyAnswerCount,
    };
  }

  private haveAllPlayersSubmitted(gameState: GameStateData): boolean {
    if (!gameState.currentRound) return false;
    
    const totalPlayers = Object.keys(gameState.players).length;
    const submittedCount = Object.keys(gameState.currentRound.answers).length;
    
    return submittedCount >= totalPlayers;
  }

  private getPlayersWhoHaventSubmitted(gameState: GameStateData): string[] {
    if (!gameState.currentRound) return [];
    
    const allPlayerIds = Object.keys(gameState.players);
    const submittedPlayerIds = Object.keys(gameState.currentRound.answers);
    
    return allPlayerIds.filter(id => !submittedPlayerIds.includes(id));
  }

  private shouldGameEnd(gameState: GameStateData): boolean {
    // Check max rounds
    if (gameState.config.maxRounds && gameState.rounds.length >= gameState.config.maxRounds) {
      return true;
    }

    // Add other end conditions here (e.g., time limits, score targets)
    
    return false;
  }

  private determineWinner(scores: Record<string, number>): string {
    let maxScore = -1;
    let winner = '';

    for (const [playerId, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        winner = playerId;
      }
    }

    return winner;
  }

  private calculateTotalAnswers(gameState: GameStateData): number {
    let total = 0;
    for (const round of gameState.rounds) {
      for (const playerAnswers of Object.values(round.answers)) {
        total += Object.values(playerAnswers.answers).filter(answer => answer.trim()).length;
      }
    }
    return total;
  }
}