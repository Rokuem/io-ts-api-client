import * as t from 'io-ts';
import reporter from 'io-ts-reporters';
import { Either, isRight } from 'fp-ts/lib/Either';
import { TypedEmitter } from '../TypedEmitter/TypedEmmiter';
import { addedDiff } from 'deep-object-diff';
import { ValidationOptions } from '../types';
import { deepMerge } from '../../helpers/deepMerge';

/**
 * Simple io-ts model with a validator. This is used to safeguard against API changes and to provide a easy solution for type checking it.
 */
export class Model<Schema extends t.Any = any, SampleKey extends string = never, Samples extends t.TypeOf<Schema> = t.TypeOf<any>> {
  /**
   * Emitter for modal events.
   */
  public static emitter = new TypedEmitter<{
    'before-validation': (model: string) => void;
    'validation-success': (model: string) => void;
    'validation-error': (model: string, error: Error) => void;
    'after-validation': (model: string) => void;
    'extra-keys-detected': (model: string, error: Error) => void;
  }>();

  /**
   * a name to call the model during logs and errors.
   */
  public name: string;

  /**
   * @deprecated - use model.schema instead.
   */
  public base: Schema;

   /**
   * IO-TS interface used for the model.
   *
   * you can use this to extend other interfaces.
   */
  public schema!: Schema;

  /**
   * Ts interface of the model.
   * 
   * !Warn: Do not use this as an value.
   * @since 0.7.4
   */
  public tsInterface!: t.TypeOf<Schema>

  public samples!: Record<SampleKey, Samples>;

  public constructor(config: {
    /**
     * The name of the model.
     */
    name: string;
    /**
     * The io-ts model.
     */
    schema: Schema;
    samples?: Record<SampleKey, Samples>;
  }) {
    this.name = config.name;
    this.base = config.schema;
    this.schema = config.schema;
    this.samples = config.samples || {} as any;
  }

  /**
   * If not an empty string, this model belongs to an operation.
   */
  public operation = '';

  /**
   * Checks if there are any extra keys in the response received.
   */
  private checkForExtraKeys(options: {
    result: Either<t.Errors, any>;
    target: any;
    debug: boolean;
    throwErrors: boolean;
  }) {
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
        const errorMessage = `${
          this.operation ? `[${this.operation}] ` : ''
        }Detected extra properties in model "${this.name}": ${JSON.stringify(
          diff,
          null,
          '  '
        )}`;

        Model.emitter.emit('extra-keys-detected', this.name, new Error(errorMessage));

        if (options.throwErrors) {
          throw new Error(errorMessage);
        } else if (options.debug) {
          console.error(errorMessage);
        }
      }

      return filtered;
    }
  }

  private handleInvalidResult(options: {
    result: Either<t.Errors, any>;
    target: any;
    throwErrors: boolean;
    debug: boolean;
  }) {
    const validationErrors = reporter.report(options.result);

    for (const error of validationErrors) {
      const validationMessage = `ERROR - ${
        this.operation ? `[${this.operation}]` : ''
      }[${this.name}] VALIDATION FAILED: ${error} at: \n ${JSON.stringify(
        options.target,
        null,
        2
      )}`;

      Model.emitter.emit('validation-error', this.name, new Error(validationMessage));

      if (options.debug) {
        console.error(validationMessage);
      }

      if (options.throwErrors) {
        throw new Error(validationMessage);
      }
    }
  }

  private handleValidResult(
    target: any,
    options: ValidationOptions
  ) {
    if (options.debug) {
      console.log(
        `SUCCESS - ${this.operation ? `[${this.operation}]` : ''}[${
          this.name
        }]: Target is valid!`,
        {
          target,
        }
      );
    }

    Model.emitter.emit('validation-success', this.name);
  }

  /**
   * Validates the model. Throws error if failed in strict mode.
   */
  public validate(
    target: any,
    options: ValidationOptions
  ) {
    Model.emitter.emit('before-validation', this.name);

    let result = this.base.decode(target);
    const isValid = isRight(result);

    if (options.strictTypes) {
      const filtered = this.checkForExtraKeys({
        result,
        target,
        debug: options.debug,
        throwErrors: options.throwErrors,
      });

      if (filtered) {
        result = {
          ...result,
          right: filtered,
        } as any;
      }
    }

    if (!isValid) {
      try {
        this.handleInvalidResult({
          target,
          result,
          debug: !!options.debug,
          throwErrors: !!options.throwErrors,
        });
      } catch (e) {
        Model.emitter.emit('after-validation', this.name);
        throw e;
      }
    } else {
      this.handleValidResult(target, options);
    }

    Model.emitter.emit('after-validation', this.name);

    return 'right' in result ? result.right : target;
  }

  /**
   * Asserts that target is valid for this model.
   */
  public assert(target: any, options?: { 
    /**
     * Fails the assertion in case the target has extra properties.
     */
    strict?: boolean;
    /**
     * Debug the validation process.
     */
    debug?: boolean;
  }): target is ModelInterface<this> {
    try {
      this.validate(target, {
        debug: !!options?.debug,
        throwErrors: true,
        strictTypes: !!options?.strict,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates an object that matches the model.
   * Useful for creating mocks.
   */
  public createSample<T extends t.TypeOf<Schema>>(sample: T) {
    return sample;
  }

  /**
   * Extend one of the declared samples in the model declaration.
   * Useful for tests.
   */
  public extendSample<T extends Partial<t.TypeOf<Schema>>, K extends SampleKey>(base: K, sample: T) {
    return deepMerge(this.samples[base], sample);
  }
}

export type ModelInterface<T extends Model<any>> = t.TypeOf<T['base']>;
