import { PLANS_LIST } from './util';
import { calcQuotaUsagePercent, computeAgentTokensUsage } from './quota-usage.util';

describe('quota-usage.util', () => {
  describe('PLANS_LIST agent_tokens', () => {
    it('equals tokens for every plan (mirrors server QuoteManager)', () => {
      const plans: any = PLANS_LIST;
      Object.keys(plans).forEach((plan) => {
        // @types/jasmine 2.8 lacks withContext (runtime jasmine-core 4.5 has it)
        (expect(plans[plan].agent_tokens) as any).withContext(plan).toBe(plans[plan].tokens);
      });
    });
  });

  describe('calcQuotaUsagePercent', () => {
    it('handles zero/invalid limits and tiny usage', () => {
      expect(calcQuotaUsagePercent(10, 0)).toBe(0);
      expect(calcQuotaUsagePercent(0, 100)).toBe(0);
      expect(calcQuotaUsagePercent(2, 400)).toBe(1);
      expect(calcQuotaUsagePercent(500, 100)).toBe(100);
    });
  });

  describe('computeAgentTokensUsage', () => {
    it('returns null when the server does not return agent_tokens', () => {
      expect(computeAgentTokensUsage({ tokens: { quote: 10 } }, PLANS_LIST.Pro)).toBeNull();
      expect(computeAgentTokensUsage(null, PLANS_LIST.Pro)).toBeNull();
    });

    it('computes count, limit, percent and runned-out', () => {
      expect(computeAgentTokensUsage({ agent_tokens: { quote: 2500000 } }, PLANS_LIST.Pro))
        .toEqual({ count: 2500000, limit: 5000000, perc: 50, runnedOut: false });
      expect(computeAgentTokensUsage({ agent_tokens: { quote: null } }, PLANS_LIST.Sandbox))
        .toEqual({ count: 0, limit: 100000, perc: 0, runnedOut: false });
      expect(computeAgentTokensUsage({ agent_tokens: { quote: 100000 } }, PLANS_LIST.Sandbox))
        .toEqual({ count: 100000, limit: 100000, perc: 100, runnedOut: true });
    });

    it('uses the merged per-project override', () => {
      const limits = Object.assign({}, PLANS_LIST.Pro, { agent_tokens: 1000 });
      expect(computeAgentTokensUsage({ agent_tokens: { quote: 1000 } }, limits))
        .toEqual({ count: 1000, limit: 1000, perc: 100, runnedOut: true });
    });

    it('treats a 0 override as used up (same rule as tokens: quote >= limit)', () => {
      const limits = Object.assign({}, PLANS_LIST.Pro, { agent_tokens: 0 });
      expect(computeAgentTokensUsage({ agent_tokens: { quote: 0 } }, limits))
        .toEqual({ count: 0, limit: 0, perc: 0, runnedOut: true });
      expect(computeAgentTokensUsage({ agent_tokens: { quote: 25 } }, limits))
        .toEqual({ count: 25, limit: 0, perc: 0, runnedOut: true });
    });

    it('falls back to the tokens limit when limits lack agent_tokens', () => {
      expect(computeAgentTokensUsage({ agent_tokens: { quote: 10 } }, { tokens: 1000 }).limit).toBe(1000);
    });
  });
});
