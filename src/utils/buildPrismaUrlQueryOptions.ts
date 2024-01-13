import { Entity, Keys, exclude } from './exclude.js';

type BuildPrismaUrlQueryOptionsProps = {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  [key: string]: unknown;
};

/**
 * Constructs options for Prisma `findMany` based on URL query parameters.
 * This function takes query parameters from a URL and converts them into a format
 * suitable for Prisma's `findMany` method, supporting features like pagination,
 * field selection, sorting, and filtering.
 *
 * @param {BuildPrismaUrlQueryOptionsProps} params - The query parameters, including
 * page, limit, sort, fields, and any other filters.
 * @param modelName - An optional Prisma model type. Used in conjunction with `omitFields`
 * to exclude certain fields.
 * @param omitFields - An optional array of field names to exclude from the results.
 * Requires `type` to be specified.
 * @returns An object containing Prisma query options such as `where`, `select`, `take`,
 * `skip`, and `orderBy`.
 */
export function buildPrismaUrlQueryOptions<
  ModelName extends Entity,
  FieldName extends Keys<ModelName>,
>(
  { sort, page, limit, fields, ...where }: BuildPrismaUrlQueryOptionsProps,
  modelName?: ModelName,
  omitFields?: FieldName[],
) {
  // 'take' defines how many records to return (used for pagination).
  const take = limit ?? 5;

  // 'skip' defines how many records to skip (used for pagination).
  const skip = page && limit ? (page - 1) * limit : undefined;

  // Process 'fields' to construct a 'select' object for Prisma.
  // This determines which fields of the model should be included in the response.
  const selectOption: Record<string, boolean> = {};
  if (fields) {
    fields.split(',').forEach((field) => {
      selectOption[field] = true;
    });
  }
  const select = fields
    ? selectOption
    : modelName && omitFields
      ? exclude(modelName, omitFields)
      : undefined;

  // Process 'sort' to construct an 'orderBy' array for Prisma.
  // This defines the sorting order of the result set.
  // A '-' prefix in the field name indicates descending order.
  const orderByOption: Record<string, string>[] = [];
  if (sort) {
    sort.split(',').forEach((field) => {
      if (field.startsWith('-')) {
        orderByOption.push({ [field.slice(1)]: 'desc' });
      } else {
        orderByOption.push({ [field]: 'asc' });
      }
    });
  }
  const orderBy = sort ? orderByOption : undefined;

  return {
    where,
    select,
    take,
    skip,
    orderBy,
  } as const;
}
