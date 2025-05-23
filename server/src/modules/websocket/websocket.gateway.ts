import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '@modules/persistence/redis/redis.service';
import { WebSocketExceptionFilter } from '@common/filters/websocket-exception.filter';
import { GameLogger } from '@common/utils/logger';
import { 
  WEBSOCKET_EVENTS,
  WebSocketResponse,
  JoinRoomPayload,
  LeaveRoomPayload,
  ChatMessagePayload,
  Player,
} from '@name-name-name/shared';
import { SocketWithData } from './interfaces/socket-with-data.interface';


@UseFilters(WebSocketExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new GameLogger(WebsocketGateway.name);
  private connectedClients = new Map<string, SocketWithData>();

  constructor(private readonly redisService: RedisService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: SocketWithData, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
    
    // Store connection info in Redis
    await this.redisService.setObject(`connection:${client.id}`, {
      socketId: client.id,
      connectedAt: new Date(),
      lastActivity: new Date(),
    }, 3600); // 1 hour TTL
  }

  async handleDisconnect(client: SocketWithData) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Handle player leaving room if they were in one
    if (client.roomCode && client.playerId) {
      await this.handlePlayerLeaveRoom(client, {
        roomCode: client.roomCode,
        playerId: client.playerId,
      });
    }

    // Clean up connection data
    this.connectedClients.delete(client.id);
    await this.redisService.delete(`connection:${client.id}`);
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    try {
      const { roomCode, playerName, avatar } = payload;
      
      this.logger.logRoomEvent(roomCode, 'Player attempting to join', { playerName, socketId: client.id });

      // Validate room exists
      const roomExists = await this.redisService.exists(`room:${roomCode}`);
      if (!roomExists) {
        return this.sendError(client, 'ROOM_NOT_FOUND', 'Room not found');
      }

      // Generate player ID and store player data
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update client socket data
      client.playerId = playerId;
      client.playerName = playerName;
      client.roomCode = roomCode;

      // Join socket to room
      await client.join(roomCode);

      // Add player to room in Redis
      await this.redisService.addPlayerToRoom(roomCode, playerId);
      await this.redisService.setPlayerData(playerId, {
        id: playerId,
        name: playerName,
        avatar,
        socketId: client.id,
        roomCode,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        isReady: false,
        status: 'online',
      });

      // Get current room data
      const roomData = await this.redisService.getRoomData(roomCode);
      const players = await this.getRoomPlayersData(roomCode);

      this.logger.logPlayerEvent(roomCode, playerId, 'Joined room successfully');

      // Notify all players in room
      this.server.to(roomCode).emit(WEBSOCKET_EVENTS.PLAYER_JOINED, {
        success: true,
        data: {
          playerId,
          playerName,
          avatar,
          players,
          roomData,
        },
        timestamp: new Date(),
      });

      // Send success response to joining player
      return this.sendSuccess(client, {
        playerId,
        roomCode,
        players,
        roomData,
      });

    } catch (error) {
      this.logger.logError('Join room error', error, { payload });
      return this.sendError(client, 'JOIN_ROOM_ERROR', 'Failed to join room');
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.LEAVE_ROOM)
  async handleLeaveRoom(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: LeaveRoomPayload,
  ) {
    return await this.handlePlayerLeaveRoom(client, payload);
  }

  private async handlePlayerLeaveRoom(client: SocketWithData, payload: LeaveRoomPayload) {
    try {
      const { roomCode, playerId } = payload;

      this.logger.logPlayerEvent(roomCode, playerId, 'Leaving room');

      // Remove player from room
      await this.redisService.removePlayerFromRoom(roomCode, playerId);
      await this.redisService.delete(`player:${playerId}`);

      // Leave socket room
      await client.leave(roomCode);

      // Clear client data
      client.playerId = undefined;
      client.playerName = undefined;
      client.roomCode = undefined;

      // Get updated player list
      const players = await this.getRoomPlayersData(roomCode);

      // Notify remaining players
      client.to(roomCode).emit(WEBSOCKET_EVENTS.PLAYER_LEFT, {
        success: true,
        data: {
          playerId,
          players,
        },
        timestamp: new Date(),
      });

      // Check if room is empty and clean up if needed
      if (players.length === 0) {
        await this.cleanupEmptyRoom(roomCode);
      }

      this.logger.logPlayerEvent(roomCode, playerId, 'Left room successfully');

      return this.sendSuccess(client, { message: 'Left room successfully' });

    } catch (error) {
      this.logger.logError('Leave room error', error, { payload });
      return this.sendError(client, 'LEAVE_ROOM_ERROR', 'Failed to leave room');
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.CHAT_MESSAGE)
  async handleChatMessage(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: ChatMessagePayload,
  ) {
    try {
      const { roomCode, playerId, message, type = 'chat' } = payload;

      // Validate player is in room
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return this.sendError(client, 'UNAUTHORIZED', 'Not authorized for this room');
      }

      // Get player data
      const playerData = await this.redisService.getPlayerData<Player>(playerId);
      if (!playerData) {
        return this.sendError(client, 'PLAYER_NOT_FOUND', 'Player not found');
      }

      // Broadcast chat message to room
      this.server.to(roomCode).emit(WEBSOCKET_EVENTS.CHAT_MESSAGE, {
        success: true,
        data: {
          playerId,
          playerName: playerData.name,
          message,
          type,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      });

      this.logger.logPlayerEvent(roomCode, playerId, 'Sent chat message', { message, type });

      return this.sendSuccess(client, { message: 'Message sent' });

    } catch (error) {
      this.logger.logError('Chat message error', error, { payload });
      return this.sendError(client, 'CHAT_ERROR', 'Failed to send message');
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.PLAYER_TYPING)
  async handlePlayerTyping(
    @ConnectedSocket() client: SocketWithData,
    @MessageBody() payload: { roomCode: string; playerId: string; isTyping: boolean },
  ) {
    try {
      const { roomCode, playerId, isTyping } = payload;

      // Validate player is in room
      if (client.roomCode !== roomCode || client.playerId !== playerId) {
        return;
      }

      // Broadcast typing status to other players in room
      client.to(roomCode).emit(WEBSOCKET_EVENTS.PLAYER_TYPING, {
        success: true,
        data: {
          playerId,
          isTyping,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.logError('Player typing error', error, { payload });
    }
  }

  // Utility methods for broadcasting to rooms
  async broadcastToRoom(roomCode: string, event: string, data: any): Promise<void> {
    this.server.to(roomCode).emit(event, {
      success: true,
      data,
      timestamp: new Date(),
    });
  }

  async broadcastToPlayer(playerId: string, event: string, data: any): Promise<void> {
    const playerData = await this.redisService.getPlayerData<Player>(playerId);
    if (playerData?.socketId) {
      const client = this.connectedClients.get(playerData.socketId);
      if (client) {
        client.emit(event, {
          success: true,
          data,
          timestamp: new Date(),
        });
      }
    }
  }

  async broadcastSystemMessage(roomCode: string, message: string): Promise<void> {
    await this.broadcastToRoom(roomCode, WEBSOCKET_EVENTS.SYSTEM_MESSAGE, {
      message,
      type: 'system',
    });
  }

  async broadcastGameEvent(roomCode: string, event: string, data: any): Promise<void> {
    this.logger.logRoomEvent(roomCode, `Broadcasting ${event}`, data);
    await this.broadcastToRoom(roomCode, event, data);
  }

  // Helper methods
  private async getRoomPlayersData(roomCode: string): Promise<any[]> {
    const playerIds = await this.redisService.getRoomPlayers(roomCode);
    const players = [];

    for (const playerId of playerIds) {
      const playerData = await this.redisService.getPlayerData(playerId);
      if (playerData) {
        players.push(playerData);
      }
    }

    return players;
  }

  private async cleanupEmptyRoom(roomCode: string): Promise<void> {
    this.logger.logRoomEvent(roomCode, 'Cleaning up empty room');
    
    // Delete room data from Redis
    await this.redisService.deleteRoomData(roomCode);
    
    // Note: In a production environment, you might want to save final game state
    // to MongoDB before cleanup if the game was in progress
  }

  private sendSuccess(client: Socket, data?: any): WebSocketResponse {
    const response: WebSocketResponse = {
      success: true,
      data,
      timestamp: new Date(),
    };
    return response;
  }

  private sendError(client: Socket, errorCode: string, message: string): WebSocketResponse {
    const response: WebSocketResponse = {
      success: false,
      error: errorCode,
      message,
      timestamp: new Date(),
    };
    client.emit(WEBSOCKET_EVENTS.ERROR, response);
    return response;
  }

  // Connection health check methods
  async getConnectedPlayersCount(): Promise<number> {
    return this.connectedClients.size;
  }

  async getRoomConnectionsCount(roomCode: string): Promise<number> {
    const room = this.server.sockets.adapter.rooms.get(roomCode);
    return room ? room.size : 0;
  }

  async disconnectPlayer(playerId: string, reason?: string): Promise<void> {
    const playerData = await this.redisService.getPlayerData<Player>(playerId);
    if (playerData?.socketId) {
      const client = this.connectedClients.get(playerData.socketId);
      if (client) {
        if (reason) {
          this.sendError(client, 'DISCONNECTED', reason);
        }
        client.disconnect(true);
      }
    }
  }

  // For testing and development
  async broadcastToAll(event: string, data: any): Promise<void> {
    this.server.emit(event, {
      success: true,
      data,
      timestamp: new Date(),
    });
  }
}
