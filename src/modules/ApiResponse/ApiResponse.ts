import Model from '../Model/Model';
import { HttpStatus } from '../../constants/HttpStatus';

/**
 * Describes a possible response for the resource.
 */
export class ApiResponse<M extends Model = any, S extends HttpStatus = any> {
  model!: M;
  status!: S;
  constructor(options: { model: M; status: S }) {
    Object.assign(this, options);
  }
}
