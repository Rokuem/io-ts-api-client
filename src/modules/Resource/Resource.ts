import { AxiosInstance } from 'axios';
import { Operation } from '../Operation/Operation';
import { addPathToUrl } from '../../helpers/resolveUrl';
export class Resource<O extends Record<string, Operation<any, any, any, any>>> {
  /**
   * Path to append to the client url for all operations.
   */
  public basePath!: string;

  /**
   * Api operations the resource can perform.
   */
  public operations!: O;

  constructor(
    config: Pick<Resource<any>, 'basePath'> & {
      operations: O;
    }
  ) {
    Object.assign(this, config);
  }

  /**
   * Executes an operation inside a resource.
   */
  public execute<K extends keyof O>({
    options,
    axios,
    url,
    operation,
  }: {
    operation: K;
    url: URL;
    axios: AxiosInstance;
    options: O[K]['options'];
  }) {
    const resourceUrl = new URL(url.href);

    if (this.basePath) {
      addPathToUrl(resourceUrl, this.basePath);
    }

    return this.operations[operation].execute({
      options: options as any,
      axios,
      url: resourceUrl,
    }) as ReturnType<O[K]['execute']>;
  }
}
