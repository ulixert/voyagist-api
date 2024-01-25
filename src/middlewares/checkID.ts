import type { NextFunction, Request, Response } from 'express';

import { ApplicationMessage, HttpStatusCode } from '@/constants/constants.js';
import { HttpError } from '@/errors/errors.js';

export function checkID(req: Request, _: Response, next: NextFunction) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 0) {
    next(
      new HttpError(
        ApplicationMessage.ID_FORMAT_ERROR,
        HttpStatusCode.BAD_REQUEST,
      ),
    );
  }

  next();
}
