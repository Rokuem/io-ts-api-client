import axios from 'axios';
import { Resource } from '../Resource/Resource';
import { mapObject } from '../../helpers/mapObject';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import { ResponseWithStatus } from '../../helpers/ResponseWithStatus.type';
import { ModelInterface } from '../Model/Model';
import { ValidationOptions } from '../types';

export type MapResponses<Responses extends [...ApiResponse<any, any>[]]> = {
  [key in keyof Responses]: Responses[key] extends ApiResponse<
    infer ResponseModel,
    infer ResponseStatus
  >
    ? Promise<ResponseWithStatus<ResponseStatus, ModelInterface<ResponseModel>>>
    : never;
}[number];

/**
 * API client constructor. Use this to define a client then, use the `client.getApi()` to get the typesafe api.
 *
 * After declaring the resources you will be able to execute its operations with the client API.
 *
 * @example
 *  const client = new Client({
 *    //...
 *  });
 *
 *  const API = client.getApi();
 *
 *  const res = await API.someResource.someOperation();
 *
 *  if (res.status === HTTPStatus.OK) { // typeguard
 *    console.log(res.data)
 *  }
 */
export class Client<
  Resources extends Record<string, Resource<any, any>>,
  GlobalResponses extends ApiResponse<any, any> = ApiResponse<never, never>
> implements ValidationOptions {
  public debug = false;
  public strictTypes = false;
  public throwErrors = false;
  /**
   * Axios instance this client should use.
   *
   * This will be created by default, but can be replaced at will.
   *
   * @default axios.create()
   */
  public axiosInstance = axios.create();
  /**
   * URL object based on the client base url.
   */

  /**
   * URL of the server that will be used as a base. Needs to be valid.
   */
  public base!: URL;

  /**
   * List of resources provided by the base url of the API.
   *
   * Each resource can have more paths associated to it.
   */
  public readonly resources!: Resources;

  /**
   * Global responses that can be returned by the operations.
   *
   * Strongly recommended to add 500 and 404 errors here for example.
   */
  public globalResponses: [...GlobalResponses[]] = [];

  constructor(
    options: Pick<
      Client<Resources, GlobalResponses>,
      'base' | 'globalResponses' | 'resources'
    > &
      Partial<ValidationOptions>
  ) {
    Object.assign(this, options);
  }

  /**
   * Gets the typesafe client API for executing the operations.
   */
  public getApi() {
    type ResourceOperations<
      ResourceKey extends keyof Resources
    > = Resources[ResourceKey]['operations'];

    type Operation<
      ResourceKey extends keyof Resources,
      ResourceOperation extends keyof ResourceOperations<ResourceKey>
    > = Resources[ResourceKey]['operations'][ResourceOperation];

    type OperationOptions<
      ResourceKey extends keyof Resources,
      OperationKey extends keyof ResourceOperations<ResourceKey>
    > = Operation<ResourceKey, OperationKey>['options'] extends undefined
      ? []
      : [Operation<ResourceKey, OperationKey>['options']];

    type API = {
      [ResourceKey in keyof Resources]: {
        [OperationKey in keyof ResourceOperations<ResourceKey>]: (
          ...args: OperationOptions<ResourceKey, OperationKey>
        ) => GlobalResponses extends ApiResponse<never, never>
          ? MapResponses<Operation<ResourceKey, OperationKey>['responses']>
          :
              | MapResponses<Operation<ResourceKey, OperationKey>['responses']>
              | MapResponses<[...GlobalResponses[]]>;
      };
    };
    return mapObject(this.resources, (resourceName, resource) => {
      return [
        resourceName,
        mapObject(resource.operations, (operationName) => [
          operationName,
          (options: any) => {
            const operationUrl = new URL(this.base.href);

            if (typeof operationName !== 'string') {
              throw new Error('Operation names must be string');
            }

            return resource.execute({
              operation: operationName,
              axiosInstance: this.axiosInstance,
              options,
              base: operationUrl,
              globalResponses: this.globalResponses,
              debug: this.debug,
              strictTypes: this.strictTypes,
              throwErrors: this.throwErrors,
            });
          },
        ]),
      ];
    }) as API;
  }
}
