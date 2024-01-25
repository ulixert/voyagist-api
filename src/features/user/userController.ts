import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '@/constants/constants.js';
import { prisma } from '@/db/index.js';
import { UserCreateInputSchema, UserPartialSchema } from '@/db/zod/index.js';
import { BadRequestError } from '@/errors/errors.js';
import { prepareUserResponse } from '@/features/user/utils/prepareUserResponse.js';
import { filterByAllowedFields } from '@/utils/filterByAllowedFields.js';

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

export async function updateCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.user!;
    const updatedUserData = UserPartialSchema.parse(req.body);

    // Prevent user from updating password
    if (updatedUserData.password) {
      throw new BadRequestError(
        'This route is not for password updates. Please use /updateMyPassword.',
      );
    }
    const filteredUserData = filterByAllowedFields(
      updatedUserData,
      'name',
      'email',
    );
    const updatedUser = await prisma.user.update({
      where: { id },
      data: filteredUserData,
    });

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      data: {
        user: prepareUserResponse(updatedUser),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function deleteCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.user!;

    await prisma.user.update({
      where: { id },
      data: { deleted: true },
    });

    res.status(HttpStatusCode.NO_CONTENT).send();
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
