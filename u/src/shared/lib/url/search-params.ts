export const getEnumSearchParam = <T extends string>(
    value: string | null,
    allowed: readonly T[],
    fallback: T,
): T => {
    if (!value) return fallback;
    return allowed.includes(value as T) ? (value as T) : fallback;
};