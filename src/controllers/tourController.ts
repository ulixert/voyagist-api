import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';

import { db } from '@/db/index.js';
import { tour } from '@/db/schema.js';
import { insertTourSchema } from '@/types/schemas.js';

export function checkID(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 0) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid ID format',
    });
    return;
  }

  next();
}

export async function getAllTours(_: Request, res: Response) {
  try {
    // const tours = await db.query.tour.findMany();
    const tours = await db.select().from(tour);
    console.log(tours);

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log('💥', e.message);
      res.status(404).json({
        status: 'fail',
        message: e.message,
      });
    }
  }
}

export async function createTour(req: Request, res: Response) {
  try {
    const newTour = insertTourSchema.parse(req.body);
    await db.insert(tour).values(newTour);
    console.log('zod');

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log('💥', e.message);
      res.status(400).json({
        status: 'fail',
        message: e.message,
      });
    }
  }
}

export async function getTour(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const currentTour = await db.query.tour.findFirst({
      where: eq(tour.id, id),
    });

    if (!currentTour) {
      throw new Error('Invalid ID');
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour: currentTour.createdAt,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log('💥', e.message);
      res.status(404).json({
        status: 'fail',
        message: e.message,
      });
    }
  }
}

export async function updateTour(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const updatedTour = insertTourSchema.partial().parse(req.body);
    console.log(updatedTour);
    const updateResult = await db
      .update(tour)
      .set(updatedTour)
      .where(eq(tour.id, id))
      .returning();

    if (updateResult.length === 0) {
      throw new Error('Tour not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log('💥', e.message);
      res.status(404).json({
        status: 'fail',
        message: e.message,
      });
    }
  }
}

export async function deleteTour(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await db.delete(tour).where(eq(tour.id, id)).returning();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log('💥', e.message);
      res.status(404).json({
        status: 'fail',
        message: e.message,
      });
    }
  }
}
