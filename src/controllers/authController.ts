import * as crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode, UserMessage } from '@/constants/constants.js';
import { prisma } from '@/db/index.js';
import { UserCreateInputSchema, UserPartial } from '@/db/zod/index.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '@/errors/errors.js';
import { checkPassword } from '@/utils/checkPassword.js';
import { sendPasswordResetEmail } from '@/utils/email.js';
import { generateToken } from '@/utils/generateToken.js';
import {
  UserEmailSchema,
  UserLoginSchema,
  UserPasswordSchema,
  UserUpdatePasswordSchema,
} from '@/validates/schemas.js';
import argon2 from '@node-rs/argon2';

function generateSendTokenResponse(
  user: UserPartial,
  statusCode: HttpStatusCode,
  res: Response,
) {
  const token = generateToken(user.id!);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

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
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    generateSendTokenResponse(user, HttpStatusCode.CREATED, res);
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

    generateSendTokenResponse(user, HttpStatusCode.OK, res);
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

    generateSendTokenResponse(user, HttpStatusCode.OK, res);
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
    const { id } = req.user!;
    const { currentPassword, newPassword } = UserUpdatePasswordSchema.parse(
      req.body,
    );

    const user = await prisma.user.findUnique({ where: { id } });
    const isPasswordMatch = await checkPassword(
      user?.password,
      currentPassword,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedError(UserMessage.INVALID_PASSWORD);
    }

    const hashedPassword = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    generateSendTokenResponse(user!, HttpStatusCode.OK, res);
  } catch (e) {
    next(e);
  }
}
