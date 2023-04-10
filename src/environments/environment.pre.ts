
// export const environment = {
//   production: true,
//   t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-RAS:T',
//   VERSION: require('../../package.json').version,
//   widgetUrl: 'https://widget.tiledesk.com/v3/launch.js',
//   botcredendialsURL:'CHANGEIT',
//   remoteConfig: true,
//   SERVER_BASE_URL:'https://tiledesk-server-pre.herokuapp.com/',
//   CHAT_BASE_URL: 'https://support-pre.tiledesk.com/chat/',
//   testsiteBaseUrl: 'https://widget-pre.tiledesk.com/v2/assets/test_widget_page/index.html',
//   wsUrl: 'wss://tiledesk-server-pre.herokuapp.com/',
//   chatEngine: 'mqtt',
//   firebaseAuth: false,
//   uploadEngine: 'native',
//   baseImageUrl: 'CHANGEIT',
//   pushEngine: 'none',
//   logLevel: 'Info',
//   templatesUrl: 'CHANGEIT',
//   appsUrl: 'CHANGEIT',
//   promoBannerUrl: 'CHANGEIT',
//   chatStoragePrefix: "CHANGEIT",
//   firebase: {
//       apiKey: 'CHANGEIT',
//       authDomain: 'CHANGEIT',
//       databaseURL: 'CHANGEIT',
//       projectId: 'CHANGEIT',
//       storageBucket: 'CHANGEIT',
//       messagingSenderId: 'CHANGEIT',
//       appId: 'CHANGEIT',
//       vapidKey: 'CHANGEIT'
//   }
// };

export const environment = {
  production: false,
  t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-IPS:T-ETK:T-RAS:T-PPB:T-PET:T-MTS:T-TIL:T-DGF:T-NAT:F-HPB:T-TOW:T',
  VERSION: require('../../package.json').version,
  widgetUrl: 'https://widget-pre.tiledesk.com/v5/launch.js',
  botcredendialsURL: 'https://tiledesk-df-connector-pre.herokuapp.com/botcredendials/', //'https://dialogflow-proxy-tiledesk.herokuapp.com/botcredendials/',
  rasaBotCredentialsURL: "https://tiledesk-server-pre.herokuapp.com/modules/rasa/botcredendials/", // "https://tiledesk-rasa-connector-pre.herokuapp.com/botcredendials/",
  remoteConfig: false, 
  SERVER_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/',
  CHAT_BASE_URL: '/chat-ionic5/', //'https://support-pre.tiledesk.com/chat-ionic5/' // https://support-pre.tiledesk.com/chat-ionic5-notifcation-item// 
  testsiteBaseUrl: 'https://widget-pre.tiledesk.com/v5/assets/twp/index.html',
  wsUrl: 'wss://tiledesk-server-pre.herokuapp.com/',
  globalRemoteJSSrc:"https://support-pre.tiledesk.com/script/custom_script.js, https://support-pre.tiledesk.com/script/dnpc.js",
  firebaseAuth: false,
  uploadEngine: 'firebase',
  baseImageUrl: 'https://tiledesk-server-pre.herokuapp.com/',
  pushEngine: 'firebase',
  chatEngine: 'firebase',
  logLevel: 'info',
  communityTemplatesUrl: 'https://chatbot-templates-v2-pre.herokuapp.com/chatbots/public/community',
  templatesUrl: "https://chatbot-templates-v2-pre.herokuapp.com/chatbots/public/templates", //  "https://chatbot-templates.herokuapp.com/chatbots/public/templates/",
  appsUrl: "https://tiledesk-apps-server2.giovannitroisi3.repl.co/", //"https://tiledesk-apps-server-test.giovannitroisi3.repl.co/", // "https://tiledesk-apps-server.giovannitroisi3.repl.co/",// "https://tiledesk-apps.herokuapp.com/",
  // promoBannerUrl: "https://dashbordpromobanner.nicolan74.repl.co/get/dashboard_promo.json", 
  chatStoragePrefix: "chat_sv5",
  tiledeskPhoneNumber: "390836308794",
  ticketingEmail: "tickets.tiledesk.com",
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









