import { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schemas.ts',
  out: './drizzle',
} satisfies Config;
