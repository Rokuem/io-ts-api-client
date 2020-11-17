import { AxiosInstance } from 'axios';
import { HttpMethod } from '../../constants/httpMethod';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import Model from '../Model/Model';
import { ModelInterface } from '../Model/Model';
import { ResponseWithStatus } from '../../helpers/ResponseWithStatus.type';

export class Operation<
  Payload extends Model,
  Responses extends [...ApiResponse<any, any>[]],
  Method extends HttpMethod,
  Options = never
> {
  public url!: (...args: [url: URL, options: Options]) => URL;
  public method!: Method;
  public payloadModel?: Payload;
  public readonly responses!: [...Responses];
  public options?: Options;

  public headers?: (options?: Options) => Record<string, string>;
  payloadConstructor?: (options?: Options) => Payload;

  public mock?: (
    path?: string,
    payload?: Payload
  ) => Partial<
    {
      [key in keyof Responses]: Responses[key] extends ApiResponse<any, any>
        ? ResponseWithStatus<
            Responses[key]['status'],
            ModelInterface<Responses[key]['model']>
          >
        : Responses[key];
    }[number]
  >;
  constructor(
    config: Pick<
      Operation<Payload, Responses, Method, Options>,
      | 'url'
      | 'method'
      | 'payloadModel'
      | 'responses'
      | 'options'
      | 'headers'
      | 'mock'
    >
  ) {
    Object.assign(this, config);
  }

  public async execute({
    axios,
    options,
    url: baseUrl,
  }: {
    axios: AxiosInstance;
    options?: Options;
    url: URL;
  }) {
    const payload = this.payloadConstructor?.(options);
    this.payloadModel?.validate(payload);

    type $Response = {
      [key in keyof Responses]: Responses[key] extends ApiResponse<any, any>
        ? ResponseWithStatus<
            Responses[key]['status'],
            ModelInterface<Responses[key]['model']>
          >
        : Responses[key];
    }[number];

    if (this.mock) {
      return (this.mock() as unknown) as $Response;
    }

    const response = (await axios.request({
      data: this.payloadConstructor?.(options),
      url: (this.url as any)(baseUrl, options).href,
      headers: this.headers?.(options),
      validateStatus: (status) =>
        this.responses.some((res) => res.status === status),
    })) as $Response;

    const matchingResponses = this.responses.filter(
      (res) => res.status === response.status
    );

    if (matchingResponses.length > 1) {
      throw new Error(
        'Cannot have 2 declaration of the same status. Please use t.union instead'
      );
    }

    const [responseDeclaration] = matchingResponses;

    if (responseDeclaration) {
      responseDeclaration.model.validate((response as any).data);
    }

    return response;
  }
}
