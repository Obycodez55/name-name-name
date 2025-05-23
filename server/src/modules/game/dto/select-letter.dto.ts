import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectLetterDto {
  @ApiProperty({ description: 'Room code', example: 'ABC123' })
  @IsString()
  @IsNotEmpty()
  roomCode: string;

  @ApiProperty({ description: 'Player ID (must be round master)', example: 'player_123' })
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @ApiProperty({ description: 'Selected letter (A-Z)', example: 'A' })
  @IsString()
  @Length(1, 1)
  @Matches(/^[A-Z]$/, { message: 'Letter must be a single uppercase letter A-Z' })
  letter: string;
}
