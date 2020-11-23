import { Operation } from './Operation';
import { HttpMethod } from '../../constants/httpMethod';
import { t } from '../t/t';
import { Model } from '../Model/Model';
import { HttpStatus } from '../../constants/HttpStatus';
import { expectTypeOf } from 'expect-type';
import { ApiResponse } from '../ApiResponse/ApiResponse';

const operation = new Operation({
  url: (url) => url,
  method: HttpMethod.GET,
  payloadModel: new Model({
    name: 'operation payload',
    schema: t.undefined,
  }),
  responses: [
    new ApiResponse({
      model: new Model({
        name: 'bad response',
        schema: t.undefined,
      }),
      status: HttpStatus.OK,
    }),
    new ApiResponse({
      model: new Model({
        name: 'repeated response',
        schema: t.undefined,
      }),
      status: HttpStatus.OK,
    }),
    new ApiResponse({
      model: new Model({
        name: 'good response',
        schema: t.interface({
          ok: t.boolean,
        }),
      }),
      status: HttpStatus.ACCEPTED,
    }),
  ],
});

describe('Operation', () => {
  test('Should match the snapshot', () => {
    expect(operation).toMatchSnapshot();
  });

  test('Should infer The responses correctly', () => {
    expectTypeOf(operation.responses[0].status).toMatchTypeOf(
      HttpStatus.OK as const
    );
  });
});
