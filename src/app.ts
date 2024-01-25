import express, { type Express, type NextFunction } from 'express';

import { NotFoundError } from '@/errors/errors.js';
import { errorMiddleware } from '@/middlewares/errorMiddleware.js';

import { tourRouter } from './features/tour/tourRoutes.js';
import { userRouter } from './features/user/userRoutes.js';

export const app: Express = express();

app.use(express.json());

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error handling
app.all('*', (req, _, next: NextFunction) => {
  const err = new NotFoundError(`Can't find ${req.originalUrl} on this server`);
  next(err);
});

app.use(errorMiddleware);
