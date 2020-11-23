import { AxiosResponse } from 'axios';
import { HttpStatus } from '../constants/HttpStatus';

export interface ResponseWithStatus<S extends HttpStatus, D extends any>
  extends AxiosResponse<D> {
  /**
   * HTTP status of the response. Use this as type guard.
   */
  status: S;
  /**
   * What was returned by the server.
   */
  data: D;
  /**
   * Alias for data. Useful for avoiding repetition on JSON APIs.
   */
  body: D;
}
