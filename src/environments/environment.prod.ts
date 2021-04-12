
export const environment = {
    production: true,
    t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:F-ANA:F-ACT:F-TRI:F-GRO:F-DEP:F-OPH:F-MTL:F-DGF:F-NAT:F-CAR:F-V1L:F-PSA:F',
    VERSION: require('../../package.json').version,
    widgetUrl: 'https://widget.tiledesk.com/v4/launch.js',
    botcredendialsURL: 'CHANGE-IT',
    remoteConfig: true, 
    remoteConfigUrl: './dashboard-config.json',
    SERVER_BASE_URL: 'https://api.tiledesk.com/v2/',
    CHAT_BASE_URL: '../chat/',
    testsiteBaseUrl: 'https://api.tiledesk.com/v2/widgets/test/load',
    wsUrl: 'wss://eu.rtm.tiledesk.com/v2/ws/',
    chatEngine: 'mqtt',
    firebase: {
        apiKey: "CHANGE-IT",
        authDomain: "CHANGE-IT",
        databaseURL: "CHANGE-IT",
        projectId: "CHANGE-IT",
        storageBucket: "CHANGE-IT",
        messagingSenderId: "CHANGE-IT",
        appId: 'CHANGEIT'
    },
};
