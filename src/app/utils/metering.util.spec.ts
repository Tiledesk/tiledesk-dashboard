import { areCreditsExhausted, CREDITS_ERROR_CODES, CREDITS_REFUSAL_TEXTS, getCreditsErrorCode, getProjectMetering, isCreditsMetering, isCreditsRefusal } from './metering.util';

describe('metering.util', () => {
  describe('areCreditsExhausted', () => {
    const balance = { included: 10, extra: 0, extraFrozen: false, available: 10 };

    it('is false while the summary is not loaded', () => {
      expect(areCreditsExhausted(null)).toBe(false);
    });

    it('is true when no credit is available', () => {
      expect(areCreditsExhausted({ metering: 'credits', balance: { ...balance, available: 0 } } as any)).toBe(true);
      expect(areCreditsExhausted({ metering: 'credits', balance: { ...balance, available: -1 } } as any)).toBe(true);
    });

    it('is true when billing is suspended, canceled or the trial ended', () => {
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'suspended' } } as any)).toBe(true);
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'canceled' } } as any)).toBe(true);
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'trial_ended' } } as any)).toBe(true);
    });

    it('is false with credits and active or payment_failed billing', () => {
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'active' } } as any)).toBe(false);
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'payment_failed' } } as any)).toBe(false);
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'trial' } } as any)).toBe(false);
    });
  });

  describe('getProjectMetering', () => {
    it('returns credits only for metering credits', () => {
      expect(getProjectMetering({ metering: 'credits' })).toBe('credits');
    });

    it('treats quotes, a missing key and unknown values as quotes', () => {
      expect(getProjectMetering({ metering: 'quotes' })).toBe('quotes');
      expect(getProjectMetering({})).toBe('quotes');
      expect(getProjectMetering({ metering: 'other' })).toBe('quotes');
      expect(getProjectMetering(null)).toBe('quotes');
      expect(getProjectMetering(undefined)).toBe('quotes');
    });
  });

  describe('isCreditsMetering', () => {
    it('is true only for credits projects', () => {
      expect(isCreditsMetering({ metering: 'credits' })).toBe(true);
      expect(isCreditsMetering({ metering: 'quotes' })).toBe(false);
      expect(isCreditsMetering({})).toBe(false);
    });
  });

  describe('getCreditsErrorCode', () => {
    it('reads the code of a 403 credits refusal', () => {
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13010, error: 'Credits balance not sufficient' } })).toBe(13010);
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13011, message: 'Model x is not available' } })).toBe(13011);
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13012 } })).toBe(13012);
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13013 } })).toBe(13013);
    });

    it('ignores other errors', () => {
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13001 } })).toBeNull();
      expect(getCreditsErrorCode({ status: 403, error: { message: 'Requests quota exceeded' } })).toBeNull();
      expect(getCreditsErrorCode({ status: 500, error: { error_code: 13010 } })).toBeNull();
      expect(getCreditsErrorCode(null)).toBeNull();
    });
  });

  describe('isCreditsRefusal', () => {
    it('is true for every credits code', () => {
      Object.values(CREDITS_ERROR_CODES).forEach((code) => {
        expect(isCreditsRefusal({ status: 403, error: { error_code: code } })).toBe(true);
      });
    });

    it('is false for the legacy plan limit errors', () => {
      expect(isCreditsRefusal({ status: 403, error: { error: 'Maximum number of resources reached for the current plan', plan_limit: 3 } })).toBe(false);
    });

    it('is false for the raw body of a stream error (no status): the stream wraps the credits ones', () => {
      expect(isCreditsRefusal({ success: false, message: 'Credits balance not sufficient', error_code: 13010 })).toBe(false);
    });
  });

  describe('CREDITS_REFUSAL_TEXTS', () => {
    it('has a title and a text for every credits code', () => {
      Object.values(CREDITS_ERROR_CODES).forEach((code) => {
        expect(CREDITS_REFUSAL_TEXTS[code]).toBeDefined();
        expect(CREDITS_REFUSAL_TEXTS[code].title).toMatch(/^Credits\./);
        expect(CREDITS_REFUSAL_TEXTS[code].text).toMatch(/^Credits\./);
      });
    });
  });
});
