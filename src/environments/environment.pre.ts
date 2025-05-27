
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
  remoteConfig: false, 
  t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-IPS:T-ETK:T-RAS:T-PPB:T-PET:T-MTS:T-TIL:T-DGF:T-NAT:T-HPB:F-TOW:T-KNB:T-BAN:T-AST:T-MON:T-CNT:T-AUT:T-WUN:T-INT:T-DPA:T-QIN:T-VAU:T-OVP:F',
  VERSION: require('../../package.json').version,
  botcredendialsURL: 'https://tiledesk-df-connector-pre.herokuapp.com/botcredendials/', //'https://dialogflow-proxy-tiledesk.herokuapp.com/botcredendials/',
  rasaBotCredentialsURL: "https://tiledesk-server-pre.herokuapp.com/modules/rasa/botcredendials/", // "https://tiledesk-rasa-connector-pre.herokuapp.com/botcredendials/",
  WIDGET_BASE_URL: 'https://widget-pre.tiledesk.com/v5/',
  SERVER_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/',
  CHAT_BASE_URL: 'https://support-pre.tiledesk.com/chat-ionic5/', // '/chat-ionic5/', //'https://support-pre.tiledesk.com/chat-ionic5/' // https://support-pre.tiledesk.com/chat-ionic5-notifcation-item// 
  wsUrl: 'wss://tiledesk-server-pre.herokuapp.com/',
  reCaptchaSiteKey:"6Lf1khcpAAAAABMNHJfnJm43vVTxFzXM7ADqDAp5",
  globalRemoteJSSrc: "https://www.google.com/recaptcha/api.js?render=6Lf1khcpAAAAABMNHJfnJm43vVTxFzXM7ADqDAp5, https://support-pre.tiledesk.com/script/custom_script.js, https://support-pre.tiledesk.com/script/dnpc.js",
  firebaseAuth: false,
  uploadEngine: 'firebase',
  baseImageUrl: 'https://tiledesk-server-pre.herokuapp.com/',
  fileUploadAccept:"image/*,.pdf,.txt",
  pushEngine: 'firebase',
  chatEngine: 'firebase',
  logLevel: 'info',
  communityTemplatesUrl: "https://tiledesk-server-pre.herokuapp.com/modules/templates/public/community" , //'https://chatbot-templates-v2-pre.herokuapp.com/chatbots/public/community',
  templatesUrl: "https://tiledesk-server-pre.herokuapp.com/modules/templates/public/templates", //"https://chatbot-templates-v2-pre.herokuapp.com/chatbots/public/templates", //  "https://chatbot-templates.herokuapp.com/chatbots/public/templates/",
  appsUrl: "https://tiledesk-apps.glitch.me/", //"https://cd3ff4b5-5a06-44e3-aff2-3ce2ff1b848b-00-3eppvhwsi6nym.janeway.replit.dev/", //"https://tiledesk-apps-server-temp.giovannitroisi3.repl.co/", //"https://tiledesk-apps-server-temp.giovannitroisi3.repl.co/",// "https://tiledesk-apps-server2.giovannitroisi3.repl.co/", //"https://tiledesk-apps-server-test.giovannitroisi3.repl.co/", // "https://tiledesk-apps-server.giovannitroisi3.repl.co/",// "https://tiledesk-apps.herokuapp.com/",
  whatsappConfigUrl: "https://tiledesk-whatsapp-connector-dev.glitch.me/configure",
  messengerConfigUrl: "https://tiledesk-messenger-connector.glitch.me/configure",
  telegramConfigUrl: "https://tiledesk-telegram-connector-dev.glitch.me/configure",
  cdsBaseUrl: '/cds/',
  whatsappApiUrl: "https://tiledesk-whatsapp-connector-dev.glitch.me/", // "https://tiledesk-whatsapp-connector-c4ce07638b45.herokuapp.com/", //"https://tiledesk-whatsapp-connector.giovannitroisi3.repl.co/", // "https://tiledesk-whatsapp-app-pre.giovannitroisi3.repl.co",
  smsConfigUrl: "https://tiledesk-sms-connector.glitch.me/manage/configure",
  voiceTwilioConfigUrl:"https://tiledesk-voice-twilio-connector.glitch.me/manage/configure",
  voiceConfigUrl: "https://tiledesk-vxml-connector.glitch.me/manage/configure",
  // promoBannerUrl: "https://dashbordpromobanner.nicolan74.repl.co/get/dashboard_promo.json", 
  chatStoragePrefix: "chat_sv5",
  tiledeskPhoneNumber: "390836308794",
  ticketingEmail: "tickets.tiledesk.com",
  aiModels: "gpt-4.1:3;gpt-4.1-mini:0.6;gpt-4.1-nano:0.16;gpt-4o:6;gpt-4o-mini:0.3;gpt-4:25;gpt-4-turbo-preview:12;gpt-3.5-turbo:0.6", //'gpt-3.5-turbo:0.6;gpt-4:25;gpt-4-turbo-preview:12;gpt-4o:6;gpt-4o-mini:0.3', //'gpt-3.5-turbo:0.6;gpt-4:25;gpt-4-turbo-preview:12;gpt-4o:6;gpt-4o-mini:0.3;o1-preview:25;o1-mini:5',
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









