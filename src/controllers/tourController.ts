import type { NextFunction, Request, Response } from 'express';
import { sql } from 'kysely';
import { db, prisma } from '@/db/index.js';
import { HttpError, NotFoundError } from '@/errors/errors.js';
import { type QueryOptions, buildPrismaUrlQueryOptions } from '@/utils/buildPrismaUrlQueryOptions.js';
import { TourUrlQuerySchema } from '@/validates/schemas.js';


import { TourCreateInputSchema, TourUpdateInputSchema, type User } from '../../prisma/generated/zod';
import { AppMessage, HttpStatusCode, TourMessage, UserMessage } fro '@/constants/constants.js';


export function checkID(req: Request, _: Response, next: NextFunction) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 0) {
    next(new HttpError(AppMessage.ID_FORMAT_ERROR, HttpStatusCode.BAD_REQUEST));
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
    console.log(req.query);
    const user = await prisma.user.findUnique({
      where: { id: 3 }
    });

    if (!user) {
      throw new NotFoundError(UserMessage.NOT_FOUND);
    }

    const queryParams = TourUrlQuerySchema.parse(req.query);
    console.log(queryParams);
    const queryOptions = buildPrismaUrlQueryOptions(queryParams, 'Tour', [
      'isPremium',
      'createdAt',
    ]);
    const tours = await findTours(user, queryOptions);

    res.status(HttpStatusCode.OK).json({
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

    res.status(HttpStatusCode.CREATED).json({
      status: 'success',
      message: TourMessage.CREATED,
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
      throw new NotFoundError(TourMessage.NOT_FOUND);
    }

    res.status(HttpStatusCode.OK).json({
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

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      message: TourMessage.UPDATED,
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

    res.status(HttpStatusCode.NO_CONTENT).json({
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

    res.status(HttpStatusCode.OK).json({
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

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      data: {
        result,
      },
    });
  } catch (e) {
    next(e);
  }
}
