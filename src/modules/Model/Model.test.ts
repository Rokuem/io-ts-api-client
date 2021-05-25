import { Model } from './Model';
import { t } from '../t/t';
describe('A model', () => {
  test('Can have samples and use then to construct new objects', () => {
    const someModel = new Model({
      name: 'some model',
      schema: t.interface({
        foo: t.boolean,
        bar: t.boolean,
      }),
      samples: {
        basic: {
          foo: true,
          bar: true
        }
      }
    });

    const extendedSample = someModel.extendSample('basic', {
      foo: false
    });

    expect(extendedSample).toEqual({ foo: false, bar: true });

    const newSample = someModel.createSample({
      foo: false,
      bar: false,
    });

    expect(newSample).toEqual({ foo: false, bar: false });
  })
})