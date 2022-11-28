// export const environment = {
//   production: true,
//   t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:F-ANA:F-ACT:F-TRI:F-GRO:F-DEP:F-OPH:F-MTL:F-DGF:F-NAT:F-CAR:F-V1L:F-PSA:F',
//   VERSION: require('../../package.json').version,
//   widgetUrl: 'https://widget.tiledesk.com/v3/launch.js',
//   botcredendialsURL:'CHANGEIT',
//   remoteConfig: true,
  
//   remoteConfigUrl: './dashboard-pre-config.json',
//   // remoteConfigUrl: './dashboard-mqtt.json',
//   SERVER_BASE_URL:'https://tiledesk-server-pre.herokuapp.com/',
//   CHAT_BASE_URL: 'https://support-pre.tiledesk.com/chat/',
//   testsiteBaseUrl: 'https://widget-pre.tiledesk.com/v2/assets/test_widget_page/index.html',
//   wsUrl: 'wss://tiledesk-server-pre.herokuapp.com/',
//   chatEngine: 'mqtt',
//   firebaseAuth: false,
//   uploadEngine: 'native',
//   pushEngine: 'none',
//   logLevel: 'Info',
//   firebase: {
//       apiKey: 'CHANGEIT',
//       authDomain: 'CHANGEIT',
//       databaseURL: 'CHANGEIT',
//       projectId: 'CHANGEIT',
//       storageBucket: 'CHANGEIT',
//       messagingSenderId: 'CHANGEIT',
//       appId: 'CHANGEIT'
//   }
// };


export const environment = {
  production: false,
  t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-IPS:T-ETK:T-RAS:T-PPB:T-PET:T-MTS:T-TIL:T-DGF:T-NAT:F',
  VERSION: require('../../package.json').version,
  widgetUrl: 'https://widget-pre.tiledesk.com/v5/launch.js',
  botcredendialsURL: "https://tiledesk-server-pre.herokuapp.com/modules/dialogflow/botcredendials/", //'https://tiledesk-df-connector-pre.herokuapp.com/botcredendials/', //'https://dialogflow-proxy-tiledesk.herokuapp.com/botcredendials/',
  rasaBotCredentialsURL: "https://tiledesk-server-pre.herokuapp.com/modules/rasa/botcredendials/", // "https://tiledesk-rasa-connector-pre.herokuapp.com/botcredendials/",
  remoteConfig: false, 
  SERVER_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/',
  CHAT_BASE_URL: '/chat-ionic5/', //'https://support-pre.tiledesk.com/chat-ionic5/' // https://support-pre.tiledesk.com/chat-ionic5-notifcation-item// 
  testsiteBaseUrl: 'https://widget-pre.tiledesk.com/v5/assets/twp/index.html',
  wsUrl: 'wss://tiledesk-server-pre.herokuapp.com/',
  globalRemoteJSSrc:"https://support-pre.tiledesk.com/script/custom_script.js, https://support-pre.tiledesk.com/script/dnpc.js",
  firebaseAuth: false,
  uploadEngine: 'firebase',
  pushEngine: 'firebase',
  chatEngine: 'firebase',
  logLevel: 'info',
  firebase: {
      apiKey: "AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4",
      authDomain: "chat21-pre-01.firebaseapp.com",
      databaseURL: "https://chat21-pre-01.firebaseio.com",
      projectId: "chat21-pre-01",
      storageBucket: "chat21-pre-01.appspot.com",
      messagingSenderId: "269505353043",
      appId: "1:269505353043:web:b82af070572669e3707da6",
      vapidKey: "BOsgS2ADwspKdWAmiFDZXEYqY1HSYADVfJT3j67wsySh3NxaViJqoabPJH8WM02wb5r8cQIm5TgM0UK047Z1D1c"
  },
};
