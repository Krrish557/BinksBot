export class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', status = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}
