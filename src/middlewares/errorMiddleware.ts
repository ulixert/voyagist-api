import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { HttpError } from '@/types/errors.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware: ErrorRequestHandler = (err, _, res, __) => {
  if (err instanceof ZodError) {
    console.error('💎Zod Validation Error: ', err);
    res.status(400).json({
      status: 'fail',
      message: `💎Zod Validation Error: ${err.message}`,
      error: err.errors,
    });
    return;
  }

  const error = err as HttpError;
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const message = error.message || 'Internal Server Error';

  console.error('💥', error.stack);
  res.status(statusCode).json({
    status,
    message: `💥Error: ${message}`,
  });
};
