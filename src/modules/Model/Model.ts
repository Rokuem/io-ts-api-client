import * as t from 'io-ts';
import reporter from 'io-ts-reporters';
import { Either, isRight } from 'fp-ts/lib/Either';
import { TypeOf } from 'io-ts';
import { TypedEmitter } from '../TypedEmitter/TypedEmmiter';
import { addedDiff } from 'deep-object-diff';

/**
 * Simple io-ts model with a validator. This is used to safeguard against API changes and to provide a easy solution for type checking it.
 *
 */
export default class Model<T extends t.Any = any> {
  /**
   * If Extra fields can fail validation.
   */
  public static strictTypes = false;

  /**
   * if validation errors should throw an exception.
   */
  public static throwErrors = false;
  /**
   * If the validation results should be logged into the console.
   */
  public static debug = false;

  /**
   * Emitter for modal events.
   */
  public static emitter = new TypedEmitter<{
    'before-validation': (model: string) => void;
    'validation-success': (model: string) => void;
    'validation-error': (model: string, error: unknown) => void;
    'after-validation': (model: string) => void;
    'extra-keys-detected': (model: string, error: string) => void;
  }>();

  /**
   * a name to call the model during logs and errors.
   */
  public name: string;

  /**
   * IO-TS interface used for the model.
   *
   * you can use tis to extend other interfaces.
   */
  public base: T;

  public constructor(config: {
    /**
     * The name of the model.
     */
    name: string;
    /**
     * The io-ts model.
     */
    model: T;
  }) {
    this.name = config.name;
    this.base = config.model;
  }

  /**
   * Checks if there are any extra keys in the response received.
   */
  private checkForExtraKeys(
    options: {
      result: Either<t.Errors, any>;
      target: any;
    } & Pick<typeof Model, 'throwErrors' | 'debug'>
  ) {
    const { result, target } = options;

    if (!('right' in result) && options.debug) {
      console.warn('Extra fields check skipped due to failed validation');
      return;
    }

    if ('props' in this.base && 'right' in result) {
      const filteredDecode = t.exact(this.base as any).decode(target);
      const resultJson = JSON.stringify(result.right);

      if (!('right' in filteredDecode)) {
        throw new Error('Something went wrong while checking for extra keys');
      }

      const filtered = filteredDecode.right;
      const filteredJson = JSON.stringify(filtered);

      if (filteredJson !== resultJson) {
        const diff = addedDiff(filtered, result.right);
        const errorMessage = `Detected extra properties in model "${this.name.toUpperCase()}": ${JSON.stringify(
          diff,
          null,
          '  '
        )}`;

        Model.emitter.emit('extra-keys-detected', this.name, errorMessage);

        if (options.throwErrors) {
          throw new Error(errorMessage);
        } else if (options.debug) {
          console.error(errorMessage);
        }
      }
    }
  }

  private handleInvalidResult(
    options: { result: Either<t.Errors, any>; target: any } & Partial<
      Pick<typeof Model, 'throwErrors' | 'debug'>
    >
  ) {
    const validationErrors = reporter.report(options.result);

    for (const error of validationErrors) {
      const validationMessage = `[${this.name.toUpperCase()}] VALIDATION FAILED: ${error} at: \n ${JSON.stringify(
        options.target,
        null,
        2
      )}`;

      Model.emitter.emit('validation-error', this.name, error);

      if ((Model.debug && options.debug !== false) || options.debug) {
        console.error(validationMessage);
      }

      if (
        (Model.throwErrors && options.throwErrors !== false) ||
        options.throwErrors
      ) {
        throw new Error(validationMessage);
      }
    }
  }

  private handleValidResult(target: any, options: Pick<typeof Model, 'debug'>) {
    if (options.debug) {
      console.log(`SUCCESS: Target is a valid "${this.name.toUpperCase()}"!`, {
        target,
      });
    }

    Model.emitter.emit('validation-success', this.name);
  }

  /**
   * Validates the model. Throws error if failed in strict mode.
   */
  public validate(
    target: any,
    options?: Pick<typeof Model, 'strictTypes' | 'throwErrors' | 'debug'>
  ) {
    Model.emitter.emit('before-validation', this.name);

    const result = this.base.decode(target);
    const isValid = isRight(result as any);
    const debug = Boolean(
      (Model.debug && options?.debug !== false) || options?.debug
    );
    const throwErrors = Boolean(
      (Model.throwErrors && options?.throwErrors !== false) ||
        options?.throwErrors
    );

    if (Model.strictTypes) {
      this.checkForExtraKeys({
        result,
        target,
        debug,
        throwErrors,
      });
    }

    if (!isValid) {
      try {
        this.handleInvalidResult({
          target,
          result,
          debug,
          throwErrors,
        });
      } catch (e) {
        Model.emitter.emit('after-validation', this.name);
        throw e;
      }
    } else {
      this.handleValidResult(target, { debug });
    }

    Model.emitter.emit('after-validation', this.name);

    return 'right' in result ? result.right : target;
  }
}

export type ModelInterface<T extends Model<any>> = TypeOf<T['base']>;
