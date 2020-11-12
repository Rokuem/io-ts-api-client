import { AxiosInstance } from 'axios';
import { HttpMethod } from '../../constants/httpMethod';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import Model from '../Model/Model';

export class Operation<
  O extends Record<string, any> = any,
  P extends Model = any,
  R extends ApiResponse = any,
  M extends HttpMethod = HttpMethod.GET
> {
  public url!: (url: URL, options: O) => URL;
  public method!: M;
  public payloadModel?: P;
  public responses!: R[];
  public options?: O;

  public headers?: (options?: O) => Record<string, string>;
  payloadConstructor?: (options: O) => P;
  constructor(
    config: Pick<
      Operation<O, P, R, M>,
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
    options: O;
    url: URL;
  }) {
    const payload = this.payloadConstructor?.(options);
    this.payloadModel?.validate(payload);

    const response = await axios.request({
      data: this.payloadConstructor?.(options),
      url: this.url(baseUrl, options).href,
      headers: this.headers?.(options),
      validateStatus: (status) =>
        this.responses.some((res) => res.status === status),
    });

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
      responseDeclaration.model.validate(response.data);
    }

    return response;
  }
}
