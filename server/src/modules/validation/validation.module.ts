import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ValidationService } from './validation.service';
import { ValidationController } from './validation.controller';
import { DictionaryValidationStrategy } from './strategies/dictionary-validation.strategy';
import { ApiValidationStrategy } from './strategies/api-validation.strategy';
import { AiValidationStrategy } from './strategies/ai-validation.strategy';
import { VotingValidationStrategy } from './strategies/voting-validation.strategy';

@Module({
  imports: [HttpModule],
  providers: [
    ValidationService,
    DictionaryValidationStrategy,
    ApiValidationStrategy,
    AiValidationStrategy,
    VotingValidationStrategy,
  ],
  controllers: [ValidationController],
  exports: [ValidationService],
})
export class ValidationModule {}
