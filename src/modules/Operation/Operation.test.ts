import { Operation } from './Operation';
import { HttpMethod } from '../../constants/httpMethod';
import { t } from '../t/t';
import Model from '../Model/Model';
import { HttpStatus } from '../../constants/HttpStatus';

const operation = new Operation({
  url: (url) => url,
  method: HttpMethod.GET,
  payloadModel: new Model('operation payload', t.undefined),
  responses: [
    {
      model: new Model('bad response', t.undefined),
      status: HttpStatus.OK,
    },
    {
      model: new Model('repeated response', t.undefined),
      status: HttpStatus.OK,
    },
    {
      model: new Model(
        'good response',
        t.interface({
          ok: t.boolean,
        })
      ),
      status: HttpStatus.ACCEPTED,
    },
  ],
});

describe('Operation', () => {
  test('Should match the snapshot', () => {
    expect(operation).toMatchSnapshot();
  });
});
