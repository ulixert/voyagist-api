import express, { Router } from 'express';

import {
  aliasTopTours,
  checkID,
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
} from '@/controllers/tourController.js';

export const tourRouter: Router = express.Router();

tourRouter.param('id', checkID);

// alias
tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// tourRouter.route('/').get(getAllTours).post(checkBody, createTour);
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
