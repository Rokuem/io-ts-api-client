import { AxiosInstance } from 'axios';
import { Operation } from '../Operation/Operation';
import { addPathToUrl } from '../../helpers/resolveUrl';
export class Resource<
  _Operations extends Record<string, Operation<any, any, any, any>>
> {
  /**
   * Path to append to the client url for all operations.
   */
  public basePath = '';

  /**
   * Api operations the resource can perform.
   */
  public operations!: _Operations;

  constructor(
    config: Partial<Pick<Resource<any>, 'basePath'>> & {
      operations: _Operations;
    }
  ) {
    Object.assign(this, config);
  }

  /**
   * Executes an operation inside a resource.
   */
  public execute<K extends keyof _Operations>({
    options,
    axios,
    url,
    operation,
  }: {
    operation: K;
    url: URL;
    axios: AxiosInstance;
    options: _Operations[K]['options'];
  }) {
    const resourceUrl = new URL(url.href);

    if (this.basePath) {
      addPathToUrl(resourceUrl, this.basePath);
    }

    return this.operations[operation].execute({
      options: options as any,
      axios,
      url: resourceUrl,
    }) as ReturnType<_Operations[K]['execute']>;
  }
}
