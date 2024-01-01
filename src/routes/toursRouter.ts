import express from 'express';

import { createTour, getAllTours } from '@/controllers/toursController.js';

export const toursRouter = express.Router();

toursRouter.route('/').get(getAllTours).post(createTour);
