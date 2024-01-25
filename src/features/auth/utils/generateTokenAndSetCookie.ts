import { Response } from 'express';
import jwt from 'jsonwebtoken';
import * as process from 'process';

export function generateTokenAndSetCookie(res: Response, id: number) {
  const ONE_DAY_AS_MILLISECONDS = 24 * 60 * 60 * 1000;
  const jwtCookieExpiresIn =
    (Number(process.env.JWT_COOKIE_EXPIRES_IN) ?? 30) * ONE_DAY_AS_MILLISECONDS;

  const token = jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + jwtCookieExpiresIn),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return token;
}
