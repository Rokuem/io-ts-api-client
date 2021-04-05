export interface ValidationOptions {
  /**
   * If true, the client will throw errors during validations and others.
   *
   * It is recommended to set this to true during development, but leave it disabled in the rest.
   * - During tests, you probably won't need to validate models since you will be using mocks. Typescript should be enough for that.
   * - During production, throwing validation erros might stop the app, so it is recommended to not enable this and add a listener to Model.emmiter.on('validation-error') for error reporting.
   */
  throwErrors: boolean;
  /**
   * If true, the client will log some information about what is happening.
   * - This includes success and error messages.
   *
   * It is strongly recommended to set this to true when in development since this also includes error messages with more information.
   */
  debug: boolean;
  /**
   * If this is enabled, the model will validate if the target has anything more than what was declared.
   * - If throwErrors is on, extra values will cause an exception.
   * - if debug is on, you will be informed about the extra values.
   */
  strictTypes: boolean;
}
