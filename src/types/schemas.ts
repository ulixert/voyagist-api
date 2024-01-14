import { z } from 'zod';

import { TourSchema } from '../../prisma/generated/zod/index.js';

export const QueryParamsSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
});

function createRangeSchema() {
  return z.union([
    z.object({
      gte: z.coerce.number().optional(),
      lte: z.coerce.number().optional(),
      gt: z.coerce.number().optional(),
      lt: z.coerce.number().optional(),
    }),
    z.coerce.number(),
  ]);
}

export const TourUrlQuerySchema = TourSchema.extend({
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
  });
