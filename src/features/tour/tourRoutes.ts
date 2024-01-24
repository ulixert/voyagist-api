import express, { Router } from 'express';

import { checkID } from '@/middlewares/checkID.js';

import { protectRoute, restrictTo } from '../auth/authMiddleware.js';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from './tourController.js';

export const tourRouter: Router = express.Router();

tourRouter.param('id', checkID);

// alias
tourRouter.get('/top-5-cheap', aliasTopTours, getAllTours);
tourRouter.get('/stats', getTourStats);
tourRouter.get('/monthly-plan/:year', getMonthlyPlan);

tourRouter.route('/').get(protectRoute, getAllTours).post(createTour);
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protectRoute, restrictTo('ADMIN'), deleteTour);
