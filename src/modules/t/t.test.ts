import { t } from './t';

describe('t helper', () => {
  test('Should match the snapshot', () => {
    expect(t).toMatchSnapshot();
  });
});
