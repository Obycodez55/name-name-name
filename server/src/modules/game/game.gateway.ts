import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { GameService } from './game.service';
import { WebSocketExceptionFilter } from '@common/filters/websocket-exception.filter';
import { 
  WEBSOCKET_EVENTS,
  WebSocketResponse,
} from '@name-name-name/shared';
import { SocketWithData } from '../websocket/interfaces/socket-with-data.interface';

@UseFilters(WebSocketExceptionFilter)
@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name);

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: SocketWithData) {
    this.logger.log(`Game Gateway - Client connected: ${client.id}`);
  }

  handleDisconnect(client: SocketWithData) {
    this.logger.log(`Game Gateway - Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.START_GAME)
  async handleStartGame(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId } = payload;

      // Validate player is in room
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      const gameState = await this.gameService.startGame({ roomCode, playerId });

      this.logger.log(`Game started in room ${roomCode} by player ${playerId}`);

      return {
        success: true,
        data: { gameState },
        message: 'Game started successfully',
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Start game error:', error);
      return this.sendError(client, 'START_GAME_ERROR', error.message);
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.SELECT_LETTER)
  async handleSelectLetter(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string; letter: string },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId, letter } = payload;

      // Validate player is in room
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      await this.gameService.selectLetter({ roomCode, playerId, letter });

      this.logger.log(`Letter ${letter} selected in room ${roomCode} by player ${playerId}`);

      return {
        success: true,
        message: 'Letter selected and round started',
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Select letter error:', error);
      return this.sendError(client, 'SELECT_LETTER_ERROR', error.message);
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.SUBMIT_ANSWERS)
  async handleSubmitAnswers(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string; answers: Record<string, string> },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId, answers } = payload;

      // Validate player is in room
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      const result = await this.gameService.submitAnswers({ roomCode, playerId, answers });

      this.logger.log(`Answers submitted in room ${roomCode} by player ${playerId}`);

      return {
        success: true,
        data: { submission: result },
        message: 'Answers submitted successfully',
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Submit answers error:', error);
      return this.sendError(client, 'SUBMIT_ANSWERS_ERROR', error.message);
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.START_ROUND)
  async handleStartRound(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string; timeLimit?: number },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId, timeLimit } = payload;

      // Validate player is in room and is round master
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      // Get game state to validate round master
      const gameState = await this.gameService.getGameState(roomCode);
      if (!gameState) {
        return this.sendError(client, 'GAME_NOT_FOUND', 'Game not found');
      }

      const currentRoundMaster = gameState.roundMasterRotation[gameState.currentRoundMasterIndex];
      if (currentRoundMaster !== playerId) {
        return this.sendError(client, 'NOT_ROUND_MASTER', 'Only round master can start the round');
      }

      const round = await this.gameService.startRound(roomCode);

      this.logger.log(`Round started in room ${roomCode} by round master ${playerId}`);

      return {
        success: true,
        data: { round },
        message: 'Round started successfully',
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Start round error:', error);
      return this.sendError(client, 'START_ROUND_ERROR', error.message);
    }
  }

  @SubscribeMessage('getGameStatus')
  async handleGetGameStatus(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode } = payload;

      const gameState = await this.gameService.getGameState(roomCode);

      return {
        success: true,
        data: { gameState },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Get game status error:', error);
      return this.sendError(client, 'GET_STATUS_ERROR', error.message);
    }
  }

  @SubscribeMessage('playerTypingAnswer')
  async handlePlayerTypingAnswer(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { 
      roomCode: string; 
      playerId: string; 
      category: string; 
      isTyping: boolean 
    },
  ): Promise<void> {
    try {
      const { roomCode, playerId, category, isTyping } = payload;

      // Validate player is in room
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return;
      }

      // Broadcast typing status to other players
      client.to(roomCode).emit('playerTypingAnswer', {
        success: true,
        data: {
          playerId,
          category,
          isTyping,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error('Player typing answer error:', error);
    }
  }

  @SubscribeMessage('requestTimeRemaining')
  async handleRequestTimeRemaining(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode } = payload;

      const gameState = await this.gameService.getGameState(roomCode);
      if (!gameState || !gameState.currentRound) {
        return this.sendError(client, 'NO_ACTIVE_ROUND', 'No active round found');
      }

      const now = new Date();
      const roundStartTime = new Date(gameState.currentRound.startTime);
      const elapsed = Math.floor((now.getTime() - roundStartTime.getTime()) / 1000);
      const remaining = Math.max(0, gameState.currentRound.timeLimit - elapsed);

      return {
        success: true,
        data: {
          remaining,
          total: gameState.currentRound.timeLimit,
          elapsed,
        },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Request time remaining error:', error);
      return this.sendError(client, 'TIME_ERROR', error.message);
    }
  }

  @SubscribeMessage('forceEndRound')
  async handleForceEndRound(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId } = payload;

      // Validate player is in room and is round master or creator
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      // Additional validation could be added here to check if player is round master or room creator

      await this.gameService.endRound(roomCode);

      this.logger.log(`Round force-ended in room ${roomCode} by player ${playerId}`);

      return {
        success: true,
        message: 'Round ended successfully',
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Force end round error:', error);
      return this.sendError(client, 'END_ROUND_ERROR', error.message);
    }
  }

  @SubscribeMessage('requestRoundSummary')
  async handleRequestRoundSummary(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; roundNumber?: number },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, roundNumber } = payload;

      const gameState = await this.gameService.getGameState(roomCode);
      if (!gameState) {
        return this.sendError(client, 'GAME_NOT_FOUND', 'Game not found');
      }

      let targetRound;
      if (roundNumber !== undefined) {
        targetRound = gameState.rounds.find(r => r.roundNumber === roundNumber);
      } else {
        // Get the last completed round
        targetRound = gameState.rounds[gameState.rounds.length - 1];
      }

      if (!targetRound) {
        return this.sendError(client, 'ROUND_NOT_FOUND', 'Round not found');
      }

      return {
        success: true,
        data: { round: targetRound },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Request round summary error:', error);
      return this.sendError(client, 'ROUND_SUMMARY_ERROR', error.message);
    }
  }

  private sendError(client: SocketWithData, errorCode: string, message: string): WebSocketResponse {
    const response: WebSocketResponse = {
      success: false,
      error: errorCode,
      message,
      timestamp: new Date(),
    };
    return response;
  }
}