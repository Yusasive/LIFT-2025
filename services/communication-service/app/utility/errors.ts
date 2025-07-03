import { ValidationError } from "class-validator";

export class EmailServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

export class SESError extends EmailServiceError {
  constructor(message: string, public originalError?: any) {
    super(message, 500);
    this.name = 'SESError';
  }
}

export class AttachmentError extends EmailServiceError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'AttachmentError';
  }
} 


export class AppValidationError extends Error {
    constructor(public validationErrors: ValidationError[]) {
        super('Validation failed');
        this.name = 'AppValidationError';
    }
}