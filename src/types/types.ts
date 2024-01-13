import { prisma } from '@/db/index.js';

export const ModelActions = {
  tour: prisma.tour,
} as const;

export type ModelNames = keyof typeof ModelActions;
