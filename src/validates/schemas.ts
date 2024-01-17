import { z } from 'zod';

import { TourSchema, UserSchema } from '@/db/zod/index.js';

export const QueryParamsSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
});

function createRangeSchema() {
  return z.union(
    [
      z.object({
        gte: z.coerce.number().optional(),
        lte: z.coerce.number().optional(),
        gt: z.coerce.number().optional(),
        lt: z.coerce.number().optional(),
      }),
      z.coerce.number(),
    ],
    {
      errorMap: () => ({
        message:
          'Must be a number or an object with one of the following keys: gte, lte, gt, t',
      }),
    },
  );
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

export const UserLoginSchema = UserSchema.pick({
  email: true,
  password: true,
});

export const UserEmailSchema = UserSchema.pick({
  email: true,
});
