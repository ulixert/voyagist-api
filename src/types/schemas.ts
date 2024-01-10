import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { tour } from '@/db/schema.js';

export const InsertTourSchema = createInsertSchema(tour);
export const SelectTourSchema = createSelectSchema(tour);
export const UrlQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
});

export const TourQueryStringSchema = z.object({
  duration: z.coerce.number().positive().optional(),
  difficulty: z.enum(['easy', 'medium', 'difficult']).optional(),
  price: z.coerce.number().positive().optional(),
  maxGroupSize: z.coerce.number().positive().optional(),
  ratingsAverage: z.coerce.number().positive().optional(),
  ratingsQuantity: z.coerce.number().positive().optional(),
});
