type BuildPrismaUrlQueryOptionsProps = {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
};

export function buildPrismaUrlQueryOptions({
  sort,
  page,
  limit,
  fields,
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
  const orderBy = orderByOption.length > 0 ? orderByOption : undefined;

  return {
    select,
    take,
    skip,
    orderBy,
  };
}
