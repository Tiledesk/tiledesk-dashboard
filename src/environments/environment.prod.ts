
// env prod


// const serverUrl = 'https://api.tiledesk.com/v2/';
export const environment = {
    production: true,
    t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:F-MTT:T-SUP:T-LBS:T-APP:T',
    VERSION: require('../../package.json').version,
    // widgetUrl: 'https://api.tiledesk.com/v2/widgets/load', // this for moment doesn't works
    widgetUrl: 'https://widget.tiledesk.com/v4/launch.js',
    //widgetUrl: 'https://widget.tiledesk.com/v3/launch.js', // this was already commented
    // botcredendialsURL: 'https://dialogflow-proxy-tiledesk.herokuapp.com/botcredendials/',
    botcredendialsURL: 'https://tiledesk-df-connector-prod.herokuapp.com/botcredendials/',
    remoteConfig: true, // for performance don't load settings from remote
    remoteConfigUrl: './dashboard-prod-config.json',
    SERVER_BASE_URL: 'https://api.tiledesk.com/v2/',
    CHAT_BASE_URL: '../chat/',
    // testsiteBaseUrl: 'https://widget.tiledesk.com/v4/assets/twp/index.html',
    testsiteBaseUrl: 'https://api.tiledesk.com/v2/widgets/test/load',
    // wsUrl: 'wss://tiledesk-server-v2-prod.herokuapp.com/',
    // wsUrl: 'ws://104.198.139.15/',
    // wsUrl: ' wss://k8scluster1.tiledesk.com/',
    // wsUrl: ' wss://rtm.tiledesk.com/v2/ws/',
    wsUrl: 'wss://eu.rtm.tiledesk.com/v2/ws/',
    globalRemoteJSSrc:'https://console.tiledesk.com/v2/dashboard/scripts/script.js',
    firebase: {
        // apiKey: 'AIzaSyDWMsqHBKmWVT7mWiSqBfRpS5U8YwTl7H0',
        // authDomain: 'chat-v2-dev.firebaseapp.com',
        // databaseURL: 'https://chat-v2-dev.firebaseio.com',
        // projectId: 'chat-v2-dev',
        // storageBucket: 'chat-v2-dev.appspot.com',
        // messagingSenderId: '77360455507',
        apiKey: "AIzaSyDKfdKrlD7AYcbQ-U-xxgV-b3FUQ4xt7NM",
        authDomain: "tiledesk-prod-v2.firebaseapp.com",
        databaseURL: "https://tiledesk-prod-v2.firebaseio.com",
        projectId: "tiledesk-prod-v2",
        storageBucket: "tiledesk-prod-v2.appspot.com",
        messagingSenderId: "92907897826",
        chat21ApiUrl: 'https://us-central1-tiledesk-prod-v2.cloudfunctions.net'
    },
    // mongoDbConfig: {
        // BASE_URL: `${serverUrl}`,
        // UPDATE_USER_LASTNAME_FIRSTNAME: `${serverUrl}users/updateuser/`, // old
        // PROJECTS_BASE_URL: `${serverUrl}projects/`, // moved
        // SIGNUP_BASE_URL: `${serverUrl}auth/signup`, // moved
        // SIGNIN_BASE_URL: `${serverUrl}auth/signin`, // moved
        // FIREBASE_SIGNIN_BASE_URL: `${serverUrl}firebase/auth/signin`, // deprecated
        // VERIFY_EMAIL_BASE_URL: `${serverUrl}auth/verifyemail/`, // moved
        // REQUEST_RESET_PSW: `${serverUrl}auth/requestresetpsw`, // moved
        // RESET_PSW: `${serverUrl}auth/resetpsw/`, // moved
        // CHECK_PSW_RESET_KEY: `${serverUrl}auth/checkpswresetkey/`, // moved
        // UPDATE_USER_LASTNAME_FIRSTNAME: `${serverUrl}users/`, // moved
        // CHANGE_PSW: `${serverUrl}users/changepsw/`, // moved
        // RESEND_VERIFY_EMAIL: `${serverUrl}users/resendverifyemail/`, // moved


    // },
    // chat: {
    //     CHAT_BASE_URL: './chat/',
    // },
    // testsite: {
    //     // testsiteBaseUrl: 'https://s3.eu-west-1.amazonaws.com/tiledesk-widget/dev/3.0.26-DEV/assets/test_widget_page/index.html'
    //     testsiteBaseUrl: 'https://widget.tiledesk.com/v4/assets/twp/index.html'
    //     //testsiteBaseUrl: 'https://widget-pre.tiledesk.com/v2/assets/test_widget_page/index.html'

    // },
    // websocket: {
    //     wsUrl: 'wss://api.tiledesk.com/v2/?token='
    // }
};






// const serverUrl = 'https://api.tiledesk.com/v1/';
// export const environment = {
//     production: true,
//     t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:F-ANA:F-ACT:F-TRI:F-GRO:F-DEP:F-OPH:F-MTL:F-DGF:F',
//     VERSION: require('../../package.json').version,
//     widgetUrl: 'https://widget.tiledesk.com/v3/launch.js',
//     remoteConfig: false, // for performance don't load settings from remote
//     firebase: {
//         apiKey: 'CHANGEIT',
//         authDomain: 'CHANGEIT',
//         databaseURL: 'CHANGEIT',
//         projectId: 'CHANGEIT',
//         storageBucket: 'CHANGEIT',
//         messagingSenderId: 'CHANGEIT'
//     },
//     mongoDbConfig: {
//         BASE_URL: `${serverUrl}`,
//         PROJECTS_BASE_URL: `${serverUrl}projects/`,
//         SIGNUP_BASE_URL: `${serverUrl}auth/signup`,
//         SIGNIN_BASE_URL: `${serverUrl}auth/signin`,
//         FIREBASE_SIGNIN_BASE_URL: `${serverUrl}firebase/auth/signin`,
//         VERIFY_EMAIL_BASE_URL: `${serverUrl}auth/verifyemail/`,
//         REQUEST_RESET_PSW: `${serverUrl}auth/requestresetpsw`,
//         RESET_PSW: `${serverUrl}auth/resetpsw/`,
//         CHECK_PSW_RESET_KEY: `${serverUrl}auth/checkpswresetkey/`,
//         UPDATE_USER_LASTNAME_FIRSTNAME: `${serverUrl}users/updateuser/`,
//         CHANGE_PSW: `${serverUrl}users/changepsw/`,
//         RESEND_VERIFY_EMAIL: `${serverUrl}users/resendverifyemail/`,
//     },
//     chat: {
//         CHAT_BASE_URL: 'https://support.tiledesk.com/chat/',
//     },
//     testsite: {
//         testsiteBaseUrl: 'https://widget.tiledesk.com/v3/assets/twp/index.html'
//     },
//     websocket: {
//         wsUrl: 'wss://tiledesk-server-pre.herokuapp.com?token='
//     }
// };

