import axios from 'axios';
import { Resource } from '../Resource/Resource';
import { mapObject } from '../../helpers/mapObject';
import { addPathToUrl } from '../../helpers/resolveUrl';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import { ResponseWithStatus } from '../../helpers/ResponseWithStatus.type';
import { ModelInterface } from '../Model/Model';

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
  GlobalResponses extends ApiResponse<any, any> = any
> {
  /**
   * Axios instance this client should use.
   *
   * This will be created by default, but can be modified.
   *
   * @default axios.create()
   */
  public axiosInstance = axios.create();
  /**
   * URL object based on the client base url.
   */
  public base: URL;

  /**
   * List of resources provided by the base url of the API.
   *
   * Each resource can have more paths associated to it.
   */
  private readonly resources: Resources;

  /**
   * Global responses that can be returned by the operations.
   */
  private globalResponses: [...GlobalResponses[]] = [];

  constructor({
    base,
    resources,
    globalResponses,
  }: {
    /**
     * URL of the server that will be used as a base.
     */
    base: string;
    /**
     * List of resources this url provides.
     */
    resources: Resources;
    /**
     * Responses that might be returned in any operation.
     */
    readonly globalResponses?: [...GlobalResponses[]];
  }) {
    try {
      this.base = new URL(base);
      this.resources = resources;
      this.globalResponses = globalResponses || [];
    } catch (e) {
      throw new Error(
        'Could not create client. Provided base is an invalid URL: ' + base
      );
    }
  }

  /**
   * Gets the typesafe client API for executing the operations.
   */
  public getApi() {
    type ResourceOperations<
      R extends keyof Resources
    > = Resources[R]['operations'];
    type Operation<
      R extends keyof Resources,
      O extends keyof ResourceOperations<R>
    > = Resources[R]['operations'][O];

    type API = {
      [R in keyof Resources]: {
        [O in keyof ResourceOperations<R>]: (
          ...args: Operation<R, O>['options'] extends undefined
            ? []
            : [Operation<R, O>['options']]
        ) => Operation<R, O>['responses'] extends [...infer R]
          ?
              | {
                  [key in keyof R]: R[key] extends ApiResponse<infer M, infer S>
                    ? Promise<ResponseWithStatus<S, ModelInterface<M>>>
                    : R[key];
                }[number]
              | {
                  [key in keyof [...GlobalResponses[]]]: [
                    ...GlobalResponses[]
                  ][key] extends ApiResponse<infer M, infer S>
                    ? Promise<ResponseWithStatus<S, ModelInterface<M>>>
                    : [...GlobalResponses[]][key];
                }[number]
          : never;
      };
    };
    return mapObject(this.resources, (resourceName, resource) => {
      return [
        resourceName,
        mapObject(resource.operations, (operationName) => [
          operationName,
          (options: any) => {
            const operationUrl = new URL(this.base.href);

            if (resource.basePath) {
              addPathToUrl(operationUrl, resource.basePath);
            }

            if (typeof operationName !== 'string') {
              throw new Error('Operation names must be string');
            }

            return resource.execute({
              operation: operationName,
              axios: this.axiosInstance,
              options,
              url: operationUrl,
              globalResponses: this.globalResponses,
            });
          },
        ]),
      ];
    }) as API;
  }
}
