import { expectTypeOf } from 'expect-type';
import { HttpStatus } from '../../constants/HttpStatus';
import { Model } from '../Model/Model';
import { t } from '../t/t';
import { ApiResponse } from './ApiResponse';

describe('An API Response', () => {
  const res = new ApiResponse({
    status: HttpStatus.ACCEPTED,
    model: new Model({
      name: 'API sample resource',
      schema: t.interface({
        accepted: t.boolean,
      }),
    }),
  });

  describe('Types', () => {
    test('Should infer the status correctly', () => {
      expectTypeOf(res.status).toMatchTypeOf(HttpStatus.ACCEPTED as const);
    });
  });
});
