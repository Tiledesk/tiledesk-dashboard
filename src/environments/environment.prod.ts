// export const environment = {
//     production: true,
//     t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:F-ANA:F-ACT:F-TRI:F-GRO:F-DEP:F-OPH:F-MTL:F-DGF:F-NAT:F-CAR:F-V1L:F-PSA:F',
//     VERSION: require('../../package.json').version,
//     widgetUrl: 'https://widget.tiledesk.com/v4/launch.js',
//     botcredendialsURL: 'CHANGE-IT',
//     remoteConfig: true, 
//     // remoteConfigUrl: './dashboard-config.json',
//     remoteConfigUrl: 'dashboard-prod-config.json',
//     SERVER_BASE_URL: 'https://api.tiledesk.com/v2/',
//     CHAT_BASE_URL: '../chat/',
//     testsiteBaseUrl: 'https://api.tiledesk.com/v2/widgets/test/load',
//     wsUrl: 'wss://eu.rtm.tiledesk.com/v2/ws/',
//     chatEngine: 'mqtt',
//     firebaseAuth: false,
//     uploadEngine: 'native',
//     pushEngine: 'none',
//     logLevel: 'Info',
//     firebase: {
//         apiKey: "CHANGE-IT",
//         authDomain: "CHANGE-IT",
//         databaseURL: "CHANGE-IT",
//         projectId: "CHANGE-IT",
//         storageBucket: "CHANGE-IT",
//         messagingSenderId: "CHANGE-IT",
//         appId: 'CHANGEIT'
//     },
// };

// ### 2.2.0
// - Updates the "Latest Updates" section on the home page (compatible with td-server 2.2.X)

// ENV PROD
// export const environment = {
//     production: true,
//     t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T"',
//     VERSION: require('../../package.json').version,
//     widgetUrl: 'https://widget.tiledesk.com/v5/launch.js',
//     botcredendialsURL: 'https://tiledesk-df-connector-prod.herokuapp.com/botcredendials/',
//     remoteConfig: false, 
//     SERVER_BASE_URL: 'https://api.tiledesk.com/v2/',
//     CHAT_BASE_URL: 'http://console.tiledesk.com/v2/chat5-dev/', 
//     testsiteBaseUrl: 'https://widget.tiledesk.com/v5/assets/twp/index.html',
//     wsUrl: 'wss://eu.rtm.tiledesk.com/v2/ws/',
//     globalRemoteJSSrc:"https://console.tiledesk.com/v2/dashboard/scripts/script.js",
//     firebaseAuth: false,
//     uploadEngine: 'firebase',
//     pushEngine: 'none',
//     chatEngine: 'firebase',
//     logLevel: 'info',
//     firebase: {
//         apiKey: "AIzaSyDKfdKrlD7AYcbQ-U-xxgV-b3FUQ4xt7NM",
//         authDomain: "tiledesk-prod-v2.firebaseapp.com",
//         databaseURL: "https://tiledesk-prod-v2.firebaseio.com",
//         projectId: "tiledesk-prod-v2",
//         storageBucket: "tiledesk-prod-v2.appspot.com",
//         messagingSenderId: "92907897826",
//         appId: "1:92907897826:web:f255664014a7cc14ee2fbb"
//vapidKey: 'BLhTl-rK33_I4Avgk40T6MR9AGtgAfwDJK_sRbyBQHzIfyztLVsvrxILP6I6KgwagQCQIx-t6lgguEsSt0vULjw'
//     },
// };

// OLD ENV PROD //  'https://console.tiledesk.com/v2/chat/3.0.62.4-rc1/index.html', "https://console.tiledesk.com/v2/chat/latest/" , https://widget.tiledesk.com/v5/latest/launch.js ,"https://console.tiledesk.com/v2/chat/3.0.67/", //
export const environment = { 
    production: true,
    t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-IPS:T-ETK:T-RAS:T-PPB:T-PET:T-MTS:T-TIL:T-DGF:T-NAT:F',
    VERSION: require('../../package.json').version,
    widgetUrl: 'https://widget.tiledesk.com/v5/launch.js',
    botcredendialsURL: 'https://tiledesk-df-connector-prod.herokuapp.com/botcredendials/',
    rasaBotCredentialsURL: "https://tiledesk-rasa-connector-prod.herokuapp.com/botcredendials/",
    remoteConfig: false,
    SERVER_BASE_URL: 'https://api.tiledesk.com/v2/',
    CHAT_BASE_URL: 'https://console.tiledesk.com/v2/chat/',  //' https://console.tiledesk.com/v2/chat5-dev/',
    testsiteBaseUrl: 'https://widget.tiledesk.com/v5/assets/twp/index.html', // 'https://widget.tiledesk.com/v5-dev/assets/twp/index.html',
    wsUrl: 'wss://eu.rtm.tiledesk.com/v2/ws/',
    globalRemoteJSSrc: "https://console.tiledesk.com/v2/dashboard/scripts/script.js, https://console.tiledesk.com/v2/dashboard/scripts/custom_script.js",
    firebaseAuth: false,
    uploadEngine: 'firebase',
    pushEngine: 'firebase',
    chatEngine: 'firebase',
    logLevel: 'Info',
    firebase: {
        apiKey: "AIzaSyDKfdKrlD7AYcbQ-U-xxgV-b3FUQ4xt7NM",
        authDomain: "tiledesk-prod-v2.firebaseapp.com",
        databaseURL: "https://tiledesk-prod-v2.firebaseio.com",
        projectId: "tiledesk-prod-v2",
        storageBucket: "tiledesk-prod-v2.appspot.com",
        messagingSenderId: "92907897826",
        appId: "1:92907897826:web:f255664014a7cc14ee2fbb",
        vapidKey: 'BLhTl-rK33_I4Avgk40T6MR9AGtgAfwDJK_sRbyBQHzIfyztLVsvrxILP6I6KgwagQCQIx-t6lgguEsSt0vULjw'
    },
};