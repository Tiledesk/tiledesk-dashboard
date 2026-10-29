import {
  finalizeTtlCellValue,
  isValidTtlSeconds,
  parseTtlCellValue,
} from './data-tables-ttl.util';

describe('data-tables-ttl.util', () => {
  describe('isValidTtlSeconds', () => {
    it('accepts positive integers', () => {
      expect(isValidTtlSeconds(1)).toBe(true);
      expect(isValidTtlSeconds(60)).toBe(true);
      expect(isValidTtlSeconds(3600)).toBe(true);
      expect(isValidTtlSeconds(86400)).toBe(true);
      expect(isValidTtlSeconds('3600')).toBe(true);
    });

    it('rejects zero, negatives, decimals, empty and non-numeric', () => {
      expect(isValidTtlSeconds(0)).toBe(false);
      expect(isValidTtlSeconds(-1)).toBe(false);
      expect(isValidTtlSeconds(1.5)).toBe(false);
      expect(isValidTtlSeconds('1.5')).toBe(false);
      expect(isValidTtlSeconds('')).toBe(false);
      expect(isValidTtlSeconds(null)).toBe(false);
      expect(isValidTtlSeconds(undefined)).toBe(false);
      expect(isValidTtlSeconds('abc')).toBe(false);
      expect(isValidTtlSeconds('60s')).toBe(false);
    });
  });

  describe('parseTtlCellValue', () => {
    it('returns integer seconds for valid input', () => {
      expect(parseTtlCellValue('3600')).toBe(3600);
      expect(parseTtlCellValue(60)).toBe(60);
    });

    it('returns null for empty and invalid', () => {
      expect(parseTtlCellValue('')).toBeNull();
      expect(parseTtlCellValue(null)).toBeNull();
      expect(parseTtlCellValue('1.5')).toBeNull();
      expect(parseTtlCellValue(0)).toBeNull();
    });
  });

  describe('finalizeTtlCellValue', () => {
    it('keeps valid integers and clears invalid', () => {
      expect(finalizeTtlCellValue(3600)).toBe(3600);
      expect(finalizeTtlCellValue('60')).toBe(60);
      expect(finalizeTtlCellValue('')).toBeNull();
      expect(finalizeTtlCellValue(0)).toBeNull();
      expect(finalizeTtlCellValue(1.2)).toBeNull();
    });

    it('does not convert seconds to milliseconds', () => {
      expect(finalizeTtlCellValue(3600)).toBe(3600);
    });
  });
});
