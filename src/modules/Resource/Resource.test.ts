import { HttpMethod } from '../../constants/httpMethod';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import { Operation } from '../Operation/Operation';
import { Resource } from './Resource';
import { HttpStatus } from '../../constants/HttpStatus';
import { t } from '../t/t';
import Model from '../Model/Model';

describe('A Resource', () => {
  const resource = new Resource({
    operations: {
      test: new Operation({
        method: HttpMethod.GET,
        url: (url) => url,
        responses: [
          new ApiResponse({
            status: HttpStatus.OK,
            model: new Model({
              name: 'asd',
              model: t.interface({
                a: t.string,
              }),
            }),
          }),
          new ApiResponse({
            status: HttpStatus.ACCEPTED,
            model: new Model({
              name: 'asd',
              model: t.interface({
                b: t.string,
              }),
            }),
          }),
        ] as const,
      }),
    },
  });

  test('Should match the snapshot', () => {
    expect(resource).toMatchSnapshot('Simple Resource');
  });
});
