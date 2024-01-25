import * as crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode, UserMessage } from '@/constants/constants.js';
import { prisma } from '@/db/index.js';
import { UserCreateInputSchema } from '@/db/zod/index.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '@/errors/errors.js';
import { generateToken } from '@/features/auth/utils/generateToken.js';
import { prepareUserResponse } from '@/features/user/utils/prepareUserResponse.js';
import { sendPasswordResetEmail } from '@/utils/email.js';
import {
  UserEmailSchema,
  UserLoginSchema,
  UserPasswordSchema,
  UserUpdatePasswordSchema,
} from '@/validates/schemas.js';
import argon2 from '@node-rs/argon2';

import { checkPassword } from './utils/checkPassword.js';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = UserCreateInputSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestError(UserMessage.EMAIL_DUPLICATE_ERROR);
    }

    // Create user with hashed password
    const hashedPassword = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);
    res.status(HttpStatusCode.CREATED).json({
      status: 'success',
      token,
      data: {
        user: prepareUserResponse(user),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = UserLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    const isPasswordMatches = await checkPassword(user?.password, password);
    if (!user || !isPasswordMatches) {
      throw new UnauthorizedError(UserMessage.AUTHENTICATION_ERROR);
    }

    const token = generateToken(user.id);
    res.status(HttpStatusCode.OK).json({
      status: 'success',
      token,
      data: {
        user: prepareUserResponse(user),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // 1) Get user based on POSTed email
    const { email } = UserEmailSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundError(UserMessage.EMAIL_NOT_FOUND_ERROR);
    }

    // 2) Generate the random reset token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const TEN_MINUTES = 10 * 60 * 1000;
    const resetPasswordExp = new Date(Date.now() + TEN_MINUTES);

    await prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { email },
        data: { resetPasswordToken, resetPasswordExp },
      });

      await sendPasswordResetEmail(email, user.name, resetPasswordToken);
    });

    setTimeout(() => {
      void prisma.user.update({
        where: { email },
        data: { resetPasswordToken: null, resetPasswordExp: null },
      });
    }, TEN_MINUTES);

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token: resetPasswordToken } = req.params;
    const { password } = UserPasswordSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExp: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestError(UserMessage.INVALID_TOKEN_ERROR);
    }

    const hashedPassword = await argon2.hash(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        resetPasswordToken: null,
        resetPasswordExp: null,
      },
    });

    const token = generateToken(user.id);
    res.status(HttpStatusCode.OK).json({
      status: 'success',
      token,
      message: 'Password reset successfully!',
    });
  } catch (e) {
    next(e);
  }
}

export async function updatePassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = UserUpdatePasswordSchema.parse(
      req.body,
    );

    const isPasswordMatch = await checkPassword(
      user?.password,
      currentPassword,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedError(UserMessage.INVALID_PASSWORD);
    }

    const hashedPassword = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    const token = generateToken(user.id);
    res.status(HttpStatusCode.OK).json({
      status: 'success',
      token,
      message: 'Password updated successfully!',
    });
  } catch (e) {
    next(e);
  }
}
