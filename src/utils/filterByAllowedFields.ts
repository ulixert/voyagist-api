export function filterByAllowedFields(
  inputObject: Record<string, unknown>,
  ...permittedFields: string[]
) {
  const fieldSet = new Set(permittedFields);
  const filteredObject: Record<string, unknown> = {};
  Object.keys(inputObject).forEach((key) => {
    if (fieldSet.has(key)) {
      filteredObject[key] = inputObject[key];
    }
  });
  return filteredObject;
}
