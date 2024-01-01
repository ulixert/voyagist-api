import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';

import { Tour } from '@/types/type.js';
import { dataPath } from '@/utils/path.js';


// Get data from JSON file
const tours = JSON.parse(
  readFileSync(`${dataPath}/tours-simple.json`, 'utf-8'),
) as Tour[];

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

  if (tour === undefined) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
}
