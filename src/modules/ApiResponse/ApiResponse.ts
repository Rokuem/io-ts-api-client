import Model from '../Model/Model';
import { HttpStatus } from '../../constants/HttpStatus';
import { UnknownC } from 'io-ts';

/**
 * Describes a possible response for the resource.
 */
export class ApiResponse<
  M extends Model = Model<any>,
  S extends HttpStatus = any
> {
  public model!: M;
  public status!: S;
  constructor(options: { model: M; status: S }) {
    Object.assign(this, options);
  }
}
