import { IsString, IsObject, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswersDto {
  @ApiProperty({ description: 'Room code', example: 'ABC123' })
  @IsString()
  @IsNotEmpty()
  roomCode: string;

  @ApiProperty({ description: 'Player ID', example: 'player_123' })
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @ApiProperty({ 
    description: 'Player answers mapped by category',
    example: { 'Animals': 'Antelope', 'Cities': 'Amsterdam', 'Foods': 'Apple' }
  })
  @IsObject()
  answers: Record<string, string>;
}
