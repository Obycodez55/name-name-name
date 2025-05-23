import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
  @ApiProperty({ description: 'Player name', example: 'Bob' })
  @IsString()
  playerName: string;

  @ApiProperty({ description: 'Player avatar URL or identifier', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}