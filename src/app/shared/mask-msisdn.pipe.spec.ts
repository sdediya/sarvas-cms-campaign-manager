import { MaskMsisdnPipe } from './mask-msisdn.pipe';

describe('MaskMsisdnPipe', () => {
  it('create an instance', () => {
    const pipe = new MaskMsisdnPipe();
    expect(pipe).toBeTruthy();
  });
});
