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
 * @warn You need to use 'as const' so types can be inferred properly.
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
  _Resources extends Record<string, Resource<any>>,
  _GlobalResponses extends ApiResponse<any, any>[] = []
> {
  /**
   * Axios instance this client should use.
   *
   * This will be created by default, but can be modified for more customization.
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
  private readonly resources: _Resources;

  constructor({
    base,
    resources,
  }: {
    /**
     * URL of the server that will be used as a base.
     */
    base: string;
    /**
     * List of resources this url provides.
     */
    resources: _Resources;
    /**
     * Responses that might be returned in any operation.
     */
    globalResponses?: _GlobalResponses;
  }) {
    try {
      this.base = new URL(base);
      this.resources = resources;
    } catch (e) {
      throw new Error(
        'Could not create client. Provided base is an invalid URL: ' + base
      );
    }
  }

  public getApi() {
    type ResourceOperations<
      R extends keyof _Resources
    > = _Resources[R]['operations'];
    type Operation<
      R extends keyof _Resources,
      O extends keyof ResourceOperations<R>
    > = _Resources[R]['operations'][O];

    type API = {
      [$ResourceKey in keyof _Resources]: {
        [$OperationKey in keyof ResourceOperations<$ResourceKey>]: (
          ...args: Operation<$ResourceKey, $OperationKey>['options']
        ) => {
          [key in keyof Operation<
            $ResourceKey,
            $OperationKey
          >['responses']]: Operation<
            $ResourceKey,
            $OperationKey
          >['responses'][key] extends ApiResponse<infer M, infer S>
            ? ResponseWithStatus<S, ModelInterface<M>>
            : Operation<$ResourceKey, $OperationKey>['responses'][key];
        }[number];
      };
    };

    return mapObject(this.resources, (_resourceName, resource) => {
      return mapObject(
        resource.operations,
        (operationName) => (options: any) => {
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
          });
        }
      );
    }) as API;
  }
}
