import express, { Express } from 'express';

import { tourRouter } from '@/routes/tourRoutes.js';
import { userRouter } from '@/routes/userRoutes.js';
import { dataPath } from '@/utils/path.js';

export const app: Express = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(`${dataPath}/..`));

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
