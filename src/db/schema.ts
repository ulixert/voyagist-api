import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const difficultyEnum = pgEnum('difficulty', [
  'easy',
  'medium',
  'difficult',
]);

export const tour = pgTable('tour', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 40 }).notNull().unique(),
  duration: integer('duration').notNull(),
  maxGroupSize: integer('maxGroupSize').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  ratingsAverage: doublePrecision('ratingsAverage').notNull().default(4.5),
  ratingsQuantity: integer('ratingsQuantity').notNull().default(0),
  price: integer('price').notNull(),
  priceDiscount: integer('priceDiscount'),
  summary: varchar('summary', { length: 200 }).notNull(),
  description: varchar('description', { length: 1000 }),
  imageCover: varchar('imageCover', { length: 100 }).notNull(),
  images: varchar('images', { length: 100 }).array(),
  createdAt: timestamp('createdAt', {
    withTimezone: true,
    mode: 'string',
    precision: 3,
  })
    .notNull()
    .defaultNow(),
  startDates: timestamp('startDates', {
    withTimezone: true,
    mode: 'string',
    precision: 3,
  })
    .array()
    .notNull(),
});
