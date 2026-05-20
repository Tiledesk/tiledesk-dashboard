
export const environment = {
  production: true,
  dashboardType: 'minimal' as 'classic' | 'minimal',
  t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:F-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-RAS:T-MON:T-CNT:T-AGN:T-FLW:F-INT:T',
  // t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-IPS:T-ETK:T-RAS:T-PPB:T-PET:T-MTS:T-TIL:T-DGF:T-NAT:T-HPB:F-TOW:T-KNB:T-BAN:T-AST:T-MON:T-CNT:T-AUT:T-WUN:T-INT:T-QIN:T-VAU:T-OVP:F', // -DPA:F no more used
  // t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-RAS:T-MON:T-CNT:T-AGN:T',
  VERSION: require('../../package.json').version,
  widgetUrl: 'http://localhost:4200/launch.js',
  botcredendialsURL: 'CHANGEIT',
  SERVER_BASE_URL: 'http://localhost:3000/',
  CHAT_BASE_URL: 'http://localhost:8080/',
  testsiteBaseUrl: 'http://localhost:4200/assets/test_widget_page/index.html',
  wsUrl: 'ws://localhost:3000/',
  chatEngine: 'mqtt',
  firebaseAuth: false,
  uploadEngine: 'native',
  baseImageUrl: 'CHANGEIT',
  pushEngine: 'none',
  logLevel: 'Info',
  templatesUrl: 'CHANGEIT',
  appsUrl: 'CHANGEIT',
  promoBannerUrl: 'CHANGEIT',
  chatStoragePrefix: "CHANGEIT",
  firebase: {
      apiKey: 'CHANGEIT',
      authDomain: 'CHANGEIT',
      databaseURL: 'CHANGEIT',
      projectId: 'CHANGEIT',
      storageBucket: 'CHANGEIT',
      messagingSenderId: 'CHANGEIT',
      appId: 'CHANGEIT',
      vapidKey: 'CHANGEIT'
  }
};


