import { CleanEmailBodyPipe } from './clean-email-body.pipe';

describe('CleanEmailBodyPipe', () => {
  const pipe = new CleanEmailBodyPipe();

  it('leaves non-email channels unchanged', () => {
    const text = '-- \n\nSignature only';
    expect(pipe.transform(text, 'chat')).toBe(text);
  });

  it('keeps body that is only an RFC signature + attachments (does not blank the bubble)', () => {
    const text =
      '-- \n\n' +
      'Davide Trimarchi\n\n' +
      'Attachments:\n' +
      '[file.pdf](https://example.com/file.pdf)\n';
    const out = pipe.transform(text, 'email', 'cleaned');
    expect(out).toContain('Davide Trimarchi');
    expect(out).toContain('[file.pdf](https://example.com/file.pdf)');
  });

  it('still strips a trailing signature when there is real content before it', () => {
    const text = 'Please review.\n\n-- \n\nDavide Trimarchi\n';
    const out = pipe.transform(text, 'email', 'cleaned');
    expect(out).toBe('Please review.');
    expect(out).not.toContain('Davide Trimarchi');
  });

  it('full mode keeps the signature block', () => {
    const text = 'Please review.\n\n-- \n\nDavide Trimarchi\n';
    const out = pipe.transform(text, 'email', 'full');
    expect(out).toContain('Please review.');
    expect(out).toContain('Davide Trimarchi');
  });
});
