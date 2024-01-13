import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

import { PrismaClient } from '@prisma/client';

import { DB } from './types.js';

const { Pool } = pg;

export const prisma = new PrismaClient();

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<DB>({ dialect });
