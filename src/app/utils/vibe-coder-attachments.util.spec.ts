import {
  isVibeCoderMimeAllowed,
  resolveVibeCoderMimeType,
  vibeCoderFileTypeLabel,
  VIBE_CODER_MAX_ATTACHMENTS,
  VIBE_CODER_MAX_FILE_BYTES,
} from './vibe-coder-attachments.util';

describe('vibe-coder-attachments.util', () => {
  it('exposes the agreed limits', () => {
    expect(VIBE_CODER_MAX_ATTACHMENTS).toBe(5);
    expect(VIBE_CODER_MAX_FILE_BYTES).toBe(10 * 1024 * 1024);
  });

  it('resolves MIME from extension when the browser leaves type empty', () => {
    const file = { name: 'notes.md', type: '' } as File;
    expect(resolveVibeCoderMimeType(file)).toBe('text/markdown');
  });

  it('normalizes image/jpg to image/jpeg', () => {
    const file = { name: 'a.jpg', type: 'image/jpg' } as File;
    expect(resolveVibeCoderMimeType(file)).toBe('image/jpeg');
  });

  it('rejects unsupported MIME types', () => {
    expect(isVibeCoderMimeAllowed('application/zip')).toBe(false);
    expect(isVibeCoderMimeAllowed('application/json')).toBe(false);
    expect(isVibeCoderMimeAllowed('image/png')).toBe(true);
  });

  it('labels common types for the chip meta line', () => {
    expect(vibeCoderFileTypeLabel('application/pdf')).toBe('PDF');
    expect(vibeCoderFileTypeLabel('text/csv', 'data.csv')).toBe('CSV');
  });
});
