import { Autolinkerjs } from './autolinkerjs.pipe';

describe('Autolinkerjs', () => {
  it('create an instance', () => {
    const pipe = new Autolinkerjs();
    expect(pipe).toBeTruthy();
  });
});
