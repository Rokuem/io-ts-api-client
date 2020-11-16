import { AxiosResponse } from 'axios';
import { HttpStatus } from '../constants/HttpStatus';

export interface ResponseWithStatus<S extends HttpStatus, D extends any>
  extends AxiosResponse<D> {
  status: S;
  data: D;
}
