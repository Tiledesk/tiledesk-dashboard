// tslint:disable:max-line-length
const nodeBasePath = 'http://localhost:3000/';
const cloudFunctionBasePath = 'https://api.tiledesk.com/v1/chat/';
export const environment = {
    production: false,
    VERSION: require('../../package.json').version,
    firebaseConfig: {
        apiKey: 'AIzaSyDWMsqHBKmWVT7mWiSqBfRpS5U8YwTl7H0',
        authDomain: 'chat-v2-dev.firebaseapp.com',
        databaseURL: 'https://chat-v2-dev.firebaseio.com',
        projectId: 'chat-v2-dev',
        storageBucket: 'chat-v2-dev.appspot.com',
        messagingSenderId: '77360455507',
        // timestampsInSnapshots: true,
    },
    mongoDbConfig: {
        BASE_URL: `${nodeBasePath}`,
        PROJECTS_BASE_URL: `${nodeBasePath}projects/`,
        SIGNUP_BASE_URL: `${nodeBasePath}auth/signup`,
        SIGNIN_BASE_URL: `${nodeBasePath}auth/signin`,
        FIREBASE_SIGNIN_BASE_URL: `${nodeBasePath}/firebase/auth/signin`,
        VERIFY_EMAIL_BASE_URL: `${nodeBasePath}/auth/verifyemail/`,
        REQUEST_RESET_PSW: `${nodeBasePath}/auth/requestresetpsw`,
        RESET_PSW: `${nodeBasePath}/auth/resetpsw/`,
        CHECK_PSW_RESET_KEY: `${nodeBasePath}auth/checkpswresetkey/`,
        UPDATE_USER_LASTNAME_FIRSTNAME: `${nodeBasePath}users/updateuser/`,
        CHANGE_PSW: `${nodeBasePath}users/changepsw/`,
        RESEND_VERIFY_EMAIL: `${nodeBasePath}users/resendverifyemail/`,
    },
    cloudFunctions: {
        cloud_func_close_support_group_base_url: `${cloudFunctionBasePath}support/tilechat/groups/`,  // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/
        cloud_functions_base_url: `${cloudFunctionBasePath}tilechat/groups/`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/,
        cloud_func_create_contact_url: `${cloudFunctionBasePath}tilechat/contacts`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts
        cloud_func_update_firstname_and_lastname: `${cloudFunctionBasePath}tilechat/contacts/me`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me
    },
    chat: {
        CHAT_BASE_URL: 'https://support.tiledesk.com/chat/',
    }
};
