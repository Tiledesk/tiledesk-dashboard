// export const environment = {
//   production: false,
//   remoteConfig: true,
//   // remoteConfigUrl: './dashboard-config.json',
//   remoteConfigUrl: './dashboard-pre-config.json',
//   // remoteConfigUrl: 'dashboard-prod-config.json',
//   // remoteConfigUrl: './dashboard-mqtt.json',
//   VERSION: require('../../package.json').version,
//   t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:F-ANA:F-ACT:F-TRI:F-GRO:F-DEP:F-OPH:F-MTL:F-DGF:F-NAT:F-CAR:F-V1L:F-PSA:F',
//   widgetUrl: 'http://localhost:4200/launch.js',
//   botcredendialsURL: 'CHANGEIT',
//   SERVER_BASE_URL: 'http://localhost:3000/',
//   CHAT_BASE_URL: 'http://localhost:8080/',
//   testsiteBaseUrl: 'http://localhost:4200/assets/test_widget_page/index.html',
//   wsUrl: 'ws://localhost:3000/',
//   chatEngine: 'mqtt',
//   firebaseAuth: false,
//   uploadEngine: 'native',
//   pushEngine: 'none',
//   logLevel: 'debug',
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

// MQTT
// export const environment = {
//   production: false,
//   remoteConfig: false,
//   VERSION: require('../../package.json').version,
//   t2y12PruGU9wUtEGzBJfolMIgK: "NAT:T-DEV:T-GRO:T-DEP:T-SUP:T",
//   widgetUrl:  "/widget/launch.js",
//   botcredendialsURL: 'https://dialogflow-proxy-tiledesk.herokuapp.com/botcredendials/',
//   SERVER_BASE_URL: "http://localhost:3000/",
//   CHAT_BASE_URL: "http://localhost:8080/",
//   testsiteBaseUrl: 'http://localhost:4200/assets/test_widget_page/index.html',
//   brandSrc: "https://tiledeskbrand.nicolan74.repl.co/mybrand",
//   wsUrl: "ws://localhost:3000/",
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


// // FOR TEST ENV PROD
// export const environment = {
//   production: true,
//   t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-RAS:T',
//   VERSION: require('../../package.json').version,
//   widgetUrl: 'https://widget.tiledesk.com/v5/launch.js',
//   botcredendialsURL: 'https://tiledesk-df-connector-prod.herokuapp.com/botcredendials/',
//   rasaBotCredentialsURL: "https://tiledesk-rasa-connector-prod.herokuapp.com/rasabot/",
//   remoteConfig: false, 
//   SERVER_BASE_URL: 'https://api.tiledesk.com/v2/',
//   CHAT_BASE_URL: 'https://console.tiledesk.com/v2/chat/',
//   testsiteBaseUrl: 'https://widget.tiledesk.com/v5/assets/twp/index.html',
//   wsUrl: 'wss://eu.rtm.tiledesk.com/v2/ws/',
//   globalRemoteJSSrc:"https://console.tiledesk.com/v2/dashboard/scripts/script.js",
//   firebaseAuth: false,
//   uploadEngine: 'firebase',
//   pushEngine: 'none',
//   chatEngine: 'firebase',
//   logLevel: 'Info',
//   firebase: {
//       apiKey: "AIzaSyDKfdKrlD7AYcbQ-U-xxgV-b3FUQ4xt7NM",
//       authDomain: "tiledesk-prod-v2.firebaseapp.com",
//       databaseURL: "https://tiledesk-prod-v2.firebaseio.com",
//       projectId: "tiledesk-prod-v2",
//       storageBucket: "tiledesk-prod-v2.appspot.com",
//       messagingSenderId: "92907897826",
//       appId: "1:92907897826:web:f255664014a7cc14ee2fbb"
//   },
// };

// // FOR TEST ENV PRE - the good one
export const environment = {
  production: false,
  t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:F-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-IPS:T-ETK:T-RAS:T-PPB:T-PET:T-MTS:T-TIL:T-DGF:T-NAT:F',
  VERSION: require('../../package.json').version,
  widgetUrl: 'https://widget-pre.tiledesk.com/v5/launch.js',
  botcredendialsURL:'https://tiledesk-df-connector-pre.herokuapp.com/botcredendials/', // 'https://dialogflow-proxy-tiledesk.herokuapp.com/botcredendials/',
  rasaBotCredentialsURL: "https://tiledesk-rasa-connector-pre.herokuapp.com/botcredendials/",
  remoteConfig: false, 
  SERVER_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/',
  CHAT_BASE_URL: 'https://support-pre.tiledesk.com/chat-ionic5/', //'http://localhost:8102/', // '/chat-ionic5/', //'https://support-pre.tiledesk.com/chat-ionic5/', //https://support-pre.tiledesk.com/chat-ionic5/#/conversation-detail
  testsiteBaseUrl: 'https://widget-pre.tiledesk.com/v5/assets/twp/index.html',
  wsUrl: 'wss://tiledesk-server-pre.herokuapp.com/',
  // globalRemoteJSSrc:"https://support-pre.tiledesk.com/script/custom_script.js",
  // globalRemoteJSSrc: 'http://localhost:4204/assets/custom_script.js',
  firebaseAuth: false,
  uploadEngine: 'firebase',
  pushEngine: 'firebase',
  chatEngine: 'firebase',
  logLevel: 'info', //'debug',
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


// OLD ENV PROD - * the good one *
// export const environment = {
//   production: true,
//   t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-IPS:T-ETK:T-RAS:T-PPB:T-PET:T-MTS:T-TIL:T-DGF:T-NAT:T',
//   VERSION: require('../../package.json').version,
//   widgetUrl: 'https://widget.tiledesk.com/v5/launch.js',
//   botcredendialsURL: 'https://tiledesk-df-connector-prod.herokuapp.com/botcredendials/',
//   rasaBotCredentialsURL: "https://tiledesk-rasa-connector-prod.herokuapp.com/botcredendials/",
//   remoteConfig: false, 
//   SERVER_BASE_URL: 'https://api.tiledesk.com/v2/',
//   CHAT_BASE_URL: 'http://localhost:8102/', // 'https://console.tiledesk.com/v2/chat5-dev/', // 'http://console.tiledesk.com/v2/chat/', 
//   testsiteBaseUrl: 'https://widget.tiledesk.com/v5/assets/twp/index.html', // 'https://widget.tiledesk.com/v5-dev/assets/twp/index.html',
//   wsUrl: 'wss://eu.rtm.tiledesk.com/v2/ws/',
//   globalRemoteJSSrc:"https://console.tiledesk.com/v2/dashboard/scripts/script.js",
//   firebaseAuth: false,
//   uploadEngine: 'firebase',
//   pushEngine: 'firebase',
//   chatEngine: 'firebase',
//   logLevel: 'info',
//   firebase: {
//       apiKey: "AIzaSyDKfdKrlD7AYcbQ-U-xxgV-b3FUQ4xt7NM",
//       authDomain: "tiledesk-prod-v2.firebaseapp.com",
//       databaseURL: "https://tiledesk-prod-v2.firebaseio.com",
//       projectId: "tiledesk-prod-v2",
//       storageBucket: "tiledesk-prod-v2.appspot.com",
//       messagingSenderId: "92907897826",
//       appId: "1:92907897826:web:f255664014a7cc14ee2fbb",
//       vapidKey: 'BLhTl-rK33_I4Avgk40T6MR9AGtgAfwDJK_sRbyBQHzIfyztLVsvrxILP6I6KgwagQCQIx-t6lgguEsSt0vULjw'
//   },
// };

