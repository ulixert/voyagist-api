import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { tour } from '@/db/schema.js';

export const insertTourSchema = createInsertSchema(tour);
type Tour = z.infer<typeof insertTourSchema>;

const t: Tour = {};
