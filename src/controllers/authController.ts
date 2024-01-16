import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode, UserMessage } from '@/constants/constants.js';
import { prisma } from '@/db/index.js';
import { UserCreateInputSchema } from '@/db/zod/index.js';
import { BadRequestError, UnauthorizedError } from '@/errors/errors.js';
import { generateToken } from '@/utils/generateToken.js';
import { UserLoginSchema } from '@/validates/schemas.js';
import argon2 from '@node-rs/argon2';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = UserCreateInputSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestError(UserMessage.EMAIL_ALREADY_EXISTS);
    }

    // Create user with hashed password
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await argon2.hash(password),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const token = generateToken(user.id);

    res.status(HttpStatusCode.CREATED).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = UserLoginSchema.parse(req.body);

    // Check if user exists
    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    // Check if password is correct
    const isPasswordMatches = await argon2.verify(user.password, password);
    if (!isPasswordMatches) {
      throw new UnauthorizedError(UserMessage.INCORRECT_PASSWORD);
    }
    const token = generateToken(user.id);

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      token,
    });
  } catch (e) {
    next(e);
  }
}
