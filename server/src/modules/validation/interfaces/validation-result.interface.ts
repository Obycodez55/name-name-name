import { ValidationRequest } from "@name-name-name/shared";

export interface ValidationContext {
  request: ValidationRequest;
  startTime: number;
  metadata: Record<string, any>;
}

export interface ValidationError {
  code: string;
  message: string;
  details?: any;
}
