import { ValidationRequest, ValidationResult } from '@name-name-name/shared';

export interface ValidationStrategy {
  validate(request: ValidationRequest): Promise<ValidationResult>;
  getStrategyName(): string;
  isConfigurationValid(config: any): boolean;
}
