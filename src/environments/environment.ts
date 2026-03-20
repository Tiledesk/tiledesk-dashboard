
<<<<<<< HEAD
 export const environment = {
   production: false,
   remoteConfig: true,
   remoteConfigUrl: './dashboard-config.json',
   VERSION: require('../../package.json').version,
   t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-RAS:T',
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
=======
export const environment = {
  production: false,
  remoteConfig: true,
 //  remoteConfigUrl: './dashboard-config.json',
  remoteConfigUrl: './environments/real_data/dashboard-config-stage.json',
  VERSION: require('../../package.json').version,
  t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-RAS:T',
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
>>>>>>> 76881c9e4 (Enhances sidebar user details component by expanding the project dropdown to display up to 10 projects and improving hover interactions for better user experience. Updates status dropdown behavior to prevent premature closing and adds a visual indicator for dropdown positioning. Modifies SCSS to refine dropdown appearance with a new arrow indicator.)
};


