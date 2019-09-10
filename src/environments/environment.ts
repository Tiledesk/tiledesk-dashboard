// tslint:disable:max-line-length
/**
 * ***  Note: create firebase-data.ts in the src folder and and edit it with your Firebase project configuration ***
 */
import { firebase } from '../firebase-data';

/* PRE CONFIG */
// import { firebase_pre } from '../firebase-data';


const serverUrl = 'http://localhost:3000/';
const serverChatUrl = 'https://api.tiledesk.com/v1/chat/';

/* PRE CONFIG */
// const serverUrl = 'https://tiledesk-server-pre.herokuapp.com/';
// const serverChatUrl = 'https://us-central1-chat21-pre-01.cloudfunctions.net/';

export const environment = {
    production: false,
    VERSION: require('../../package.json').version,
    widgetUrl: 'https://widget.tiledesk.com/v3/launch.js',
    firebaseConfig: {
        apiKey: firebase.apiKey,
        authDomain: firebase.authDomain,
        databaseURL: firebase.databaseURL,
        projectId: firebase.projectId,
        storageBucket: firebase.storageBucket,
        messagingSenderId: firebase.messagingSenderId,

        /* PRE CONFIG */
        // apiKey: firebase_pre.apiKey,
        // authDomain: firebase_pre.authDomain,
        // databaseURL: firebase_pre.databaseURL,
        // projectId: firebase_pre.projectId,
        // storageBucket: firebase_pre.storageBucket,
        // messagingSenderId: firebase_pre.messagingSenderId
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

        /* PRE CONFIG */
        // BASE_URL: `${serverUrl}`,
        // PROJECTS_BASE_URL: `${serverUrl}projects/`,
        // SIGNUP_BASE_URL: `${serverUrl}auth/signup`,
        // SIGNIN_BASE_URL: `${serverUrl}auth/signin`,
        // FIREBASE_SIGNIN_BASE_URL: `${serverUrl}firebase/auth/signin`,
        // VERIFY_EMAIL_BASE_URL: `${serverUrl}auth/verifyemail/`,
        // REQUEST_RESET_PSW: `${serverUrl}auth/requestresetpsw`,
        // RESET_PSW: `${serverUrl}auth/resetpsw/`,
        // CHECK_PSW_RESET_KEY: `${serverUrl}auth/checkpswresetkey/`,
        // UPDATE_USER_LASTNAME_FIRSTNAME: `${serverUrl}users/updateuser/`,
        // CHANGE_PSW: `${serverUrl}users/changepsw/`,
        // RESEND_VERIFY_EMAIL: `${serverUrl}users/resendverifyemail/`,
    },
    cloudFunctions: {
        cloud_func_close_support_group_base_url: `${serverChatUrl}support/tilechat/groups/`,  // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/
        cloud_functions_base_url: `${serverChatUrl}tilechat/groups/`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/,
        cloud_func_create_contact_url: `${serverChatUrl}tilechat/contacts`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts
        cloud_func_update_firstname_and_lastname: `${serverChatUrl}tilechat/contacts/me`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me

        /* PRE CONFIG */
        // cloud_func_close_support_group_base_url: `${serverChatUrl}supportapi/tilechat/groups/`,  // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/
        // cloud_functions_base_url: `${serverChatUrl}api/tilechat/groups/`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/,
        // cloud_func_create_contact_url: `${serverChatUrl}api/tilechat/contacts`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts
        // cloud_func_update_firstname_and_lastname: `${serverChatUrl}api/tilechat/contacts/me`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me
    },
    chat: {
        // CHAT_BASE_URL: 'http://localhost/chat/',
        CHAT_BASE_URL: 'https://support-pre.tiledesk.com/chat/',
    }
};
