import { Model } from '../Model/Model';
import { HttpStatus } from '../../constants/HttpStatus';

/**
 * Describes a possible response for the resource.
 */
export class ApiResponse<M extends Model, S extends HttpStatus> {
  public model!: M;
  public status!: S;
  constructor(options: { model: M; status: S }) {
    Object.assign(this, options);
  }
}
