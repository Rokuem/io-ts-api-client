import { TypedEmitter } from '../TypedEmitter/TypedEmmiter';

export enum ApiClientEvent {
  /**
   * For when a received resource does not match the declared io-ts model.
   */
  VALIDATION_ERROR = 'validation-error',
}

/**
 * The apiBus is the event emitter of global API events.
 */
export const apiBus = TypedEmitter<{
  [ApiClientEvent.VALIDATION_ERROR]: never;
}>();
