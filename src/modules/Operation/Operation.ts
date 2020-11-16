import { AxiosInstance } from 'axios';
import { HttpMethod } from '../../constants/httpMethod';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import Model from '../Model/Model';
import { ModelInterface } from '../Model/Model';
import { ResponseWithStatus } from '../../helpers/ResponseWithStatus.type';

export class Operation<
  _Payload extends Model,
  _Responses extends readonly [...ApiResponse<any, any>[]],
  _Method extends HttpMethod,
  _Options = never
> {
  public url!: (url: URL, options?: _Options) => URL;
  public method!: _Method;
  public payloadModel?: _Payload;
  public responses!: _Responses;
  public options?: _Options;

  public headers?: (options?: _Options) => Record<string, string>;
  payloadConstructor?: (options?: _Options) => _Payload;

  public mock?: (
    path?: string,
    payload?: _Payload
  ) => Partial<
    {
      [key in keyof _Responses]: _Responses[key] extends ApiResponse<any, any>
        ? ResponseWithStatus<
            _Responses[key]['status'],
            ModelInterface<_Responses[key]['model']>
          >
        : _Responses[key];
    }[number]
  >;
  constructor(
    config: Pick<
      Operation<_Payload, _Responses, _Method, _Options>,
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
    options?: _Options;
    url: URL;
  }) {
    const payload = this.payloadConstructor?.(options);
    this.payloadModel?.validate(payload);

    type $Response = {
      [key in keyof _Responses]: _Responses[key] extends ApiResponse<any, any>
        ? ResponseWithStatus<
            _Responses[key]['status'],
            ModelInterface<_Responses[key]['model']>
          >
        : _Responses[key];
    }[number];

    if (this.mock) {
      return (this.mock() as unknown) as $Response;
    }

    const response = (await axios.request({
      data: this.payloadConstructor?.(options),
      url: this.url(baseUrl, options).href,
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
