import { HttpStatusCode } from '@/constants/constants.js';

export class HttpError extends Error {
  statusCode: number;
  status: 'fail' | 'error';
  isOperational: boolean;

  constructor(message: string, statusCode: HttpStatusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatusCode.NOT_FOUND);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatusCode.BAD_REQUEST);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatusCode.UNAUTHORIZED);
  }
}
