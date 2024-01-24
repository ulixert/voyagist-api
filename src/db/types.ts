import type { ColumnType } from 'kysely';

import type { Difficulty, Role } from './enums.js';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Profile = {
  id: Generated<number>;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  image: string | null;
};
export type StartDate = {
  id: Generated<number>;
  tourId: number;
  startDate: Timestamp;
};
export type Tour = {
  id: Generated<number>;
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: Difficulty;
  /**
   * @zod.number.min(1).max(5)
   */
  ratingsAverage: Generated<number>;
  ratingsQuantity: Generated<number>;
  price: number;
  priceDiscount: number | null;
  summary: string;
  description: string | null;
  imageCover: string;
  images: string[];
  createdAt: Generated<Timestamp>;
  isPremium: Generated<boolean>;
};
export type User = {
  id: Generated<number>;
  name: string;
  /**
   * @zod.string.email()
   */
  email: string;
  /**
   * @zod.string.min(8).max(20)
   */
  password: string;
  role: Generated<Role>;
  createdAt: Generated<Timestamp>;
  passwordChangedAt: Timestamp | null;
  resetPasswordToken: string | null;
  resetPasswordExp: Timestamp | null;
};
export type DB = {
  profile: Profile;
  start_date: StartDate;
  tour: Tour;
  user: User;
};
