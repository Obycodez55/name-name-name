import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
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
import { RoomService } from './room.service';
import { RoomCodeValidationPipe } from '@common/pipes/room-code-validation.pipe';
import { RoomExistsGuard } from '@common/guards/room-exists.guard';
import { ApiResponse as CustomApiResponse } from '@name-name-name/shared';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { UpdateRoomConfigDto } from './dto/room-config.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  private readonly logger = new Logger(RoomController.name);

  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new game room' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Room created successfully',
    schema: {
      example: {
        success: true,
        data: {
          room: {
            code: 'ABC123',
            name: 'Friday Night Game',
            creatorId: 'player_123',
            players: {},
            config: {},
            createdAt: '2024-01-01T00:00:00.000Z',
            isActive: true,
          },
          player: {
            id: 'player_123',
            name: 'Alice',
            role: 'creator',
            status: 'online',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid room configuration',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Unable to generate unique room code',
  })
  async createRoom(@Body() createRoomDto: CreateRoomDto): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Creating room for ${createRoomDto.creatorName}`);
      
      const result = await this.roomService.createRoom(createRoomDto);
      
      return {
        success: true,
        data: result,
        message: 'Room created successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to create room:', error);
      throw error;
    }
  }

  @Get(':roomCode')
  @UseGuards(RoomExistsGuard)
  @ApiOperation({ summary: 'Get room information' })
  @ApiParam({ name: 'roomCode', description: 'Room code', example: 'ABC123' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Room information retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Room not found',
  })
  async getRoom(
    @Param('roomCode', RoomCodeValidationPipe) roomCode: string,
  ): Promise<CustomApiResponse> {
    try {
      const room = await this.roomService.getRoomData(roomCode);
      const gameState = await this.roomService['redisService'].getGameState(roomCode);
      
      return {
        success: true,
        data: {
          room,
          gameState,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get room ${roomCode}:`, error);
      throw error;
    }
  }

  @Post(':roomCode/join')
  @UseGuards(RoomExistsGuard)
  @ApiOperation({ summary: 'Join a game room' })
  @ApiParam({ name: 'roomCode', description: 'Room code', example: 'ABC123' })
  @ApiBody({ type: JoinRoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully joined room',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Room not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Room is full or name is taken',
  })
  async joinRoom(
    @Param('roomCode', RoomCodeValidationPipe) roomCode: string,
    @Body() joinRoomDto: JoinRoomDto,
  ): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Player ${joinRoomDto.playerName} joining room ${roomCode}`);
      
      const result = await this.roomService.joinRoom(roomCode, joinRoomDto);
      
      return {
        success: true,
        data: result,
        message: 'Successfully joined room',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to join room ${roomCode}:`, error);
      throw error;
    }
  }

  @Patch(':roomCode/config')
  @UseGuards(RoomExistsGuard)
  @ApiOperation({ summary: 'Update room configuration (creator only)' })
  @ApiParam({ name: 'roomCode', description: 'Room code', example: 'ABC123' })
  @ApiBody({ type: UpdateRoomConfigDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Room configuration updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only room creator can update configuration',
  })
  async updateRoomConfig(
    @Param('roomCode', RoomCodeValidationPipe) roomCode: string,
    @Body() updateDto: UpdateRoomConfigDto,
    @Query('playerId') playerId: string,
  ): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Updating config for room ${roomCode}`);
      
      const room = await this.roomService.updateRoomConfig(roomCode, updateDto, playerId);
      
      return {
        success: true,
        data: { room },
        message: 'Room configuration updated successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to update room config ${roomCode}:`, error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get list of active rooms' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active rooms retrieved successfully',
  })
  async getActiveRooms(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<CustomApiResponse> {
    try {
      const result = await this.roomService.getActiveRooms(Number(page), Number(limit));
      
      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get active rooms:', error);
      throw error;
    }
  }

  @Delete(':roomCode/players/:playerId')
  @UseGuards(RoomExistsGuard)
  @ApiOperation({ summary: 'Kick a player from the room (creator only)' })
  @ApiParam({ name: 'roomCode', description: 'Room code', example: 'ABC123' })
  @ApiParam({ name: 'playerId', description: 'Player ID to kick' })
  @ApiQuery({ name: 'requestingPlayerId', description: 'ID of player making the request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Player kicked successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only room creator can kick players',
  })
  async kickPlayer(
    @Param('roomCode', RoomCodeValidationPipe) roomCode: string,
    @Param('playerId') playerId: string,
    @Query('requestingPlayerId') requestingPlayerId: string,
  ): Promise<CustomApiResponse> {
    try {
      this.logger.log(`Kicking player ${playerId} from room ${roomCode}`);
      
      await this.roomService.kickPlayer(roomCode, playerId, requestingPlayerId);
      
      return {
        success: true,
        message: 'Player kicked successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to kick player ${playerId} from room ${roomCode}:`, error);
      throw error;
    }
  }
}
