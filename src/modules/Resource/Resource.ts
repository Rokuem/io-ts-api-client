import { Operation } from '../Operation/Operation';
import { addPathToUrl } from '../../helpers/resolveUrl';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import type { Client } from '../Client/Client';
import { ValidationOptions } from '../types';

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
      operation.setName(key);
    }
  }

  /**
   * Executes an operation inside a resource.
   */
  public execute<K extends keyof Operations>(
    options: Pick<
      Client<
        Record<string, Resource<Operations, GlobalResponses>>,
        GlobalResponses
      >,
      'base' | 'globalResponses' | 'axiosInstance'
    > &
      Pick<Operations[K], 'options'> & {
        operation: K;
      } & ValidationOptions
  ) {
    const resourceUrl = new URL(options.base.href);

    if (this.basePath) {
      addPathToUrl(resourceUrl, this.basePath);
    }

    const operation = this.operations[options.operation];

    if (!(operation instanceof Operation)) {
      throw new Error('Invalid operation: ' + options.operation);
    }

    return operation.execute({ ...options, base: resourceUrl })
  }
}
