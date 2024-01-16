import type { ErrorRequestHandler, NextFunction } from 'express';
import { ZodError } from 'zod';

import { AppMessage, HttpStatusCode } from '@/constants/constants.js';
import { HttpError } from '@/errors/errors.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';

type AppError = {
  statusCode: HttpStatusCode;
  status: 'fail' | 'error';
  message: string;
  zodErrors?: {
    [p: string]: string[] | undefined;
    [p: number]: string[] | undefined;
    [p: symbol]: string[] | undefined;
  };
};

function processError(err: unknown): AppError {
  if (err instanceof ZodError) {
    return processZodError(err);
  } else if (err instanceof PrismaClientKnownRequestError) {
    return processPrismaError(err);
  } else if (err instanceof HttpError) {
    return {
      statusCode: err.statusCode,
      status: err.status,
      message: `🌐 ${err.message}`,
    };
  } else if (err instanceof Error) {
    return {
      statusCode: HttpStatusCode.SERVER_ERROR,
      status: 'error',
      message: `💥 ${err.message}`,
    };
  }

  return {
    statusCode: HttpStatusCode.SERVER_ERROR,
    status: 'error',
    message: AppMessage.SERVER_ERROR,
  };
}

function processZodError(err: ZodError): AppError {
  const flattenedErrors = err.flatten().fieldErrors;
  const firstFieldErrorKey = Object.keys(flattenedErrors)[0];

  const firstErrorMessage =
    flattenedErrors[firstFieldErrorKey]?.[0] ?? err.message;

  return {
    statusCode: HttpStatusCode.BAD_REQUEST,
    status: 'fail',
    message: `💎 ${firstFieldErrorKey}: ${firstErrorMessage}`,
    zodErrors: flattenedErrors,
  };
}

function processPrismaError(err: PrismaClientKnownRequestError): AppError {
  const message = err.message.split('\n').at(-1);

  // A unique constraint was violated on the model
  if (err.code === 'P2002') {
    // const field = (err.meta?.target as string[]).join(', ');
    return {
      statusCode: HttpStatusCode.CONFLICT,
      status: 'fail',
      // message: `⚠️ The value of field ('${field}') is already taken. Please choose another oe.`,
      message: `⚠️ ${message}`,
    };
  }

  // An operation failed because it depends on one or more records that were required but not found
  if (err.code === 'P2025') {
    return {
      statusCode: HttpStatusCode.NOT_FOUND,
      status: 'fail',
      // message: `⚠️ ${err.meta?.cause as string}`,
      message: `⚠️ ${message}`,
    };
  }

  return {
    statusCode: HttpStatusCode.BAD_REQUEST,
    status: 'fail',
    message: `⚠️ ${AppMessage.DATABASE_ERROR}: ${err.code}`,
  };
}

export const errorMiddleware: ErrorRequestHandler = (
  err,
  _,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __: NextFunction,
) => {
  const { statusCode, status, message, zodErrors } = processError(err);
  console.error('💥', zodErrors ?? err);
  const result: Record<string, unknown> = { status, message };

  if (process.env.NODE_ENV === 'development' && zodErrors) {
    result.zodErrors = zodErrors;
  }
  res.status(statusCode).json(result);
};
