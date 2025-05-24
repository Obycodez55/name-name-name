import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GameConfig, ValidationMode } from '@name-name-name/shared';
import { Type } from 'class-transformer';
import { GameConfigDto } from '@/modules/room/dto/create-room.dto';

export class ValidateAnswerDto {
  @ApiProperty({ description: 'Answer to validate', example: 'Antelope' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ description: 'Category for the answer', example: 'Animals' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Required starting letter', example: 'A' })
  @IsString()
  @IsNotEmpty()
  letter: string;

  @ApiProperty({ 
    description: 'Validation mode to use',
    enum: ValidationMode,
    example: ValidationMode.DICTIONARY 
  })
  @IsEnum(ValidationMode)
  validationMode: ValidationMode;

  @ApiProperty({ 
    description: 'Additional configuration for validation',
    required: false,
    example: { strictMode: true, allowProperNouns: false }
  })
  @IsOptional()
  @IsObject()
  @Type(()=> GameConfigDto)
  config?: GameConfig;
}