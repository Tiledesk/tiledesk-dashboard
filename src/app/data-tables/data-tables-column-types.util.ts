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
