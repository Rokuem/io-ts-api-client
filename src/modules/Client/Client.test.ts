import { expectTypeOf } from 'expect-type';
import { Client } from './Client';
import { spawn, ChildProcess } from 'child_process';
import { testConfig } from '../../../jest/config';
import { Resource } from '../Resource/Resource';
import { Operation } from '../Operation/Operation';
import { HttpMethod } from '../../constants/httpMethod';
import { addPathToUrl } from '../../helpers/resolveUrl';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import { HttpStatus } from '../../constants/HttpStatus';
import { t } from '../t/t';
import Model from '../Model/Model';

const okSampleResponse = new ApiResponse({
  status: HttpStatus.OK,
  model: new Model({
    name: 'API sample resource',
    model: t.interface({
      ok: t.boolean,
    }),
  }),
});

describe('A Client', () => {
  let server: ChildProcess;

  beforeAll(() => {
    return new Promise<void>((resolve, reject) => {
      server = spawn('yarn test:server', {
        stdio: 'inherit',
        shell: true,
      });

      server.on('message', (message) => {
        if (message.toString().includes('listening')) {
          return resolve();
        }
      });

      server.on('error', reject);
    });
  });

  afterAll(() => {
    server.kill();
  });

  const client = new Client({
    base: testConfig.testServerUrl,
    globalResponses: [
      new ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        model: new Model({
          name: 'API 500 resource',
          model: t.interface({
            ok: t.literal(false),
          }),
        }),
      }),
    ],
    resources: {
      samples: new Resource({
        operations: {
          getOk: new Operation({
            method: HttpMethod.GET,
            url(url) {
              addPathToUrl(url, '/sample/ok');
              return url;
            },
            responses: [okSampleResponse],
          }),
          getSample: new Operation({
            method: HttpMethod.GET,
            options: {} as {
              sampleType: 'ok' | 'accepted';
            },
            url: (url, { sampleType }) => {
              addPathToUrl(url, '/sample/' + sampleType);
              return url;
            },
            responses: [
              okSampleResponse,
              new ApiResponse({
                status: HttpStatus.ACCEPTED,
                model: new Model({
                  name: 'API sample resource',
                  model: t.interface({
                    accepted: t.boolean,
                  }),
                }),
              }),
            ],
          }),
        },
      }),
      extraResource: new Resource({
        operations: {
          getOk: new Operation({
            method: HttpMethod.GET,
            url(url) {
              addPathToUrl(url, '/sample/ok');
              return url;
            },
            responses: [okSampleResponse],
          }),
        },
      }),
    },
  });

  test('Should match the snapshot', () => {
    expect(client).toMatchSnapshot('sample client');
  });

  describe('Its API', () => {
    const API = client.getApi();

    test('Should convert its operations to an api', async () => {
      const resource = 'samples';
      expect(API).toHaveProperty(resource);
      expectTypeOf(API).toHaveProperty(resource);

      const operation = 'getSample';
      expect(API.samples).toHaveProperty(operation);
      expectTypeOf(API.samples).toHaveProperty(operation);

      const expected = {
        sampleType: '' as 'ok' | 'accepted',
      } as const;

      expectTypeOf(API.samples.getSample).parameters.toMatchTypeOf([
        expected as typeof expected | undefined,
      ]);
      expectTypeOf(API.samples.getOk).parameters.toMatchTypeOf([] as const);
    });

    test('Should return results correctly', async () => {
      const res = await API.samples.getOk();

      expect(res.data).toEqual({
        ok: true,
      });
      expectTypeOf(res.data).toMatchTypeOf({
        ok: true,
      });

      expect(res.status).toBe(HttpStatus.OK);
      expectTypeOf(res.status).toMatchTypeOf(HttpStatus.OK);

      const res2 = await API.samples.getSample({
        sampleType: 'ok',
      });

      if (res2.status === HttpStatus.OK) {
        expectTypeOf(res2.data).toMatchTypeOf({
          ok: true,
        });
      }

      if (res2.status === HttpStatus.ACCEPTED) {
        expectTypeOf(res2.data).toMatchTypeOf({
          accepted: true,
        });
      }

      if (res2.status === HttpStatus.INTERNAL_SERVER_ERROR) {
        expectTypeOf(res2.data).toMatchTypeOf({
          ok: false,
        } as const);
      }
    });
  });
});
