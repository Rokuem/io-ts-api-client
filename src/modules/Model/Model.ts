import * as t from 'io-ts';
import reporter from 'io-ts-reporters';
import { isRight } from 'fp-ts/lib/Either';
import { TypeOf } from 'io-ts';
import { TypedEmitter } from '../TypedEmitter/TypedEmmiter';

/**
 * Simple io-ts model with a validator. This is used to safeguard against API changes and to provide a easy solution for type checking it.
 *
 */
export default class Model<T extends t.Any = any> {
  /**
   * When strict is equal to true. Validation errors will throw an exception.
   */
  public static strict = false;

  /**
   * If the validation results should be logged into the console.
   */
  public static debug = false;

  /**
   * Emitter for modal events.
   */
  public static emitter = new TypedEmitter<{
    'validation-success': (model: string) => void;
    'validation-error': (model: string, error: unknown) => void;
  }>();

  /**
   * @param name - The name of the model.
   * @param base - the io-ts model.
   */
  public constructor(public name: string, public base: T) {}

  /**
   * Validates the model. Throws error if failed in strict mode.
   */
  public validate(target: any) {
    const result = this.base.decode(target);
    const isValid = isRight(result as any);
    const validationErrors = reporter.report(result);

    if (!isValid) {
      for (const error of validationErrors) {
        if (Model.debug) {
          console.error(error);
        }
        if (Model.strict) {
          throw new Error(error + ' at: \n' + JSON.stringify(target, null, 2));
        }
      }
    } else if (Model.debug) {
      console.log(`${this.name} is valid!`);
    }

    return isValid;
  }
}

export type ModelInterface<T extends Model<any>> = TypeOf<T['base']>;
