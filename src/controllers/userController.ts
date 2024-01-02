import { Request, Response } from 'express';
import { readFileSync } from 'fs';

import { User } from '@/types/type.js';
import { dataPath } from '@/utils/path.js';

const users = JSON.parse(
  readFileSync(`${dataPath}/users.json`, 'utf-8'),
) as User[];

export function getAllUsers(_: Request, res: Response) {
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
}

export function createUser(_: Request, res: Response) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
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
