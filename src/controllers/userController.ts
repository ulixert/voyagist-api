import type { NextFunction, Request, Response } from 'express';

import { prisma } from '@/db/index.js';

import { UserCreateInputSchema } from '../../prisma/generated/zod';

export async function getAllUsers(
  _: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({
      status: 'success',
      count: users.length,
      data: {
        users,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = UserCreateInputSchema.parse(req.body);
    await prisma.user.create({
      data: user,
    });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user,
      },
    });
  } catch (e) {
    next(e);
  }
}

export function getUser(_: Request, res: Response) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
}

export function updateUser(_: Request, res: Response) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
}

export function deleteUser(_: Request, res: Response) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
}
