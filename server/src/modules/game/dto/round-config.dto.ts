import { IsNumber, IsArray, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartGameDto {
  @ApiProperty({ description: 'Room code', example: 'ABC123' })
  @IsString()
  roomCode: string;

  @ApiProperty({ description: 'Player ID (must be room creator)', example: 'player_123' })
  @IsString()
  playerId: string;
}

export class StartRoundDto {
  @ApiProperty({ description: 'Room code', example: 'ABC123' })
  @IsString()
  roomCode: string;

  @ApiProperty({ description: 'Player ID (must be round master)', example: 'player_123' })
  @IsString()
  playerId: string;

  @ApiProperty({ description: 'Override time limit for this round', required: false })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(600)
  timeLimit?: number;
}
