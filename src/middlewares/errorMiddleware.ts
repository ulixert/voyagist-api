import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware: ErrorRequestHandler = (err, _, res, __) => {
  if (err instanceof ZodError) {
    console.error('💎Zod Validation Error: ', err.errors);
    res.status(400).json({
      status: 'fail',
      message: `💎Zod Validation Error: ${err.message}`,
      error: err.errors,
    });
    return;
  }

  if (err instanceof Error) {
    console.error('💥', err.message);
    res.status(400).json({
      status: 'fail',
      message: `💥Error: ${err.message}`,
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: '💥Internal Server Error',
  });
};
