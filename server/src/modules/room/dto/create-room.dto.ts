import { IsString, IsOptional, IsObject, IsArray, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { GameConfig, ValidationMode, LetterSelectionMode } from '@name-name-name/shared';

export class CreateRoomDto {
  @ApiProperty({ description: 'Creator player name', example: 'Alice' })
  @IsString()
  creatorName: string;

  @ApiProperty({ description: 'Optional room name', example: 'Friday Night Game', required: false })
  @IsOptional()
  @IsString()
  roomName?: string;

  @ApiProperty({ description: 'Game configuration' })
  @IsObject()
  config: Partial<GameConfig>;
}

export class GameConfigDto {
  @ApiProperty({ description: 'Maximum number of players', example: 6, minimum: 2, maximum: 8 })
  @IsNumber()
  @Min(2)
  @Max(8)
  maxPlayers: number;

  @ApiProperty({ description: 'Round time limit in seconds', example: 180, minimum: 30, maximum: 600 })
  @IsNumber()
  @Min(30)
  @Max(600)
  roundTimeLimit: number;

  @ApiProperty({ description: 'Validation mode', enum: ValidationMode, example: ValidationMode.DICTIONARY })
  @IsString()
  validationMode: ValidationMode;

  @ApiProperty({ description: 'Letter selection mode', enum: LetterSelectionMode, example: LetterSelectionMode.RANDOM })
  @IsString()
  letterSelectionMode: LetterSelectionMode;

  @ApiProperty({ description: 'Game categories', example: ['Animals', 'Cities', 'Foods'] })
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({ description: 'Maximum number of rounds', required: false, example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxRounds?: number;

  @ApiProperty({ description: 'Enable chat', example: true })
  @IsBoolean()
  enableChat: boolean;

  @ApiProperty({ description: 'Allow spectators', example: false })
  @IsBoolean()
  allowSpectators: boolean;
}
