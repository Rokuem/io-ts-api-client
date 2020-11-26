import * as types from 'io-ts';
import * as extraTypes from 'io-ts-types';

export const t = {
  ...types,
  ...extraTypes,
  nullable: <T extends types.Any>(type: T) => types.union([t.null, type]),
};
