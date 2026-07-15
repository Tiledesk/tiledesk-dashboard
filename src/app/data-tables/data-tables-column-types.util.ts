import { ColumnType } from 'app/models/data-tables.model';

export interface DataTableColumnTypeOption {
  label: string;
  value: ColumnType;
  disabled?: boolean;
}

export const DATA_TABLE_COLUMN_TYPE_OPTIONS: DataTableColumnTypeOption[] = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'datetime', value: 'datetime' },
];

export function isoToDatetimeLocal(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Partial numeric input while typing (e.g. "-", "12.", "12,"). */
export const NUMBER_INPUT_DRAFT_PATTERN = /^-?\d*([.,]\d*)?$/;

export function isValidNumberInputDraft(value: string): boolean {
  if (!NUMBER_INPUT_DRAFT_PATTERN.test(value)) {
    return false;
  }
  return !(value.includes('.') && value.includes(','));
}

export function normalizeNumberDecimalSeparator(value: string): string {
  return value.replace(',', '.');
}

function isIncompleteNumberDraft(value: string): boolean {
  return value === '-'
    || value === '.' || value === ','
    || value === '-.' || value === '-,'
    || value.endsWith('.') || value.endsWith(',');
}

export function formatNumberCellDisplay(value: unknown, editing = false): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  if (typeof value === 'string' && isValidNumberInputDraft(value)) {
    if (editing) {
      return value.includes('.') ? value.replace('.', ',') : value;
    }
    if (!isIncompleteNumberDraft(value)) {
      const num = Number(normalizeNumberDecimalSeparator(value));
      if (!Number.isNaN(num)) {
        return String(num);
      }
    }
    return value;
  }
  const num = typeof value === 'number'
    ? value
    : Number(normalizeNumberDecimalSeparator(String(value)));
  if (Number.isNaN(num)) {
    return String(value);
  }
  const str = String(num);
  return editing ? str.replace('.', ',') : str;
}

/** Normalize draft or saved value to a number on blur (comma → dot, discard incomplete input). */
export function finalizeNumberCellValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }
  const str = String(value).trim();
  if (str === '' || str === '-' || str === '.' || str === ',') {
    return null;
  }
  const num = Number(normalizeNumberDecimalSeparator(str));
  return Number.isNaN(num) ? null : num;
}

export function parseNumberCellValue(value: string): number | null | string {
  if (value === '') {
    return null;
  }
  if (!isValidNumberInputDraft(value)) {
    return undefined;
  }
  if (isIncompleteNumberDraft(value)) {
    return value;
  }
  const num = Number(normalizeNumberDecimalSeparator(value));
  return Number.isNaN(num) ? null : num;
}

export function datetimeLocalToIso(value: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

/** Max UTF-8 bytes per string cell (aligned with server payload limit). */
export const MAX_CELL_TEXT_BYTES = 512_000;

/** Fallback total table size when `defaultTableMaxSizeBytes` is missing or invalid (30 MB). */
export const DATA_TABLE_MAX_SIZE_FALLBACK_BYTES = 30_000_000;

export function resolveDefaultTableMaxSizeBytes(rawValue: unknown): number {
  if (rawValue == null || rawValue === '') {
    return DATA_TABLE_MAX_SIZE_FALLBACK_BYTES;
  }

  const bytes = typeof rawValue === 'number'
    ? rawValue
    : Number(String(rawValue).trim());

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return DATA_TABLE_MAX_SIZE_FALLBACK_BYTES;
  }

  return Math.round(bytes);
}

export function formatTableMaxSizeMegabytes(bytes: number): string {
  const megabytes = Math.round(bytes / 1024 / 1024);
  return `${megabytes} MB`;
}

/** Human-readable total table data size limit (aligned with server TABLE_SIZE_LIMIT_EXCEEDED). */
export function resolveDataTableMaxSizeLabel(rawValue: unknown): string {
  return formatTableMaxSizeMegabytes(resolveDefaultTableMaxSizeBytes(rawValue));
}

export function getUtf8ByteSize(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function isStringCellWithinByteLimit(
  value: unknown,
  maxBytes: number = MAX_CELL_TEXT_BYTES,
): boolean {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  return getUtf8ByteSize(String(value)) <= maxBytes;
}

function isHttpErrorResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const payload = value as Record<string, unknown>;
  return payload.status != null && payload.error != null && payload.url != null;
}

function extractApiErrorBody(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if (isHttpErrorResponse(value)) {
    const nested = (value as Record<string, unknown>).error;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nested as Record<string, unknown>;
    }
    return null;
  }

  if (isApiErrorPayload(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function readApiErrorMessage(body: Record<string, unknown> | null): string {
  if (!body) {
    return '';
  }
  return String(body.err ?? body.error ?? body.message ?? '').toLowerCase();
}

function readApiErrorCode(body: Record<string, unknown> | null): string {
  if (!body) {
    return '';
  }
  return String(body.message ?? body.err ?? body.error ?? '').toUpperCase();
}

export function isTableSizeLimitExceededError(err: unknown): boolean {
  return readApiErrorCode(extractApiErrorBody(err)) === 'TABLE_SIZE_LIMIT_EXCEEDED';
}

export function isRequestEntityTooLargeError(err: unknown): boolean {
  if (isTableSizeLimitExceededError(err)) {
    return false;
  }

  const body = extractApiErrorBody(err);
  const message = readApiErrorMessage(body);
  if (message.includes('request entity too large')) {
    return true;
  }

  return body?.err != null && body?.limit != null;
}

export function isLikelyPersistedApiErrorText(value: unknown): boolean {
  if (value == null || value === '') {
    return false;
  }

  const text = String(value).toLowerCase();
  return text.includes('entity too large')
    || (text.includes('limit') && text.includes('512000'))
    || text.includes('"err"')
    || text.includes('request entity too large');
}

export function isApiErrorPayload(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  if (isHttpErrorResponse(value)) {
    return false;
  }
  const payload = value as Record<string, unknown>;
  if (payload._id || payload.data) {
    return false;
  }
  return payload.err != null
    || payload.error != null
    || (payload.success === false && payload.message != null);
}
