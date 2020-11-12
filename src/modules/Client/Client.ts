import axios from 'axios';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import { ModelInterface } from '../Model/Model';
import { Operation } from '../Operation/Operation';

export function defineClient<
  Resources extends Record<string, Record<string, Operation>>,
  GlobalResponses extends ApiResponse
>(config: {
  base: string;
  globalResponses?: GlobalResponses[];
  resources: Resources;
}) {
  const client = axios.create();

  const api: Record<
    string,
    Record<string, (...args: any[]) => Promise<any>>
  > = {};

  for (const resourceKey in config.resources) {
    const resource = config.resources[resourceKey];
    for (const operationKey in resource.operations) {
      const operation: Operation =
        resource.operations[operationKey as keyof Operation];

      api[resourceKey] = {
        [operationKey]: async (
          options: typeof operation['options']
        ): Promise<any> => {
          const response = await client.request({
            method: operation.method,
            data: operation.payloadConstructor?.(options),
            url: operation.url(new URL(config.base), options).href,
          });

          return response.data;
        },
      };
    }
  }

  return {
    ...config,
    ...((api as any) as {
      [resource in keyof Resources]: {
        [operation in keyof Resources[resource]]: (
          ...args: Resources[resource][operation]['options'] extends never
            ? []
            : [options: Resources[resource][operation]['options']]
        ) => Promise<
          ModelInterface<
            | GlobalResponses['model']
            | Resources[resource][operation]['responses'][number]['model']
          >
        >;
      };
    }),
  };
}
