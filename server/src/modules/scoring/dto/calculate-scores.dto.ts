import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlayerAnswers, ValidationResults, GameConfig } from '@name-name-name/shared';

export class CalculateScoresDto {
  @ApiProperty({ description: 'Player answers for the round' })
  @IsObject()
  playerAnswers: Record<string, PlayerAnswers>;

  @ApiProperty({ description: 'Validation results for all answers' })
  @IsObject()
  validationResults: ValidationResults;

  @ApiProperty({ description: 'Game configuration' })
  @IsObject()
  gameConfig: GameConfig;

  @ApiProperty({ description: 'Round number', required: false })
  @IsOptional()
  @IsString()
  roundNumber?: number;
}