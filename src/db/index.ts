import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.js';

const queryConnection = postgres(process.env.DATABASE_URL!);

export const db = drizzle(queryConnection, { schema });
