export const environment = {
    production: true,
    t2y12PruGU9wUtEGzBJfolMIgK: 'PAY:T-ANA:T-ACT:T-TRI:T-GRO:T-DEP:T-OPH:T-MTL:T-DGF:T-NAT:T-CAR:T-V1L:T-PSA:T-MTT:T-SUP:T-LBS:T-APP:T-DEV:T-NOT:T-RAS:T',
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
    firebaseAuth: false,
    uploadEngine: 'native', 
    baseImageUrl: "CHANGEIT",
    pushEngine: 'none',
    logLevel: 'Info',
    // Editor version a new agent created from scratch is born with: it is written on the agent
    // as attributes.dsVersion and decides which Design Studio editor opens on it. Empty means
    // no version, so agents are created as before.
    chatbotVersion: '',
    templatesUrl: 'CHANGEIT',
    appsUrl: 'CHANGEIT',
    promoBannerUrl: 'CHANGEIT',
    chatStoragePrefix: "CHANGEIT",
    firebase: {
        apiKey: "CHANGE-IT",
        authDomain: "CHANGE-IT",
        databaseURL: "CHANGE-IT",
        projectId: "CHANGE-IT",
        storageBucket: "CHANGE-IT",
        messagingSenderId: "CHANGE-IT",
        appId: 'CHANGEIT',
        vapidKey: 'CHANGEIT'
    },
};

