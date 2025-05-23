import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { RoomService } from './room.service';
import { WebSocketExceptionFilter } from '@common/filters/websocket-exception.filter';
import { 
    PlayerStatus,
  WEBSOCKET_EVENTS,
  WebSocketResponse,
} from '@name-name-name/shared';
import { SocketWithData } from '../websocket/interfaces/socket-with-data.interface';

@UseFilters(WebSocketExceptionFilter)
@WebSocketGateway()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RoomGateway.name);

  constructor(private readonly roomService: RoomService) {}

  handleConnection(client: SocketWithData) {
    this.logger.log(`Room Gateway - Client connected: ${client.id}`);
  }

  handleDisconnect(client: SocketWithData) {
    this.logger.log(`Room Gateway - Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('updateRoomConfig')
  async handleUpdateRoomConfig(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string; config: any },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId, config } = payload;

      // Validate player is in room and is creator
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      const room = await this.roomService.updateRoomConfig(
        roomCode,
        { config },
        playerId,
      );

      // Broadcast updated config to all players in room
      client.to(roomCode).emit('roomConfigUpdated', {
        success: true,
        data: { room },
        timestamp: new Date(),
      });

      this.logger.log(`Room ${roomCode} configuration updated by ${playerId}`);

      return {
        success: true,
        data: { room },
        message: 'Room configuration updated',
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Update room config error:', error);
      return this.sendError(client, 'UPDATE_CONFIG_ERROR', error.message);
    }
  }

  @SubscribeMessage('setPlayerReady')
  async handleSetPlayerReady(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string; isReady: boolean },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId, isReady } = payload;

      // Validate player is in room
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      const player = await this.roomService.setPlayerReady(roomCode, playerId, isReady);

      // Broadcast player ready status to room
      client.to(roomCode).emit('playerReadyStatusChanged', {
        success: true,
        data: {
          playerId,
          playerName: player.name,
          isReady,
        },
        timestamp: new Date(),
      });

      // Check if all players are ready
      const allReady = await this.roomService.areAllPlayersReady(roomCode);
      if (allReady) {
        client.to(roomCode).emit('allPlayersReady', {
          success: true,
          data: { canStartGame: true },
          timestamp: new Date(),
        });
      }

      this.logger.log(`Player ${playerId} in room ${roomCode} set ready: ${isReady}`);

      return {
        success: true,
        data: { player, allPlayersReady: allReady },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Set player ready error:', error);
      return this.sendError(client, 'SET_READY_ERROR', error.message);
    }
  }

  @SubscribeMessage('getRoomStatus')
  async handleGetRoomStatus(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode } = payload;

      const room = await this.roomService.getRoomData(roomCode);
      if (!room) {
        return this.sendError(client, 'ROOM_NOT_FOUND', 'Room not found');
      }

      const gameState = await this.roomService['redisService'].getGameState(roomCode);
      const allPlayersReady = await this.roomService.areAllPlayersReady(roomCode);

      return {
        success: true,
        data: {
          room,
          gameState,
          allPlayersReady,
        },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Get room status error:', error);
      return this.sendError(client, 'GET_STATUS_ERROR', error.message);
    }
  }

  @SubscribeMessage('updatePlayerStatus')
  async handleUpdatePlayerStatus(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { 
      roomCode: string; 
      playerId: string; 
      status: { status?: PlayerStatus; lastActiveAt?: Date } 
    },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId, status } = payload;

      // Validate player is in room
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      const player = await this.roomService.updatePlayerStatus(roomCode, playerId, status);

      // Broadcast status update to room
      client.to(roomCode).emit(WEBSOCKET_EVENTS.PLAYER_STATUS_UPDATE, {
        success: true,
        data: {
          playerId,
          status: player.status,
          lastActiveAt: player.lastActiveAt,
        },
        timestamp: new Date(),
      });

      return {
        success: true,
        data: { player },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Update player status error:', error);
      return this.sendError(client, 'UPDATE_STATUS_ERROR', error.message);
    }
  }

  @SubscribeMessage('kickPlayer')
  async handleKickPlayer(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string; targetPlayerId: string },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId, targetPlayerId } = payload;

      // Validate requesting player is in room
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      await this.roomService.kickPlayer(roomCode, targetPlayerId, playerId);

      // Broadcast kick event to room
      client.to(roomCode).emit('playerKicked', {
        success: true,
        data: {
          kickedPlayerId: targetPlayerId,
          kickedBy: playerId,
        },
        timestamp: new Date(),
      });

      this.logger.log(`Player ${targetPlayerId} kicked from room ${roomCode} by ${playerId}`);

      return {
        success: true,
        message: 'Player kicked successfully',
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Kick player error:', error);
      return this.sendError(client, 'KICK_PLAYER_ERROR', error.message);
    }
  }

  @SubscribeMessage('pingRoom')
  async handlePingRoom(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string },
  ): Promise<WebSocketResponse> {
    try {
      const { roomCode, playerId } = payload;

      // Update player's last activity
      if (client.roomCode === roomCode && client.playerId === playerId) {
        await this.roomService.updatePlayerStatus(roomCode, playerId, {
          lastActiveAt: new Date(),
        });
      }

      return {
        success: true,
        data: { pong: true },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error('Ping room error:', error);
      return this.sendError(client, 'PING_ERROR', error.message);
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