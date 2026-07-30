
export const environment = {
  production: false,
  // Local dev: dashboard-config.json is a Docker/envsubst template full of
  // unsubstituted ${VAR} placeholders — fetching it with remoteConfig:true
  // overwrites every good default below with literal "${VAR}" strings and
  // breaks the app. Keep this false for local `ng serve`.
  remoteConfig: false,
  remoteConfigUrl: './dashboard-config.json',
  VERSION: require('../../package.json').version,
  t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-RAS:T',
  widgetUrl: 'http://localhost:4200/launch.js',
  botcredendialsURL: 'CHANGEIT',
  SERVER_BASE_URL: 'http://localhost:3001/',
  CHAT_BASE_URL: 'http://localhost:8080/',
  testsiteBaseUrl: 'http://localhost:4200/assets/test_widget_page/index.html',
  wsUrl: 'ws://localhost:3001/',
  chatEngine: 'mqtt',
  firebaseAuth: false,
  uploadEngine: 'native',
  baseImageUrl: 'CHANGEIT',
  pushEngine: 'none',
  logLevel: 'Info',
  templatesUrl: 'CHANGEIT',
  appsUrl: 'http://localhost:3000/modules/apps/',
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


