import { Prisma } from '@prisma/client';

export const softDelete = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    user: {
      $allOperations({ query, args, operation }) {
        if (operation !== 'create' && operation !== 'createMany') {
          args.where = { ...args.where, active: true };
        }

        return query(args);
      },
    },
  },
});
