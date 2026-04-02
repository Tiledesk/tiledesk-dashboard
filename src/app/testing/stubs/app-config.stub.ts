/** OSCODE minimo con tutti i flag abilitati — usato come default nei test. */
export const MOCK_OSCODE = 'PAY:T-ANA:T-APP:T-OPH:T-HPB:F-PPB:F-KNB:T-QIN:T';

export const MOCK_APP_CONFIG = {
  t2y12PruGU9wUtEGzBJfolMIgK: MOCK_OSCODE,
  CHAT_BASE_URL: 'https://chat.test.local',
  SERVER_BASE_PATH: 'https://api.test.local/',
  promoBannerUrl: ''
};

export class AppConfigServiceStub {
  private oscode: string;

  constructor(oscode: string = MOCK_OSCODE) {
    this.oscode = oscode;
  }

  getConfig() {
    return { ...MOCK_APP_CONFIG, t2y12PruGU9wUtEGzBJfolMIgK: this.oscode };
  }
}
