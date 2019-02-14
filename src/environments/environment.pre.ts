// tslint:disable:max-line-length
export const environment = {
    production: true,
    firebaseConfig: {
        apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4',
        authDomain: 'chat21-pre-01.firebaseapp.com',
        databaseURL: 'https://chat21-pre-01.firebaseio.com',
        projectId: 'chat21-pre-01',
        storageBucket: 'chat21-pre-01.appspot.com',
        messagingSenderId: '269505353043'
    },
    mongoDbConfig: {
        // BASE_URL: 'http://api.chat21.org/',
        // PROJECTS_BASE_URL: 'http://api.chat21.org/projects/',
        // SIGNUP_BASE_URL: 'http://api.chat21.org/auth/signup',
        // SIGNIN_BASE_URL: 'http://api.chat21.org/auth/signin',
        // FIREBASE_SIGNIN_BASE_URL: 'http://api.chat21.org/firebase/auth/signin',

        /**
         *  NEW IS HTTPS -- !!! NO MORE USED
         *  The url https://chat21-api-nodejs.herokuapp.com/ HAS BEEN REPLACED
         *  WITH https://api.tiledesk.com/v1 ********* SEE BELOW *********
         */
        // BASE_URL: 'https://chat21-api-nodejs.herokuapp.com/',
        // PROJECTS_BASE_URL: 'https://chat21-api-nodejs.herokuapp.com/projects/',
        // SIGNUP_BASE_URL: 'https://chat21-api-nodejs.herokuapp.com/auth/signup',
        // SIGNIN_BASE_URL: 'https://chat21-api-nodejs.herokuapp.com/auth/signin',
        // FIREBASE_SIGNIN_BASE_URL: 'https://chat21-api-nodejs.herokuapp.com/firebase/auth/signin',
        // VERIFY_EMAIL_BASE_URL: 'https://chat21-api-nodejs.herokuapp.com/auth/verifyemail/',
        // PSW_RESET_REQUEST: 'https://chat21-api-nodejs.herokuapp.com/auth/requestresetpsw',
        // RESET_PSW: 'https://chat21-api-nodejs.herokuapp.com/auth/resetpsw',
        // CHECK_PSW_RESET_KEY: 'https://chat21-api-nodejs.herokuapp.com/auth/checkpswresetkey/',
        // UPDATE_USER_LASTNAME_FIRSTNAME: 'https://chat21-api-nodejs.herokuapp.com/users/updateuser/',
        // CHANGE_PSW: 'https://chat21-api-nodejs.herokuapp.com/users/changepsw/',

        /**
         *  NEW IS HTTPS & https://api.tiledesk.com/v1
         */
       
        BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/',
        PROJECTS_BASE_URL: ' https://tiledesk-server-pre.herokuapp.com/projects/',
        SIGNUP_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/auth/signup',
        SIGNIN_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/auth/signin',
        FIREBASE_SIGNIN_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/firebase/auth/signin',
        VERIFY_EMAIL_BASE_URL: 'https://tiledesk-server-pre.herokuapp.com/auth/verifyemail/',
        REQUEST_RESET_PSW: 'https://tiledesk-server-pre.herokuapp.com/auth/requestresetpsw',
        RESET_PSW: 'https://tiledesk-server-pre.herokuapp.com/auth/resetpsw/',
        CHECK_PSW_RESET_KEY: 'https://tiledesk-server-pre.herokuapp.com/auth/checkpswresetkey/',
        UPDATE_USER_LASTNAME_FIRSTNAME: 'https://tiledesk-server-pre.herokuapp.com/users/updateuser/',
        CHANGE_PSW: 'https://tiledesk-server-pre.herokuapp.com/users/changepsw/',
        RESEND_VERIFY_EMAIL: 'https://tiledesk-server-pre.herokuapp.com/users/resendverifyemail/',



        // DEPARTMENTS_BASE_URL: 'http://api.chat21.org/app1/departments/', // URL BUILT directly IN DEPARTMENTS SERVICE
        // FAQKB_BASE_URL: 'http://api.chat21.org/app1/faq_kb/', // URL BUILT directly IN FAQ-KB SERVICE
        // FAQ_BASE_URL: 'http://api.chat21.org/app1/faq/', // URL BUILT directly IN FAQ SERVICE
        // PROJECT_USER_BASE_URL: 'http://api.chat21.org/app1/project_users/', // NO MORE USED - THE RELATION PROJECT -> PROJECT USER IT'S DONE chat21-api-node.js

        /* EVEN IF NO MORE USED REPLACE http://api.chat21.org WITH https://api.tiledesk.com/v1 */
        // ********* SEE BELOW *********
        CONTACTS_BASE_URL: 'http://api.chat21.org/app1/contacts/',
        BOTS_BASE_URL: 'http://api.chat21.org/app1/bots/',
        MONGODB_PEOPLE_BASE_URL: 'http://api.chat21.org/app1/people/',

         },
    cloudFunctions: {
        // https://us-central1-chat21-pre-01.cloudfunctions.net/
        cloud_func_close_support_group_base_url: 'https://us-central1-chat21-pre-01.cloudfunctions.net/supportapi/tilechat/groups/',  // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/
        cloud_functions_base_url: 'https://us-central1-chat21-pre-01.cloudfunctions.net/api/tilechat/groups/', // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/,
        cloud_func_create_contact_url: 'https://us-central1-chat21-pre-01.cloudfunctions.net/api/tilechat/contacts', // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts
        cloud_func_update_firstname_and_lastname: 'https://us-central1-chat21-pre-01.cloudfunctions.net/api/tilechat/contacts/me', // old address: https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me

        // firebase_IdToken: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUxNmI4ZWFlNTczOTk2NGM1MWJjMTUyNWI1ZmU2ZmRjY2Y1ODJjZDQifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2hhdC12Mi1kZXYiLCJhdWQiOiJjaGF0LXYyLWRldiIsImF1dGhfdGltZSI6MTUxOTAzNTQ0NSwidXNlcl9pZCI6Ikh6eUtTWFN1empnWXExaWI2bjlFOFBNam9ZcDEiLCJzdWIiOiJIenlLU1hTdXpqZ1lxMWliNm45RThQTWpvWXAxIiwiaWF0IjoxNTE5MDY0NjQ0LCJleHAiOjE1MTkwNjgyNDQsImVtYWlsIjoibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.HUkoNGKD_7AgKHft8dOs9StrHCwDjsbdg7tYAuTccGdKFVU2Cx-AnO7ueP1OOaMZFgGMxca-H7hzQe_dVlTZogNu4iPcb-hosMQy8fWyy6LrDZF6xNgbY7As9e6cHNiLxQOPB0bjOQ2dNIIMVdEDh-hj9GJJv4He_Fc9BqZuqW7quW2w164xya1c8rR19Mg7gyDbye0MXDCY7ickGVqOyNSus_wusTRG8r2BS6YQAn5SkVI4mdnuks_vO_j_WVNlN1ld3fqud7Pha8Z73edz4aG5_kcXlGUnNjmKg4-8E1QtBg6jvcq19bTsrBEjmUuGHaBKJgywHVkqypP30YLpdQ',
    },
    chat: {
        CHAT_BASE_URL: 'https://support-pre.tiledesk.com/chat/',
    }
};
