// tslint:disable:max-line-length
const nodeBasePath = 'https://tiledesk-server-pre.herokuapp.com/';
const cloudFunctionBasePath = 'https://us-central1-chat21-pre-01.cloudfunctions.net/';
export const environment = {
    production: true,
    VERSION: require('../../package.json').version,
    firebaseConfig: {
        apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4',
        authDomain: 'chat21-pre-01.firebaseapp.com',
        databaseURL: 'https://chat21-pre-01.firebaseio.com',
        projectId: 'chat21-pre-01',
        storageBucket: 'chat21-pre-01.appspot.com',
        messagingSenderId: '269505353043'
    },
    mongoDbConfig: {
        BASE_URL: `${nodeBasePath}`,
        PROJECTS_BASE_URL: `${nodeBasePath}projects/`,
        SIGNUP_BASE_URL: `${nodeBasePath}auth/signup`,
        SIGNIN_BASE_URL: `${nodeBasePath}auth/signin`,
        FIREBASE_SIGNIN_BASE_URL: `${nodeBasePath}firebase/auth/signin`,
        VERIFY_EMAIL_BASE_URL: `${nodeBasePath}auth/verifyemail/`,
        REQUEST_RESET_PSW: `${nodeBasePath}auth/requestresetpsw`,
        RESET_PSW: `${nodeBasePath}auth/resetpsw/`,
        CHECK_PSW_RESET_KEY: `${nodeBasePath}auth/checkpswresetkey/`,
        UPDATE_USER_LASTNAME_FIRSTNAME: `${nodeBasePath}users/updateuser/`,
        CHANGE_PSW: `${nodeBasePath}users/changepsw/`,
        RESEND_VERIFY_EMAIL: `${nodeBasePath}users/resendverifyemail/`,
    },
    cloudFunctions: {
        // https://us-central1-chat21-pre-01.cloudfunctions.net/
        cloud_func_close_support_group_base_url: `${cloudFunctionBasePath}supportapi/tilechat/groups/`,  // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/
        cloud_functions_base_url: `${cloudFunctionBasePath}api/tilechat/groups/`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/,
        cloud_func_create_contact_url: `${cloudFunctionBasePath}api/tilechat/contacts`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts
        cloud_func_update_firstname_and_lastname: `${cloudFunctionBasePath}api/tilechat/contacts/me`, // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me
    },
    chat: {
        CHAT_BASE_URL: 'https://support-pre.tiledesk.com/chat/',
    }
};
