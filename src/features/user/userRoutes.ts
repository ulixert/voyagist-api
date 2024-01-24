import express, { Router } from 'express';

import {
  forgotPassword,
  login,
  resetPassword,
  signup,
  updatePassword,
} from '../auth/authController.js';
import { protectRoute } from '../auth/authMiddleware.js';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateMe,
  updateUser,
} from './userController.js';

export const userRouter: Router = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);

userRouter.post('/forgot-password', forgotPassword);
userRouter.patch('/reset-password/:token', resetPassword);
userRouter.patch('/update-password', protectRoute, updatePassword);

userRouter.patch('/update-me', protectRoute, updateMe);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
