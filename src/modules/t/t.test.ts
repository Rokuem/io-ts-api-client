import { Model } from '../Model/Model';
import { t } from './t';

describe('t helper', () => {
  test('Should match the snapshot', () => {
    expect(t).toMatchSnapshot();
  });

  describe('t.schema', () => {
    test('Should create nullable optionals', () => {
      const model = new Model({
        name: 'testModel',
        schema: t.schema({
          optional: {
            a: t.string,
          },
          required: {
            b: t.string
          }
        }),
        samples: {
          withNull: {
            a: null,
            b: 'b'
          },
          withRequiredOnly: {
            b: 'b'
          },
          withUndefined: {
            a: undefined,
            b: 'b'
          },
          withAllValues: {
            a: 'a',
            b: 'b',
          }
        }
      });

      expect(() => model.validate({ a: null, b: 'b' }, { throwErrors: true, debug: false, strictTypes: true })).not.toThrowError();
    })
  })

  test('Should allow t.nullable', () => {
    const model = new Model({
      name: 'testModel',
      schema: t.schema({
        optional: {
          a: t.nullable(t.string),
        },
        required: {
          b: t.string
        }
      }),
      samples: {
        withNull: {
          a: null,
          b: 'b'
        },
        withRequiredOnly: {
          b: 'b'
        },
        withUndefined: {
          a: undefined,
          b: 'b'
        },
        withAllValues: {
          a: 'a',
          b: 'b',
        }
      }
    });

    expect(() => model.validate({ a: null, b: 'b' }, { throwErrors: true, debug: false, strictTypes: true })).not.toThrowError();
  })
});
