import express, { type Express, type NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { NotFoundError } from '@/errors/errors.js';
import { errorMiddleware } from '@/middlewares/errorMiddleware.js';

import { tourRouter } from './features/tour/tourRoutes.js';
import { userRouter } from './features/user/userRoutes.js';

export const app: Express = express();

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const limiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again in an 15 minutes!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error handling
app.all('*', (req, _, next: NextFunction) => {
  const err = new NotFoundError(`Can't find ${req.originalUrl} on this server`);
  next(err);
});

app.use(errorMiddleware);
