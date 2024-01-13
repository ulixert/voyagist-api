import express, { Router } from 'express';

import {
  aliasTopTours,
  checkID,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from '@/controllers/tourController.js';

export const tourRouter: Router = express.Router();

tourRouter.param('id', checkID);

// alias
tourRouter.get('/top-5-cheap', aliasTopTours, getAllTours);
tourRouter.get('/stats', getTourStats);
tourRouter.get('/monthly-plan/:year', getMonthlyPlan);

// tourRouter.route('/').get(getAllTours).post(checkBody, createTour);
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
