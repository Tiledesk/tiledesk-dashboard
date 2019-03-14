// tslint:disable:max-line-length
const serverUrl = 'https://tiledesk-server-pre.herokuapp.com/';
const serverChatUrl = 'https://us-central1-chat21-pre-01.cloudfunctions.net/';
export const environment = {
    production: true,
    VERSION: require('../../package.json').version,
    widgetUrl: 'https://widget.tiledesk.com/v2/tiledesk.js',
    firebaseConfig: {
        apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4',
        authDomain: 'chat21-pre-01.firebaseapp.com',
        databaseURL: 'https://chat21-pre-01.firebaseio.com',
        projectId: 'chat21-pre-01',
        storageBucket: 'chat21-pre-01.appspot.com',
        messagingSenderId: '269505353043'
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
        // https://us-central1-chat21-pre-01.cloudfunctions.net/
        cloud_func_close_support_group_base_url: `${serverChatUrl}supportapi/tilechat/groups/`,  // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/
        cloud_functions_base_url: `${serverChatUrl}api/tilechat/groups/`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/,
        cloud_func_create_contact_url: `${serverChatUrl}api/tilechat/contacts`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts
        cloud_func_update_firstname_and_lastname: `${serverChatUrl}api/tilechat/contacts/me`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me
    },
    chat: {
        CHAT_BASE_URL: 'https://support-pre.tiledesk.com/chat/',
    }
};


// const APP_URLS = {
//     mongoDbConfig: {
//         BASE_URL: `${environment.serverUrl}`,
//         PROJECTS_BASE_URL: `${environment.serverUrl}projects/`,
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
//     cloudFunctions: {
//         // https://us-central1-chat21-pre-01.cloudfunctions.net/
//         cloud_func_close_support_group_base_url: `${serverChatUrl}supportapi/tilechat/groups/`,  // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/
//         cloud_functions_base_url: `${serverChatUrl}api/tilechat/groups/`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/,
//         cloud_func_create_contact_url: `${serverChatUrl}api/tilechat/contacts`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts
//         cloud_func_update_firstname_and_lastname: `${serverChatUrl}api/tilechat/contacts/me`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me
//     },
//     chat: {
//         CHAT_BASE_URL: 'https://support-pre.tiledesk.com/chat/',
//     }
// };