import { NextFunction, Request, Response } from 'express';
import { sql } from 'kysely';

import { db, prisma } from '@/db/index.js';
import { HttpError } from '@/types/errors.js';
import {
  QueryOptions,
  buildPrismaUrlQueryOptions,
} from '@/utils/buildPrismaUrlQueryOptions.js';

import {
  TourCreateInputSchema,
  TourUpdateInputSchema,
  User,
} from '../../prisma/generated/zod/index.js';
import { TourUrlQuerySchema } from '../validates/schemas.js';

export function checkID(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 0) {
    res.status(400).json({
      status: 'fail',
      message: '💥Invalid ID format',
    });
    return;
  }

  next();
}

export function aliasTopTours(req: Request, _: Response, next: NextFunction) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}

async function findTours(user: User, queryOptions: QueryOptions) {
  if (user.role === 'PREMIUM_USER' || user.role === 'ADMIN') {
    return prisma.tour.findMany(queryOptions);
  } else {
    return prisma.tour.findMany({
      ...queryOptions,
      where: {
        ...queryOptions.where,
        isPremium: false,
      },
    });
  }
}

export async function getAllTours(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: 100 },
    });

    if (!user) {
      throw new HttpError('User not found', 404);
    }

    const queryParams = TourUrlQuerySchema.parse(req.query);
    const queryOptions = buildPrismaUrlQueryOptions(queryParams, 'Tour', [
      'isPremium',
      'createdAt',
    ]);
    const tours = await findTours(user, queryOptions);

    res.status(200).json({
      status: 'success',
      count: tours.length,
      data: {
        tours,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function createTour(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const newTour = TourCreateInputSchema.parse(req.body);
    await prisma.tour.create({
      data: newTour,
    });

    res.status(201).json({
      status: 'success',
      message: 'Tour created successfully',
      data: {
        tour: newTour,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function getTour(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const tour = await prisma.tour.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!tour) {
      throw new Error('Tour not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function updateTour(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const updatedTour = TourUpdateInputSchema.parse(req.body);
    const tour = await prisma.tour.update({
      where: {
        id: Number(id),
      },
      data: updatedTour,
    });

    if (!tour) {
      throw new Error('Tour not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function deleteTour(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    await prisma.tour.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (e) {
    next(e);
  }
}

export async function getTourStats(
  _: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const results = await db
      .selectFrom('Tour')
      .select((eb) => [
        'difficulty',
        'isPremium',
        eb.fn.countAll<number>().as('numTours'),
        eb.fn.count<number>('ratingsAverage').as('numRatings'),
        eb.fn.avg('ratingsAverage').as('avgRating'),
        eb.fn.avg('price').as('avgPrice'),
        eb.fn.sum('ratingsQuantity').as('sumRatings'),
        eb.fn.max('price').as('maxPrice'),
      ])
      .where('ratingsAverage', '>', 4.5)
      .groupBy(['difficulty', 'isPremium'])
      .having('difficulty', 'in', ['EASY', 'MEDIUM'])
      .execute();

    console.log(typeof results[0].numTours);

    res.status(200).json({
      status: 'success',
      data: {
        results,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function getMonthlyPlan(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { year } = req.params;
    const result = await db
      .selectFrom('Tour')
      .leftJoin('StartDate', 'Tour.id', 'StartDate.tourId')
      .select([
        sql`date_part('month', "startDate")`.as('month'),
        ({ fn }) => fn.countAll<number>().as('numTourStarts'),
        sql`array_agg("name")`.as('tours'),
      ])
      .where('startDate', '>=', new Date(`${year}-01-01`))
      .where('startDate', '<=', new Date(`${year}-12-31`))
      .groupBy('month')
      .orderBy('month')
      .execute();

    res.status(200).json({
      status: 'success',
      data: {
        result,
      },
    });
  } catch (e) {
    next(e);
  }
}
