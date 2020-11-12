import { Operation } from './Operation';
import { HttpMethod } from '../../constants/httpMethod';
import { t } from '../t/t';
import Model from '../Model/Model';
import { HttpStatus } from '../../constants/HttpStatus';
describe('Operation', () => {
  test('Can be created', () => {
    const operation = new Operation({
      url: (url) => url,
      method: HttpMethod.GET,
      payloadModel: new Model('operation payload', t.undefined),
      responses: [
        {
          model: new Model('bad response', t.undefined),
          status: HttpStatus.OK,
        },
      ],
    });

    expect(operation).toMatchSnapshot();
  });
});
