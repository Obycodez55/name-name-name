import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GameConfig } from '@name-name-name/shared';

export class UpdateRoomConfigDto {
  @ApiProperty({ description: 'Updated game configuration' })
  @IsObject()
  config: Partial<GameConfig>;
}