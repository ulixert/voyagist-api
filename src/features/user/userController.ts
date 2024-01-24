import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '@/constants/constants.js';
import { prisma } from '@/db/index.js';
import { UserCreateInputSchema, UserPartialSchema } from '@/db/zod/index.js';

export async function getAllUsers(
  _: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
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
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function getUser(req: Request, res: Response) {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  res.status(HttpStatusCode.OK).json({
    status: 'success',
    data: { user },
  });
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.user!;
    const userData = UserPartialSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id },
      data: userData,
    });

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (e) {
    next(e);
  }
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
