export const cleanPayload = <T extends Record<string, unknown>>(data: T) => {
  return Object.fromEntries(
    Object.entries(data)
    .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>;
};