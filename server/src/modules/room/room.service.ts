import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { RedisService } from '@modules/persistence/redis/redis.service';
import { MongodbService } from '@modules/persistence/mongodb/mongodb.service';
import { 
  Room, 
  Player, 
  GameConfig, 
  PlayerRole, 
  PlayerStatus,
  GAME_CONSTANTS,
  generateRoomCode,
  LetterSelectionMode,
  ValidationMode,
} from '@name-name-name/shared';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateRoomResult, JoinRoomResult, RoomListItem } from './interfaces/room.interface';
import { JoinRoomDto } from './dto/join-room.dto';
import { UpdateRoomConfigDto } from './dto/room-config.dto';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly mongodbService: MongodbService,
  ) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<CreateRoomResult> {
    try {
      const { creatorName, roomName, config } = createRoomDto;

      // Generate unique room code
      let roomCode: string;
      let attempts = 0;
      do {
        roomCode = generateRoomCode();
        attempts++;
        if (attempts > 10) {
          throw new ConflictException('Unable to generate unique room code');
        }
      } while (await this.roomExists(roomCode));

      // Validate and set default configuration
      const gameConfig: GameConfig = {
        maxPlayers: config.maxPlayers || GAME_CONSTANTS.DEFAULT_MAX_PLAYERS,
        roundTimeLimit: config.roundTimeLimit || GAME_CONSTANTS.DEFAULT_ROUND_TIME,
        validationMode: config.validationMode || 'dictionary' as ValidationMode,
        letterSelectionMode: config.letterSelectionMode || 'random' as LetterSelectionMode,
        categories: config.categories || [...GAME_CONSTANTS.DEFAULT_CATEGORIES],
        maxRounds: config.maxRounds || 5,
        enableChat: config.enableChat !== false, // default truex`
        allowSpectators: config.allowSpectators || false,
      };

      // Create creator player
      const creatorId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const creator: Player = {
        id: creatorId,
        name: creatorName,
        role: PlayerRole.CREATOR,
        status: PlayerStatus.ONLINE,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        isReady: false,
      };

      // Create room
      const room: Room = {
        code: roomCode,
        name: roomName,
        creatorId,
        players: { [creatorId]: creator },
        config: gameConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        currentPlayerCount: 1,
        spectatorCount: 0,
      };

      // Store in Redis for active game state
      await this.redisService.setRoomData(roomCode, room, 86400); // 24 hours TTL
      await this.redisService.addPlayerToRoom(roomCode, creatorId);
      await this.redisService.setPlayerData(creatorId, creator, 86400);

      // Store configuration in MongoDB for persistence
      await this.mongodbService.saveRoomConfig(roomCode, gameConfig);

      this.logger.log(`Room created: ${roomCode} by ${creatorName}`);

      return { room, player: creator };

    } catch (error) {
      this.logger.error('Failed to create room:', error);
      throw error;
    }
  }

  async joinRoom(roomCode: string, joinRoomDto: JoinRoomDto): Promise<JoinRoomResult> {
    try {
      const { playerName, avatar } = joinRoomDto;

      // Check if room exists
      const room = await this.getRoomData(roomCode);
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      // Check if room is full
      if (room.currentPlayerCount >= room.config.maxPlayers) {
        throw new ConflictException('Room is full');
      }

      // Check if name is already taken
      const existingPlayers = Object.values(room.players);
      if (existingPlayers.some(player => player.name.toLowerCase() === playerName.toLowerCase())) {
        throw new ConflictException('Player name is already taken');
      }

      // Create new player
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const player: Player = {
        id: playerId,
        name: playerName,
        role: PlayerRole.PLAYER,
        status: PlayerStatus.ONLINE,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        isReady: false,
        avatar,
      };

      // Add player to room
      room.players[playerId] = player;
      room.currentPlayerCount++;
      room.updatedAt = new Date();

      // Update Redis
      await this.redisService.setRoomData(roomCode, room);
      await this.redisService.addPlayerToRoom(roomCode, playerId);
      await this.redisService.setPlayerData(playerId, player, 86400);

      this.logger.log(`Player ${playerName} joined room ${roomCode}`);

      // Get game state if game is active
      const gameState = await this.redisService.getGameState(roomCode);

      return { room, player, gameState };

    } catch (error) {
      this.logger.error(`Failed to join room ${roomCode}:`, error);
      throw error;
    }
  }

  async leaveRoom(roomCode: string, playerId: string): Promise<void> {
    try {
      const room = await this.getRoomData(roomCode);
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      const player = room.players[playerId];
      if (!player) {
        throw new NotFoundException('Player not found in room');
      }

      // Remove player from room
      delete room.players[playerId];
      room.currentPlayerCount--;
      room.updatedAt = new Date();

      // If creator left, assign new creator
      if (playerId === room.creatorId) {
        const remainingPlayers = Object.values(room.players);
        if (remainingPlayers.length > 0) {
          const newCreator = remainingPlayers[0];
          newCreator.role = PlayerRole.CREATOR;
          room.creatorId = newCreator.id;
          await this.redisService.setPlayerData(newCreator.id, newCreator);
        }
      }

      // Update or clean up room
      if (room.currentPlayerCount === 0) {
        await this.deleteRoom(roomCode);
      } else {
        await this.redisService.setRoomData(roomCode, room);
      }

      // Clean up player data
      await this.redisService.removePlayerFromRoom(roomCode, playerId);
      await this.redisService.delete(`player:${playerId}`);

      this.logger.log(`Player ${player.name} left room ${roomCode}`);

    } catch (error) {
      this.logger.error(`Failed to leave room ${roomCode}:`, error);
      throw error;
    }
  }

  async getRoomData(roomCode: string): Promise<Room | null> {
    return await this.redisService.getRoomData<Room>(roomCode);
  }

  async updateRoomConfig(roomCode: string, updateDto: UpdateRoomConfigDto, requestingPlayerId: string): Promise<Room> {
    try {
      const room = await this.getRoomData(roomCode);
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      // Check if player is creator
      if (room.creatorId !== requestingPlayerId) {
        throw new BadRequestException('Only room creator can update configuration');
      }

      // Validate new configuration
      const newConfig = { ...room.config, ...updateDto.config };
      
      // Basic validations
      if (newConfig.maxPlayers < room.currentPlayerCount) {
        throw new BadRequestException('Cannot set max players below current player count');
      }

      if (newConfig.maxPlayers < GAME_CONSTANTS.MIN_PLAYERS || newConfig.maxPlayers > GAME_CONSTANTS.MAX_PLAYERS) {
        throw new BadRequestException(`Max players must be between ${GAME_CONSTANTS.MIN_PLAYERS} and ${GAME_CONSTANTS.MAX_PLAYERS}`);
      }

      if (newConfig.roundTimeLimit < GAME_CONSTANTS.MIN_ROUND_TIME || newConfig.roundTimeLimit > GAME_CONSTANTS.MAX_ROUND_TIME) {
        throw new BadRequestException(`Round time must be between ${GAME_CONSTANTS.MIN_ROUND_TIME} and ${GAME_CONSTANTS.MAX_ROUND_TIME} seconds`);
      }

      // Update room configuration
      room.config = newConfig;
      room.updatedAt = new Date();

      // Save to both Redis and MongoDB
      await this.redisService.setRoomData(roomCode, room);
      await this.mongodbService.saveRoomConfig(roomCode, newConfig);

      this.logger.log(`Room ${roomCode} configuration updated`);

      return room;

    } catch (error) {
      this.logger.error(`Failed to update room config ${roomCode}:`, error);
      throw error;
    }
  }

  async updatePlayerStatus(roomCode: string, playerId: string, status: Partial<Player>): Promise<Player> {
    try {
      const room = await this.getRoomData(roomCode);
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      const player = room.players[playerId];
      if (!player) {
        throw new NotFoundException('Player not found in room');
      }

      // Update player status
      Object.assign(player, status, { lastActiveAt: new Date() });

      // Update in both room and player data
      room.players[playerId] = player;
      room.updatedAt = new Date();

      await this.redisService.setRoomData(roomCode, room);
      await this.redisService.setPlayerData(playerId, player);

      return player;

    } catch (error) {
      this.logger.error(`Failed to update player status ${playerId} in room ${roomCode}:`, error);
      throw error;
    }
  }

  async getActiveRooms(page: number = 1, limit: number = 10): Promise<{ rooms: RoomListItem[]; total: number }> {
    try {
      const roomKeys = await this.redisService.keys('room:*');
      const roomCodes = roomKeys
        .filter(key => key.includes(':') && key.split(':').length === 2)
        .map(key => key.split(':')[1]);

      const rooms: RoomListItem[] = [];

      for (const roomCode of roomCodes) {
        const room = await this.getRoomData(roomCode);
        if (room && room.isActive) {
          const gameState = await this.redisService.getGameState(roomCode);
          
          rooms.push({
            code: room.code,
            name: room.name,
            playerCount: room.currentPlayerCount,
            maxPlayers: room.config.maxPlayers,
            isGameActive: !!gameState,
            canJoin: room.currentPlayerCount < room.config.maxPlayers && !gameState,
            categories: room.config.categories,
            createdAt: room.createdAt,
          });
        }
      }

      // Sort by creation date (newest first)
      rooms.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Paginate
      const start = (page - 1) * limit;
      const paginatedRooms = rooms.slice(start, start + limit);

      return {
        rooms: paginatedRooms,
        total: rooms.length,
      };

    } catch (error) {
      this.logger.error('Failed to get active rooms:', error);
      throw error;
    }
  }

  async roomExists(roomCode: string): Promise<boolean> {
    return await this.redisService.exists(`room:${roomCode}`);
  }

  async deleteRoom(roomCode: string): Promise<void> {
    try {
      // Clean up all room-related data
      await this.redisService.deleteRoomData(roomCode);
      
      this.logger.log(`Room ${roomCode} deleted`);

    } catch (error) {
      this.logger.error(`Failed to delete room ${roomCode}:`, error);
      throw error;
    }
  }

  async kickPlayer(roomCode: string, playerId: string, requestingPlayerId: string): Promise<void> {
    try {
      const room = await this.getRoomData(roomCode);
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      // Check if requesting player is creator
      if (room.creatorId !== requestingPlayerId) {
        throw new BadRequestException('Only room creator can kick players');
      }

      // Cannot kick creator
      if (playerId === room.creatorId) {
        throw new BadRequestException('Cannot kick room creator');
      }

      const player = room.players[playerId];
      if (!player) {
        throw new NotFoundException('Player not found in room');
      }

      await this.leaveRoom(roomCode, playerId);

      this.logger.log(`Player ${player.name} was kicked from room ${roomCode}`);

    } catch (error) {
      this.logger.error(`Failed to kick player ${playerId} from room ${roomCode}:`, error);
      throw error;
    }
  }

  // Utility methods
  async getRoomPlayers(roomCode: string): Promise<Player[]> {
    const room = await this.getRoomData(roomCode);
    return room ? Object.values(room.players) : [];
  }

  async getPlayerData(playerId: string): Promise<Player | null> {
    return await this.redisService.getPlayerData<Player>(playerId);
  }

  async isPlayerInRoom(roomCode: string, playerId: string): Promise<boolean> {
    const room = await this.getRoomData(roomCode);
    return room ? playerId in room.players : false;
  }

  async setPlayerReady(roomCode: string, playerId: string, isReady: boolean): Promise<Player> {
    return await this.updatePlayerStatus(roomCode, playerId, { isReady });
  }

  async areAllPlayersReady(roomCode: string): Promise<boolean> {
    const players = await this.getRoomPlayers(roomCode);
    return players.length >= GAME_CONSTANTS.MIN_PLAYERS && players.every(player => player.isReady);
  }

  // Cleanup methods
  async cleanupInactivePlayers(): Promise<void> {
    try {
      const roomKeys = await this.redisService.keys('room:*');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      for (const roomKey of roomKeys) {
        const roomCode = roomKey.split(':')[1];
        if (!roomCode) continue;

        const room = await this.getRoomData(roomCode);
        if (!room) continue;

        let roomChanged = false;
        const playersToRemove: string[] = [];

        for (const [playerId, player] of Object.entries(room.players)) {
          if (player.lastActiveAt < fiveMinutesAgo && player.status === PlayerStatus.OFFLINE) {
            playersToRemove.push(playerId);
            roomChanged = true;
          }
        }

        // Remove inactive players
        for (const playerId of playersToRemove) {
          await this.leaveRoom(roomCode, playerId);
        }
      }

    } catch (error) {
      this.logger.error('Failed to cleanup inactive players:', error);
    }
  }
}