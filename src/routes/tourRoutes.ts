import express, { Router } from 'express';

import {
  checkBody,
  checkID,
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
} from '@/controllers/tourController.js';

export const tourRouter: Router = express.Router();

tourRouter.param('id', checkID);

tourRouter.route('/').get(getAllTours).post(checkBody, createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
