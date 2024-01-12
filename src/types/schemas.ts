import { z } from 'zod';

import { TourSchema } from '../../prisma/generated/zod/index.js';

export const QueryParamsSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
});

function createRangeSchema() {
  return z
    .object({
      gte: z.coerce.number().int().positive().optional(),
      lte: z.coerce.number().int().positive().optional(),
      gt: z.coerce.number().int().positive().optional(),
      lt: z.coerce.number().int().positive().optional(),
    })
    .or(z.coerce.number().int().positive())
    .optional();
}

export const TourQueryParamsSchema = TourSchema.extend({
  duration: createRangeSchema(),
  maxGroupSize: createRangeSchema(),
  price: createRangeSchema(),
  ratingsAverage: createRangeSchema(),
  ratingsQuantity: createRangeSchema(),
})
  .partial()
  .merge(QueryParamsSchema)
  .omit({
    images: true,
    startDates: true,
  });
