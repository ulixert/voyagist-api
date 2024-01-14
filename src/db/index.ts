import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

import { PrismaClient } from '@prisma/client';

import { DB } from './types.js';

const { Pool } = pg;

export const prisma = new PrismaClient().$extends({
  result: {
    tour: {
      durationWeeks: {
        needs: { duration: true },
        compute(tour) {
          return tour.duration / 7;
        },
      },
    },
  },
});

// Kysely
const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
});

export const db = new Kysely<DB>({ dialect });
