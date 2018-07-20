// tslint:disable:max-line-length
export const environment = {
    production: true,
    firebaseConfig: {
        apiKey: 'AIzaSyDWMsqHBKmWVT7mWiSqBfRpS5U8YwTl7H0',
        authDomain: 'chat-v2-dev.firebaseapp.com',
        databaseURL: 'https://chat-v2-dev.firebaseio.com',
        projectId: 'chat-v2-dev',
        storageBucket: 'chat-v2-dev.appspot.com',
        messagingSenderId: '77360455507',
        timestampsInSnapshots: true,
    },
    mongoDbConfig: {
        // BASE_URL: 'http://api.chat21.org/',
        // PROJECTS_BASE_URL: 'http://api.chat21.org/projects/',
        // SIGNUP_BASE_URL: 'http://api.chat21.org/auth/signup',
        // SIGNIN_BASE_URL: 'http://api.chat21.org/auth/signin',
        // FIREBASE_SIGNIN_BASE_URL: 'http://api.chat21.org/firebase/auth/signin',

        // NEW IS HTTPS -- REPLACE https://chat21-api-nodejs.herokuapp.com/ WITH https://api.tiledesk.com/v1
        // ********* SEE BELOW *********
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

        /* NEW IS HTTPS & https://api.tiledesk.com/v1 */
        BASE_URL: 'https://api.tiledesk.com/v1/',
        PROJECTS_BASE_URL: 'https://api.tiledesk.com/v1/projects/',
        SIGNUP_BASE_URL: 'https://api.tiledesk.com/v1/auth/signup',
        SIGNIN_BASE_URL: 'https://api.tiledesk.com/v1/auth/signin',
        FIREBASE_SIGNIN_BASE_URL: 'https://api.tiledesk.com/v1/firebase/auth/signin',
        VERIFY_EMAIL_BASE_URL: 'https://api.tiledesk.com/v1/auth/verifyemail/',
        REQUEST_RESET_PSW: 'https://api.tiledesk.com/v1/auth/requestresetpsw',
        RESET_PSW: 'https://api.tiledesk.com/v1/auth/resetpsw/',
        CHECK_PSW_RESET_KEY: 'https://api.tiledesk.com/v1/auth/checkpswresetkey/',
        UPDATE_USER_LASTNAME_FIRSTNAME: 'https://api.tiledesk.com/v1/users/updateuser/',
        CHANGE_PSW: 'https://api.tiledesk.com/v1/users/changepsw/',




        // DEPARTMENTS_BASE_URL: 'http://api.chat21.org/app1/departments/', // URL BUILT directly IN DEPARTMENTS SERVICE
        // FAQKB_BASE_URL: 'http://api.chat21.org/app1/faq_kb/', // URL BUILT directly IN FAQ-KB SERVICE
        // FAQ_BASE_URL: 'http://api.chat21.org/app1/faq/', // URL BUILT directly IN FAQ SERVICE
        // PROJECT_USER_BASE_URL: 'http://api.chat21.org/app1/project_users/', // NO MORE USED - THE RELATION PROJECT -> PROJECT USER IT'S DONE chat21-api-node.js

        /* EVEN IF NO MORE USED REPLACE http://api.chat21.org WITH https://api.tiledesk.com/v1 */
        // ********* SEE BELOW *********
        // CONTACTS_BASE_URL: 'http://api.chat21.org/app1/contacts/',
        // BOTS_BASE_URL: 'http://api.chat21.org/app1/bots/',
        // MONGODB_PEOPLE_BASE_URL: 'http://api.chat21.org/app1/people/',

        CONTACTS_BASE_URL: 'https://api.tiledesk.com/v1/app1/contacts/',
        BOTS_BASE_URL: 'https://api.tiledesk.com/v1/app1/bots/',
        MONGODB_PEOPLE_BASE_URL: 'https://api.tiledesk.com/v1/app1/people/',

        TOKEN: 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnt9LCJnZXR0ZXJzIjp7fSwid2FzUG9wdWxhdGVkIjpmYWxzZSwiYWN0aXZlUGF0aHMiOnsicGF0aHMiOnsicGFzc3dvcmQiOiJpbml0IiwidXNlcm5hbWUiOiJpbml0IiwiX192IjoiaW5pdCIsIl9pZCI6ImluaXQifSwic3RhdGVzIjp7Imlnbm9yZSI6e30sImRlZmF1bHQiOnt9LCJpbml0Ijp7Il9fdiI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsInVzZXJuYW1lIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH19LCJpc05ldyI6ZmFsc2UsIl9kb2MiOnsiX192IjowLCJwYXNzd29yZCI6IiQyYSQxMCQ3WDBEOFY5T1dIYnNhZi91TTcuNml1ZUdCQjFUSWpoNGRnanFUS1dPOVk3UnQ1RjBwckVoTyIsInVzZXJuYW1lIjoiYW5kcmVhIiwiX2lkIjoiNWE2YWU1MjUwNmY2MmI2MDA3YTZkYzAwIn0sImlhdCI6MTUxNjk1NTA3Nn0.MHjEJFGmqqsEhm8sglvO6Hpt2bKBYs25VvGNP6W8JbI',
    },
    cloudFunctions: {
        cloud_func_close_support_group_base_url: 'https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/',
        cloud_functions_base_url: 'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/',
        cloud_func_update_firstname_and_lastname: 'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me'
        // firebase_IdToken: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUxNmI4ZWFlNTczOTk2NGM1MWJjMTUyNWI1ZmU2ZmRjY2Y1ODJjZDQifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2hhdC12Mi1kZXYiLCJhdWQiOiJjaGF0LXYyLWRldiIsImF1dGhfdGltZSI6MTUxOTAzNTQ0NSwidXNlcl9pZCI6Ikh6eUtTWFN1empnWXExaWI2bjlFOFBNam9ZcDEiLCJzdWIiOiJIenlLU1hTdXpqZ1lxMWliNm45RThQTWpvWXAxIiwiaWF0IjoxNTE5MDY0NjQ0LCJleHAiOjE1MTkwNjgyNDQsImVtYWlsIjoibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.HUkoNGKD_7AgKHft8dOs9StrHCwDjsbdg7tYAuTccGdKFVU2Cx-AnO7ueP1OOaMZFgGMxca-H7hzQe_dVlTZogNu4iPcb-hosMQy8fWyy6LrDZF6xNgbY7As9e6cHNiLxQOPB0bjOQ2dNIIMVdEDh-hj9GJJv4He_Fc9BqZuqW7quW2w164xya1c8rR19Mg7gyDbye0MXDCY7ickGVqOyNSus_wusTRG8r2BS6YQAn5SkVI4mdnuks_vO_j_WVNlN1ld3fqud7Pha8Z73edz4aG5_kcXlGUnNjmKg4-8E1QtBg6jvcq19bTsrBEjmUuGHaBKJgywHVkqypP30YLpdQ',
    },
    chat: {
        CHAT_BASE_URL: 'https://support.tiledesk.com/chat/',
    }
};
