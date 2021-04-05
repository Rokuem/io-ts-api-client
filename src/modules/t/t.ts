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
  schema: <T extends types.Props, P extends types.Props>(type: { required: T, optional: P }) => types.intersection([
    types.interface(type.required),
    types.partial(type.optional)
  ])
};