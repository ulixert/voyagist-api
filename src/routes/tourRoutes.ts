import express, { Router } from 'express';

import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from '@/controllers/tourController.js';
import { protectRoute, restrictTo } from '@/middlewares/authMiddleware.js';
import { checkID } from '@/middlewares/checkID.js';

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
