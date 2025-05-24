import { ApiProperty } from '@nestjs/swagger';
import { ValidationMode } from '@name-name-name/shared';

export class ValidationResultDto {
  @ApiProperty({ description: 'Unique request ID' })
  requestId: string;

  @ApiProperty({ description: 'Original answer' })
  answer: string;

  @ApiProperty({ description: 'Category' })
  category: string;

  @ApiProperty({ description: 'Whether the answer is valid' })
  isValid: boolean;

  @ApiProperty({ description: 'Confidence score (0-1)' })
  confidence: number;

  @ApiProperty({ description: 'Validation method used', enum: ValidationMode })
  method: ValidationMode;

  @ApiProperty({ description: 'Reason for validation result', required: false })
  reason?: string;

  @ApiProperty({ description: 'Alternative suggestions', required: false })
  suggestions?: string[];

  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTime: number;

  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;
}