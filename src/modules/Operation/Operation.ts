import { HttpMethod } from '../../constants/httpMethod';
import { ApiResponse } from '../ApiResponse/ApiResponse';
import Model from '../Model/Model';

export class Operation<
  O extends Record<string, any> = any,
  P extends Model = any,
  R extends ApiResponse = any,
  M extends HttpMethod = HttpMethod.GET
> {
  url!: (url: URL, options: O) => URL;
  method!: M;
  payload!: P;
  responses!: R[];
  options?: O;
  payloadConstructor?: (options: O) => P;
  constructor(options: Operation<O, P, R, M>) {
    Object.assign(this, options);
  }
}
