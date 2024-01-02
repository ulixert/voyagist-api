import { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';

import { Tour } from '@/types/type.js';
import { dataPath } from '@/utils/path.js';


// Get data from JSON file
const tours = JSON.parse(
  readFileSync(`${dataPath}/tours-simple.json`, 'utf-8'),
) as Tour[];

export function checkID(
  _: Request,
  res: Response,
  next: NextFunction,
  val: string,
) {
  const id = Number.parseInt(val, 10);
  const tourExists = tours.some((tour) => tour.id === id);

  if (!tourExists) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  next();
}

export function checkBody(req: Request, res: Response, next: NextFunction) {
  const isBodyValid =
    Object.prototype.hasOwnProperty.call(req.body, 'name') &&
    Object.prototype.hasOwnProperty.call(req.body, 'price');

  if (!isBodyValid) {
    res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
    return;
  }

  next();
}

export const getAllTours = (_: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

export const createTour = async (req: Request, res: Response) => {
  try {
    const newId = tours.length === 0 ? 1 : tours.at(-1)!.id + 1;
    const newTour = { ...req.body, id: newId } as Tour;

    tours.push(newTour);
    await writeFile(`${dataPath}/tours-simple.json`, JSON.stringify(tours));

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.error('💥 There is an error: ', err);
  }
};

export function getTour(req: Request, res: Response) {
  const id = req.params.id;
  const tour = tours.find((tour) => tour.id === Number(id));

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
}

export async function updateTour(req: Request, res: Response) {
  const id = req.params.id;
  const index = tours.findIndex((tour) => tour.id === Number(id));

  tours[index] = { ...tours[index], ...req.body } as Tour;
  await writeFile(`${dataPath}/tours-simple.json`, JSON.stringify(tours));

  res.status(200).json({
    status: 'success',
    data: {
      tour: tours[index],
    },
  });
}

export function deleteTour(_: Request, res: Response) {
  res.status(204).json({
    status: 'success',
    data: null,
  });
}
