import { AxiosInstance, AxiosResponse } from 'axios';
import { HttpMethod } from '../../constants/httpMethod';
import { HttpStatus } from '../../constants/HttpStatus';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import Model from '../Model/Model';
import { ModelInterface } from '../Model/Model';

export class Operation<
  _Operation extends Record<string, any>,
  _Payload extends Model,
  _Responses extends readonly [...ApiResponse<any, any>[]],
  _Method extends HttpMethod
> {
  public url!: (url: URL, options: _Operation) => URL;
  public method!: _Method;
  public payloadModel?: _Payload;
  public responses!: _Responses;
  public options?: _Operation;

  public headers?: (options?: _Operation) => Record<string, string>;
  payloadConstructor?: (options: _Operation) => _Payload;
  constructor(
    config: Pick<
      Operation<_Operation, _Payload, _Responses, _Method>,
      'url' | 'method' | 'payloadModel' | 'responses' | 'options' | 'headers'
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
    options: _Operation;
    url: URL;
  }) {
    const payload = this.payloadConstructor?.(options);
    this.payloadModel?.validate(payload);

    interface ResponseWithStatus<S extends HttpStatus, D extends any>
      extends AxiosResponse<D> {
      status: S;
      data: D;
    }

    const response = (await axios.request({
      data: this.payloadConstructor?.(options),
      url: this.url(baseUrl, options).href,
      headers: this.headers?.(options),
      validateStatus: (status) =>
        this.responses.some((res) => res.status === status),
    })) as {
      [key in keyof _Responses]: _Responses[key] extends ApiResponse<any, any>
        ? ResponseWithStatus<
            _Responses[key]['status'],
            ModelInterface<_Responses[key]['model']>
          >
        : _Responses[key];
    }[number];

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
