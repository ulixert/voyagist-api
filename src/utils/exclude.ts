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
 * @param modelName - The Prisma model type.
 * @param omitFields - An array of field names to exclude from the model.
 * @returns A `select` object for Prisma queries, where omitted fields are set to `false`
 * and all other fields are set to `true`, ensuring they are included in the query results.
 */
export function exclude<
  ModelName extends Entity,
  FieldName extends Keys<ModelName>,
>(modelName: ModelName, omitFields: FieldName[]) {
  type Key = Exclude<Keys<ModelName>, FieldName>;
  type ModelNameMap = Record<Key, true>;
  const result: ModelNameMap = {} as ModelNameMap;
  for (const key in Prisma[`${modelName}ScalarFieldEnum`]) {
    if (!omitFields.includes(key as FieldName)) {
      result[key as Key] = true;
    }
  }
  return result;
}
