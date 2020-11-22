import { AxiosInstance } from 'axios';
import { HttpMethod } from '../../constants/httpMethod';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import Model from '../Model/Model';
import { ModelInterface } from '../Model/Model';
import { ResponseWithStatus } from '../../helpers/ResponseWithStatus.type';
import { t } from '../t/t';

/**
 * Operations describes a request.
 *
 * You can pass its options as the first type argument.
 */
export class Operation<
  Payload extends Model<any>,
  Responses extends [...ApiResponse<any, any>[]],
  Method extends HttpMethod,
  Options = never
> {
  /**
   * If true, operations will log what they are doing.
   */
  public static debug = false;

  /**
   * Name of the operation. Infered when the client is made.
   */
  public name = 'Operation';
  /**
   * function to construct the url of the operation.
   *
   * @param ulr - The base URL object of the api.
   * @param options - The options of the operation.
   */
  public url!: (...args: [url: URL, options: Options]) => URL;
  /**
   * HTTP method of the operation.
   */
  public method!: Method;
  /**
   * IO-TS Model used to validate the payload.
   */
  public payloadModel?: Payload;
  /**
   * List of possible responses for the operation.
   *
   * This can be merged with global responses of a client.
   */
  public readonly responses!: [...Responses];
  /**
   * Options of the operation.
   *
   * This is just for typing so you can use `{} as Options` for example.
   * You can also provide this in the operations constructor.
   */
  public options?: Options;
  /**
   * Function to get the object of headers to send with the request.
   */
  public headers?: (options?: Options) => Record<string, string>;
  /**
   * Function to mock the response. Useful for testing and for development when the API is not ready.
   */
  public mock?: (
    path?: string,
    payload?: Payload
  ) => Partial<
    {
      [key in keyof Responses]: Responses[key] extends ApiResponse<any, any>
        ? Partial<
            ResponseWithStatus<
              Responses[key]['status'],
              ModelInterface<Responses[key]['model']>
            >
          >
        : Responses[key];
    }[number]
  >;
  /**
   * Function to construct the payload using the provided options for the operation.
   */
  payloadConstructor?: (options?: Options) => Payload;
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

  private log(...message: any[]) {
    if (Operation.debug) {
      console.log(`[${this.name}] `, ...message);
    }
  }

  /**
   * Executes the operation using the provided configuration.
   */
  public async execute<GlobalResponses extends ApiResponse<any, any>>({
    axios,
    options,
    url: baseUrl,
    globalResponses,
  }: {
    /**
     * Axios instance that will perform the request.
     */
    axios: AxiosInstance;
    /**
     * Options of the operation.
     */
    options?: Options;
    /**
     * URL to use as an base for the operation.
     */
    url: URL;
    /**
     * List of global responses that can also happen with the operation.
     */
    globalResponses: [...GlobalResponses[]];
  }) {
    if (this.payloadConstructor) {
      const payload = this.payloadConstructor?.(options);
      this.log('Payload: ', payload);
      this.payloadModel?.validate(payload);
    }

    type GetResponses<T extends [...ApiResponse<any, any>[]]> = {
      [key in keyof T]: T[key] extends ApiResponse<any, any>
        ? ResponseWithStatus<T[key]['status'], ModelInterface<T[key]['model']>>
        : T[key];
    }[number];

    type $Response =
      | GetResponses<Responses>
      | GetResponses<[...GlobalResponses[]]>;

    if (this.mock) {
      this.log('mock detected!');
      const mock = this.mock();
      this.log('Mock: ', mock);
      return mock as $Response;
    }

    const response = (await axios.request({
      method: this.method as any,
      data: this.payloadConstructor?.(options),
      url: (this.url as any)(baseUrl, options).href,
      headers: this.headers?.(options),
      validateStatus: (status) =>
        this.responses.some((res) => res.status === status),
    })) as $Response;

    const matchingResponses = [...this.responses, ...globalResponses].filter(
      (res) => res.status === response.status
    );

    this.log('matching Responses: ', matchingResponses);

    let [responseDeclaration] = matchingResponses;

    if (matchingResponses.length > 1) {
      responseDeclaration = new ApiResponse({
        model: new Model({
          model: t.intersection([
            ...matchingResponses.map((res) => res.model.base),
          ] as any),
          name: matchingResponses.map((res) => res.model.name).join(' | '),
        }),
        status: responseDeclaration.status,
      });
    }

    this.log('Response declaration: ', responseDeclaration);

    if (!responseDeclaration) {
      console.error('UNEXPECTED RESPONSE: ', response);
      throw new Error('Unexpected response without declaration ');
    }

    responseDeclaration.model.validate((response as any).data);

    return response;
  }
}
