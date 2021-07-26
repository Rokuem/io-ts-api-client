import * as types from 'io-ts';
import * as extraTypes from 'io-ts-types';

export const t = {
  ...types,
  ...extraTypes,
  /**
   * Creates null intersection with provided type.
   */
  nullable: <T extends types.Any>(type: T) => types.union([t.null, type]),
  /**
   * Creates intersection between required and optional props.
   * @since 0.7.4
   */
  schema: <T extends types.Props, P extends types.Props>(type: { required: T, optional: P }) => {
    for (const key in type.optional) {
      type.optional[key] = types.union([type.optional[key], t.null]) as any;
    }

    return types.intersection([
      types.interface(type.required),
      types.partial(type.optional as any as {
        [key in keyof P]: types.UnionC<[P[key], types.NullC, types.UndefinedC]> extends types.Mixed ? types.UnionC<[P[key], types.NullC, types.UndefinedC]> : never
      })
    ])
  },
  /**
   * Type for valid date strings.
   * @since 0.8.5
   */
  dateString: new types.Type<string, string, unknown>(
    'date string',
    (input: unknown): input is string => typeof input === 'string',
    (input, context) => {
      if (typeof input !== 'string') {
        return types.failure(input, context);
      }

      const date = new Date(input);

      if (isNaN(date.getTime())) {
        return types.failure(input, context);
      }

      return types.success(input);
    },
    types.identity
  ),
  /**
   * Type for valid urls.
   * @since 0.8.5
   */
  url: new types.Type<string, string, unknown>(
    'url',
    (input: unknown): input is string => typeof input === 'string',
    (input, context) => {
      if (typeof input !== 'string') {
        return types.failure(input, context);
      }
  
      try {
        // URL constructors fails with invalid urls.
        new URL(input);
        return types.success(input);
      } catch (e) {
        return types.failure(input, context);
      }
    },
    types.identity
  )
};