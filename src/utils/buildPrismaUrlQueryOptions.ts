type BuildPrismaUrlQueryOptionsProps = {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  [key: string]: unknown;
};

export function buildPrismaUrlQueryOptions({
  sort,
  page,
  limit,
  fields,
  ...where
}: BuildPrismaUrlQueryOptionsProps) {
  const selectOption: Record<string, boolean> = {};
  if (fields) {
    fields.split(',').forEach((field) => (selectOption[field] = true));
  }
  const select = fields ? selectOption : undefined;
  const take = limit ?? undefined;
  const skip = page && limit ? page * limit : undefined;
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
