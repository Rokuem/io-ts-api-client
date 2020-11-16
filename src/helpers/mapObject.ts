export function mapObject<
  T extends Record<string, any>,
  Transformer extends <K extends keyof T>(key: K, value: T[K]) => any
>(object: T, transformer: Transformer) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => transformer(key, value))
  ) as {
    [key in keyof T]: Transformer extends (key: key, value: T[key]) => infer R
      ? R
      : ReturnType<Transformer>;
  };
}
