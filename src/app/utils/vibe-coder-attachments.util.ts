/** Limits and MIME allow-list for Home vibe-coder attachments (aligned with CDS vibe coder). */

export const VIBE_CODER_MAX_ATTACHMENTS = 5;
export const VIBE_CODER_MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file
export const VIBE_CODER_UPLOAD_RETENTION_SEC = 3600;

/** MIME types the CDS vibe coder accepts. */
export const VIBE_CODER_ALLOWED_MIME_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
];

const EXT_TO_MIME: { [ext: string]: string } = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.csv': 'text/csv',
};

/** `accept` attribute for the hidden file input. */
export const VIBE_CODER_FILE_ACCEPT = Object.keys(EXT_TO_MIME).join(',');

export function resolveVibeCoderMimeType(file: File): string {
  const raw = (file?.type || '').trim().toLowerCase();
  if (raw === 'image/jpg') {
    return 'image/jpeg';
  }
  if (VIBE_CODER_ALLOWED_MIME_TYPES.indexOf(raw) !== -1) {
    return raw;
  }
  const name = (file?.name || '').toLowerCase();
  const dot = name.lastIndexOf('.');
  if (dot < 0) {
    return raw;
  }
  return EXT_TO_MIME[name.slice(dot)] || raw;
}

export function isVibeCoderMimeAllowed(mime: string): boolean {
  return VIBE_CODER_ALLOWED_MIME_TYPES.indexOf((mime || '').toLowerCase()) !== -1;
}

/** Short label for the chip meta line (e.g. PDF, PNG). */
export function vibeCoderFileTypeLabel(mime: string, fileName?: string): string {
  const type = (mime || '').toLowerCase();
  if (type === 'application/pdf') return 'PDF';
  if (type === 'image/png') return 'PNG';
  if (type === 'image/jpeg') return 'JPEG';
  if (type === 'image/webp') return 'WEBP';
  if (type === 'text/plain') return 'TXT';
  if (type === 'text/markdown') return 'MD';
  if (type === 'text/csv') return 'CSV';
  const name = (fileName || '').toLowerCase();
  const dot = name.lastIndexOf('.');
  if (dot >= 0) {
    return name.slice(dot + 1).toUpperCase();
  }
  return 'FILE';
}

export function isVibeCoderImageMime(mime: string): boolean {
  const type = (mime || '').toLowerCase();
  return type === 'image/png' || type === 'image/jpeg' || type === 'image/webp';
}
