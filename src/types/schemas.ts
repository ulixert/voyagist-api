import { z } from 'zod';

const QueryParamsBaseSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
});

export const TourQueryParamsSchema = QueryParamsBaseSchema.merge(
  z.object({
    difficulty: z.enum(['EASY', 'MEDIUM', 'DIFFICULT']).optional(),
    duration: z.coerce.number().int().positive().optional(),
    maxGroupSize: z.coerce.number().int().positive().optional(),
  }),
);
