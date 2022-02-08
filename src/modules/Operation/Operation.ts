import { AxiosError } from "axios";
import { HttpMethod } from "../../constants/httpMethod";
import { ApiResponse } from "../ApiResponse/ApiResponse";
import { Model } from "../Model/Model";
import { ModelInterface } from "../Model/Model";
import { ResponseWithStatus } from "../../helpers/ResponseWithStatus.type";
import { t } from "../t/t";
import { Client } from "../Client/Client";
import { Resource } from "../Resource/Resource";
import { ValidationOptions } from "../types";

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
   * Name of the operation. Infered when the client is made.
   */
  public name = "Operation";
  /**
   * function to construct the url of the operation.
   *
   * @param url - The base URL object of the api.
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
  public headers?:
    | Record<string, string>
    | ((options?: Options) => Record<string, string>);
  /**
   * Function to mock the response. Useful for testing and for development when the API is not ready.
   */
  public mock?: (
    /**
     * Computed url returned by the Operation url option.
     */
    url?: URL,
    /**
     * Payload returned by the PayloadConstructor
     */
    payload?: ModelInterface<Payload>
  ) => Promise<
    | Partial<
        {
          [key in keyof Responses]: Responses[key] extends ApiResponse<any, any>
            ? Partial<
                ResponseWithStatus<
                  Responses[key]["status"],
                  ModelInterface<Responses[key]["model"]>
                >
              >
            : Responses[key];
        }[number]
      >
    | false
  >;
  /**
   * Function to construct the payload using the provided options for the operation.
   */
  payloadConstructor?: (options?: Options) => ModelInterface<Payload>;
  constructor(
    config: Pick<
      Operation<Payload, Responses, Method, Options>,
      | "url"
      | "method"
      | "payloadModel"
      | "payloadConstructor"
      | "responses"
      | "options"
      | "headers"
      | "mock"
    >
  ) {
    Object.assign(this, config);
  }

  public setName(name: string) {
    this.name = name;

    for (const response of this.responses) {
      if (response.model instanceof Model) {
        response.model.operation = this.name;
      }
    }

    if (this.payloadModel) {
      this.payloadModel.operation = this.name;
    }
  }

  /**
   * Executes the operation using the provided configuration.
   */
  public async execute<GlobalResponses extends ApiResponse<any, any>>({
    axiosInstance,
    options,
    base,
    globalResponses,
    debug,
    throwErrors,
    strictTypes,
    globalHeaders,
  }: {
    globalHeaders: Record<string, string>;
  } & Pick<
    Client<
      Record<string, Resource<Record<string, this>, GlobalResponses>>,
      GlobalResponses
    >,
    "base" | "globalResponses" | "axiosInstance"
  > &
    ValidationOptions &
    Pick<this, "options">) {
    const log = (...message: any[]) => {
      if (debug) {
        console.log(...message);
      }
    };

    const logError = (...message: any[]) => {
      if (debug) {
        console.error(...message);
      }
    };

    if (this.payloadConstructor) {
      const payload = this.payloadConstructor?.(options);
      log("Payload: ", payload);
      this.payloadModel?.validate(payload, {
        debug,
        throwErrors,
        strictTypes,
      });
    }

    type GetResponses<T extends [...ApiResponse<any, any>[]]> = {
      [key in keyof T]: T[key] extends ApiResponse<any, any>
        ? ResponseWithStatus<T[key]["status"], ModelInterface<T[key]["model"]>>
        : T[key];
    }[number];

    type $Response =
      | GetResponses<Responses>
      | GetResponses<[...GlobalResponses[]]>;

    const requestUrl = this.url(base as any, options as any);

    if (this.mock) {
      log("mock detected!");
      const mock = await this.mock(
        requestUrl,
        this.payloadConstructor?.(options)
      );
      log("Mock: ", mock);
      if (mock !== false) {
        return { ...mock, body: (mock as any)?.data } as $Response;
      }
    }

    try {
      log("Making axios request");
      const response = await axiosInstance.request<$Response>({
        method: this.method as any,
        data: this.payloadConstructor?.(options),
        url: requestUrl.href,
        headers: {
          ...globalHeaders,
          ...(typeof this.headers === "function"
            ? this.headers?.(options)
            : this.headers || {}),
        },
        validateStatus: (status) =>
          this.responses.some((res) => res.status === status),
      });

      if (!response) {
        throw new Error(`[${this.name}] Received empty reponse`);
      }

      const matchingResponses = [...this.responses, ...globalResponses].filter(
        (res) => res.status === response.status
      );

      log("matching Responses: ", matchingResponses.length);

      let [responseDeclaration] = matchingResponses;

      if (matchingResponses.length > 1) {
        responseDeclaration = new ApiResponse({
          model: new Model({
            schema: t.intersection([
              ...matchingResponses.map((res) => res.model.base),
            ] as any),
            name: matchingResponses.map((res) => res.model.name).join(" | "),
          }),
          status: responseDeclaration.status,
        });
      }

      if (
        !responseDeclaration ||
        !(responseDeclaration.model instanceof Model)
      ) {
        console.error(`[${this.name}] UNEXPECTED RESPONSE: `, response);
        throw new Error(
          `Unexpected response without declaration. Status: ${
            response.status
          }, data: ${JSON.stringify(response.data)}`
        );
      }

      responseDeclaration.model.operation = this.name;

      const data = responseDeclaration.model.validate((response as any).data, {
        debug,
        strictTypes,
        throwErrors,
      });

      return {
        ...response,
        data,
        body: data,
      };
    } catch (error) {
      if (typeof error === "object" && error && "response" in error) {
        const axiosError = error as AxiosError;
        logError("Unexpected response: ", axiosError.response);
        axiosError.message = `MODEL NOT FOUND - Unexpected response received from operation ${
          this.name
        }: ${axiosError.response?.status} - ${JSON.stringify(
          axiosError.response?.data
        )}`;
      }

      throw error;
    }
  }
}
