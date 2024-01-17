import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { UserMessage } from '@/constants/constants.js';
import { prisma } from '@/db/index.js';
import { UnauthorizedError } from '@/errors/errors.js';

type JwtPayload = {
  id: number;
  iat: number;
  exp: number;
};

export async function jwtVerify(
  token: string,
  secret: string,
): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if ((err ?? !decoded) || typeof decoded !== 'object') {
        return reject(err);
      }
      resolve(decoded as JwtPayload);
    });
  });
}

function hasPasswordChanged(
  passwordUpdatedAt: Date | null,
  jwtIssuedAt: number,
) {
  if (!passwordUpdatedAt) {
    return false;
  }
  const passwordUpdatedAtTimestamp = passwordUpdatedAt.getTime();
  console.log(jwtIssuedAt * 1000, passwordUpdatedAtTimestamp);
  return jwtIssuedAt * 1000 < passwordUpdatedAtTimestamp;
}

export async function authMiddleware(
  req: Request,
  _: Response,
  next: NextFunction,
) {
  try {
    // 1) Getting token and check if it's there
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError(UserMessage.UNAUTHORIZED_ACCESS_ERROR);
    }

    // 2) Verification token
    const { id, iat } = await jwtVerify(token, process.env.JWT_SECRET!);

    // 3) Check if user still exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedError(
        'The user belonging to this token does no longer exist.',
      );
    }

    // 4) Check if user changed password after the token was issued
    if (hasPasswordChanged(user.passwordChangedAt, iat)) {
      throw new UnauthorizedError(
        'User recently changed password! Please log in again.',
      );
    }

    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}
