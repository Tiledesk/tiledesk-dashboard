import { mapQuotesDataToVm } from './home2-quotes-vm.service';

describe('Home2QuotesVmService', () => {
  it('mapQuotesDataToVm() should return null when projectId mismatch', () => {
    const vm = mapQuotesDataToVm({ projectId: 'p1' }, 'p2', true);
    expect(vm).toBeNull();
  });

  it('mapQuotesDataToVm() should normalize nulls and cap percentages', () => {
    const data: any = {
      projectId: 'p1',
      slot: { endDate: '2026-01-01' },
      projectLimits: { messages: 10, requests: 5, email: 2, tokens: 100, voice_duration: 60 },
      allQuotes: {
        requests: { quote: null },
        messages: { quote: 1000 },
        email: { quote: null },
        tokens: { quote: 50 },
        voice_duration: { quote: null }
      }
    };

    const vm = mapQuotesDataToVm(data, 'p1', true)!;
    expect(vm.requests_count).toBe(0);
    expect(vm.email_count).toBe(0);
    expect(vm.voice_count).toBe(0);
    expect(vm.messages_perc).toBe(100);
    expect(vm.tokens_perc).toBe(50);
    expect(vm.quotaResetEndDateLabel).toBe('2026-01-01');
  });

  it('mapQuotesDataToVm() should avoid division by zero when limits are 0', () => {
    const data: any = {
      projectId: 'p1',
      projectLimits: { messages: 0, requests: 0, email: 0, tokens: 0, voice_duration: 0 },
      allQuotes: {
        requests: { quote: 1 },
        messages: { quote: 1 },
        email: { quote: 1 },
        tokens: { quote: 1 },
        voice_duration: { quote: 1 }
      }
    };

    const vm = mapQuotesDataToVm(data, 'p1', true)!;
    expect(vm.requests_perc).toBe(0);
    expect(vm.messages_perc).toBe(0);
    expect(vm.email_perc).toBe(0);
    expect(vm.tokens_perc).toBe(0);
    expect(vm.voice_perc).toBe(0);
  });
});

