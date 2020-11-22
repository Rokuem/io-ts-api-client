import { AxiosInstance } from 'axios';
import { Operation } from '../Operation/Operation';
import { addPathToUrl } from '../../helpers/resolveUrl';
import { ApiResponse } from '../ApiResponse/ApiResponse';

/**
 * A resource is a base of the API. It contains operations that will execute using it as a base.
 */
export class Resource<
  Operations extends Record<
    string,
    Operation<any, any, any, never> | Operation<any, any, any, any>
  >,
  GlobalResponses extends ApiResponse<any, any>
> {
  /**
   * Path to append to the client url for all operations.
   */
  public basePath = '';

  /**
   * Api operations the resource can perform.
   */
  public operations!: Operations;

  constructor(
    config: Partial<Pick<Resource<any, any>, 'basePath'>> & {
      operations: Operations;
    }
  ) {
    Object.assign(this, config);
    this.assignOperationNames();
  }

  private assignOperationNames() {
    for (const key in this.operations) {
      const operation = this.operations[key];
      operation.name = key;
    }
  }

  /**
   * Executes an operation inside a resource.
   */
  public execute<K extends keyof Operations>({
    options,
    axios,
    url,
    operation,
    globalResponses,
  }: {
    operation: K;
    url: URL;
    axios: AxiosInstance;
    options: Operations[K]['options'];
    globalResponses: [...GlobalResponses[]];
  }) {
    const resourceUrl = new URL(url.href);

    if (this.basePath) {
      addPathToUrl(resourceUrl, this.basePath);
    }

    return (this.operations[operation] as Operation<any, any, any>).execute({
      options: options as any,
      axios,
      url: resourceUrl,
      globalResponses,
    }) as ReturnType<Operations[K]['execute']>;
  }
}
