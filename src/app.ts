import express, { Express, NextFunction } from 'express';

import { tourRouter } from '@/routes/tourRoutes.js';
import { userRouter } from '@/routes/userRoutes.js';
import { HttpError } from '@/types/errors.js';
import { dataPath } from '@/utils/path.js';

import { errorMiddleware } from './middlewares/errorMiddleware.js';

export const app: Express = express();

// app.set('query parser', queryParser);

app.use(express.json());
app.use(express.static(`${dataPath}/..`));

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error handling
app.all('*', (req, _, next: NextFunction) => {
  const err = new HttpError(
    `Can't find ${req.originalUrl} on this server`,
    404,
  );
  next(err);
});

app.use(errorMiddleware);
