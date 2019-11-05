// tslint:disable:max-line-length
/**
 * ***  Note: create firebase-data.ts in the src folder and and edit it with your Firebase project configuration ***
 */
// import { firebase } from '../firebase-data';

// const nodeBasePath = 'http://localhost:3000/';
// const cloudFunctionBasePath = 'https://api.tiledesk.com/v1/chat/';

const serverUrl = '/api/';
//last ok const serverUrl = 'http://localhost:3000/';

// const serverChatUrl = 'https://api.tiledesk.com/v1/chat/';
export const environment = {
    t2y12PruGU9wUtEGzBJfolMIgK: 'uTdBCRvGAEhJ01cT3uBLg8oFJx',
    production: false,
    VERSION: require('../../package.json').version,
    widgetUrl: 'http://localhost:4200/launch.js',
    remoteConfig: true,
    remoteConfigUrl: '/firebase-config.json',
    firebase: {
        apiKey: 'CHANGEIT',
        authDomain: 'CHANGEIT',
        databaseURL: 'CHANGEIT',
        projectId: 'CHANGEIT',
        storageBucket: 'CHANGEIT',
        messagingSenderId: 'CHANGEIT',
        chat21ApiUrl: 'CHANGEIT'
        // apiKey: firebase.apiKey,
        // authDomain: firebase.authDomain,
        // databaseURL: firebase.databaseURL,
        // projectId: firebase.projectId,
        // storageBucket: firebase.storageBucket,
        // messagingSenderId: firebase.messagingSenderId,

    },
    mongoDbConfig: {
        BASE_URL: `${serverUrl}`,
        PROJECTS_BASE_URL: `${serverUrl}projects/`,
        SIGNUP_BASE_URL: `${serverUrl}auth/signup`,
        SIGNIN_BASE_URL: `${serverUrl}auth/signin`,
        FIREBASE_SIGNIN_BASE_URL: `${serverUrl}firebase/auth/signin`,
        VERIFY_EMAIL_BASE_URL: `${serverUrl}auth/verifyemail/`,
        REQUEST_RESET_PSW: `${serverUrl}auth/requestresetpsw`,
        RESET_PSW: `${serverUrl}auth/resetpsw/`,
        CHECK_PSW_RESET_KEY: `${serverUrl}auth/checkpswresetkey/`,
        UPDATE_USER_LASTNAME_FIRSTNAME: `${serverUrl}users/updateuser/`,
        CHANGE_PSW: `${serverUrl}users/changepsw/`,
        RESEND_VERIFY_EMAIL: `${serverUrl}users/resendverifyemail/`,
    },
    cloudFunctions: {
        // cloud_func_close_support_group_base_url: `${serverChatUrl}support/tilechat/groups/`,  // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/
        // cloud_functions_base_url: `${serverChatUrl}tilechat/groups/`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/,
        // cloud_func_create_contact_url: `${serverChatUrl}tilechat/contacts`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts
        // cloud_func_update_firstname_and_lastname: `${serverChatUrl}tilechat/contacts/me`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me
    },
    chat: {
        CHAT_BASE_URL: '/chat/',
        //last ok CHAT_BASE_URL: 'http://localhost/chat/',
    }
};
