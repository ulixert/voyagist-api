import { Prisma } from '@prisma/client';

type A<T extends string> = T extends `${infer U}ScalarFieldEnum` ? U : never;
export type Entity = A<keyof typeof Prisma>;
export type Keys<T extends Entity> = Extract<
  keyof (typeof Prisma)[keyof Pick<typeof Prisma, `${T}ScalarFieldEnum`>],
  string
>;

/**
 * Creates a `select` object for a Prisma query that includes all fields of a given
 * model except for the specified fields to omit.
 *
 * @param type - The Prisma model type.
 * @param omit - An array of field names to exclude from the model.
 * @returns A `select` object for Prisma queries, where omitted fields are set to `false`
 * and all other fields are set to `true`, ensuring they are included in the query results.
 */
// export function exclude<T extends Entity, K extends Keys<T>>(
//   type: T,
//   omit: K[],
// ) {
//   type Key = Exclude<Keys<T>, K>;
//   type TMap = Record<Key, true>;
//   const result: TMap = {} as TMap;
//   for (const key in Prisma[`${type}ScalarFieldEnum`]) {
//     if (!omit.includes(key as K)) {
//       result[key as Key] = true;
//     }
//   }
//   return result;
// }

export function exclude<T extends Entity, K extends Keys<T>>(
  type: T,
  omit: K[],
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const key in Prisma[`${type}ScalarFieldEnum`]) {
    if (!omit.includes(key as K)) {
      result[key] = true;
    }
  }
  return result;
}
