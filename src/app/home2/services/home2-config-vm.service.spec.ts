import { Home2ConfigVmService, parsePublicKeyFlags } from './home2-config-vm.service';

describe('Home2ConfigVmService', () => {
  it('parsePublicKeyFlags() should return all false when missing', () => {
    expect(parsePublicKeyFlags(undefined)).toEqual({
      isVisiblePay: false,
      isVisibleANA: false,
      isVisibleAPP: false,
      isVisibleOPH: false,
      isVisibleHomeBanner: false,
      projectPlanBadge: false,
      isVisibleKNB: false,
      isVisibleQuoteSection: false
    });
  });

  it('parsePublicKeyFlags() should enable when value is not F', () => {
    const flags = parsePublicKeyFlags('PAY:T-ANA:F-APP:T-OPH:X-HPB:T-PPB:F-KNB:T-QIN:F');
    expect(flags.isVisiblePay).toBe(true);
    expect(flags.isVisibleANA).toBe(false);
    expect(flags.isVisibleAPP).toBe(true);
    expect(flags.isVisibleOPH).toBe(true);
    expect(flags.isVisibleHomeBanner).toBe(true);
    expect(flags.projectPlanBadge).toBe(false);
    expect(flags.isVisibleKNB).toBe(true);
    expect(flags.isVisibleQuoteSection).toBe(false);
  });

  it('parsePublicKeyFlags() should ignore whitespace and be case-insensitive', () => {
    const flags = parsePublicKeyFlags(' pay : t -  ana : f - qin : T ');
    expect(flags.isVisiblePay).toBe(true);
    expect(flags.isVisibleANA).toBe(false);
    expect(flags.isVisibleQuoteSection).toBe(true);
  });

  it('parsePublicKeyFlags() should treat missing value as enabled (backward compatible)', () => {
    const flags = parsePublicKeyFlags('PAY-ANA:F');
    expect(flags.isVisiblePay).toBe(true);
    expect(flags.isVisibleANA).toBe(false);
  });

  it('getConfigVm() should map config fields (smoke)', () => {
    const svc = new Home2ConfigVmService({
      getConfig: () => ({
        CHAT_BASE_URL: 'https://chat.example.com',
        t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T',
        promoBannerUrl: 'https://promo.example.com'
      })
    } as any);

    const vm = svc.getConfigVm();
    expect(vm.chatBaseUrl).toBe('https://chat.example.com');
    expect(vm.publicKey).toBe('PAY:T');
    expect(vm.promoBannerUrl).toBe('https://promo.example.com');
    expect(vm.promoBannerVisible).toBe(true);
  });
});

