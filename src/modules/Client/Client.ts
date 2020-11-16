import axios from 'axios';
import { Resource } from '../Resource/Resource';
import { mapObject } from '../../helpers/mapObject';
import { addPathToUrl } from '../../helpers/resolveUrl';

export class Client<Resources extends Record<string, Resource<any>>> {
  public axiosInstance = axios.create();
  public base: URL;

  constructor(base: string, private resources: Resources) {
    try {
      this.base = new URL(base);
    } catch (e) {
      throw new Error(
        'Could not create client. Provided base is an invalid URL: ' + base
      );
    }
  }

  public getApi() {
    return mapObject(
      this.resources,
      <K extends keyof Resources, R extends Resource<any>>(
        _resourceName: K,
        resource: R
      ) => {
        return mapObject(
          resource.operations as Resources[keyof Resources]['operations'],
          <O extends keyof Resources[K]['operations']>(operationName: O) => (
            options: Resources[K]['operations'][O]['options']
          ) => {
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
            }) as ReturnType<Resources[K]['operations'][O]['execute']>;
          }
        );
      }
    );
  }
}
