export function mapObject<
  T extends Record<string, any>,
  Transformer extends <K extends keyof T>(key: K, value: T[K]) => any
>(object: T, transformer: Transformer) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => transformer(key, value))
  );
}
