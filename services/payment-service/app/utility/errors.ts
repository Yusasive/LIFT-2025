import { ValidationError } from "class-validator";

export class AppValidationError extends Error {
    constructor(public validationErrors: ValidationError[]) {
        super('Validation failed');
        this.name = 'AppValidationError';
    }
}