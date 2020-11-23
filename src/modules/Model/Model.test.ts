import Model from './Model';
import { t } from '../t/t';

describe('A model', () => {
  beforeEach(() => {
    Model.emitter.resetListeners();
    Model.throwErrors = false;
    Model.debug = false;
    jest.resetAllMocks();
  });

  describe('When created', () => {
    test('Should match the snapshot', () => {
      const model = new Model({
        name: 'snapshot model',
        schema: t.interface({
          key: t.literal('value'),
        }),
      });

      expect(model).toMatchSnapshot('Basic Model');
    });
  });

  describe('When validating', () => {
    test('Should emit success when the types match', () => {
      const testModelName = 'test model';
      const cb = jest.fn();
      const model = new Model({
        name: testModelName,
        schema: t.literal('value'),
      });

      Model.emitter.on('validation-success', (name) => {
        expect(name).toBe(testModelName);
        cb();
      });

      model.validate('value');

      expect(cb).toHaveBeenCalledTimes(1);
    });

    test('Should log success when the types match in debug mode', () => {
      let loggedMessage: any[] = [];
      console.log = jest.fn((...message: any[]) => {
        loggedMessage = message;
      });

      Model.debug = true;

      const modelName = 'success message test model';

      const model = new Model({
        name: modelName,
        schema: t.interface({
          foo: t.literal('bar'),
        }),
      });

      const target = {
        foo: 'bar',
      };

      model.validate(target);

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(loggedMessage).toEqual(
        expect.arrayContaining([
          expect.stringContaining(modelName.toUpperCase()),
        ])
      );

      expect(loggedMessage).toMatchSnapshot('Validation Success Message');
    });

    test('Should log error when the types do not match in debug mode', () => {
      let loggedMessage: any[] = [];
      console.error = jest.fn((...message: any[]) => {
        loggedMessage = message;
      });

      Model.debug = true;

      const modelName = 'error message test model';

      const model = new Model({
        name: modelName,
        schema: t.interface({
          foo: t.literal('bar'),
        }),
      });

      model.validate({
        foo: 'bob',
      });

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(loggedMessage).toMatchSnapshot('Validation Error Message');
      expect(loggedMessage).toEqual(
        expect.arrayContaining([
          expect.stringContaining(modelName.toUpperCase()),
        ])
      );
    });

    test('Should emit error when the types do not match', () => {
      const testModelName = 'test model';
      const cb = jest.fn();
      const model = new Model({
        name: testModelName,
        schema: t.interface({
          foo: t.literal('bar'),
        }),
      });
      Model.emitter.on('validation-error', (name, error) => {
        expect(name).toBe(testModelName);
        expect(error).toMatchSnapshot('Error message');
        cb();
      });

      model.validate({
        foo: 'bob',
      });

      expect(cb).toHaveBeenCalledTimes(1);
    });

    test('Should throw error when the types do not match in strict mode', () => {
      Model.throwErrors = true;
      const modelName = 'throw error test model';
      const key = 'foo';
      const wrongValue = 'bob';
      const correctValue = 'bar';

      const model = new Model({
        name: modelName,
        schema: t.interface({
          [key]: t.literal(correctValue),
        }),
      });

      expect(() => {
        try {
          model.validate({
            [key]: wrongValue,
          });
        } catch (error) {
          expect(error.message.includes(modelName)).toBe(true);
          expect(error.message.includes(wrongValue)).toBe(true);
          expect(error.message.includes(correctValue)).toBe(true);
          expect(error.message.includes(key)).toBe(true);
        }
      }).toThrow();
    });
  });
});
