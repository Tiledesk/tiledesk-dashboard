// tslint:disable:max-line-length
export const environment = {
    production: false,
    firebaseConfig: {
        apiKey: 'AIzaSyDWMsqHBKmWVT7mWiSqBfRpS5U8YwTl7H0',
        authDomain: 'chat-v2-dev.firebaseapp.com',
        databaseURL: 'https://chat-v2-dev.firebaseio.com',
        projectId: 'chat-v2-dev',
        storageBucket: 'chat-v2-dev.appspot.com',
        messagingSenderId: '77360455507',
    },
    mongoDbConfig: {
        MONGODB_CONTACTS_BASE_URL: 'http://localhost:3000/app1/contacts/',
        MONGODB_DEPARTMENTS_BASE_URL: 'http://localhost:3000/app1/departments/',
        MONGODB_FAQ_BASE_URL: 'http://localhost:3000/app1/faq/',
        MONGODB_BOTS_BASE_URL: 'http://localhost:3000/app1/bots/',
        MONGODB_FAQKB_BASE_URL: 'http://localhost:3000/app1/faq_kb/',
        MONGODB_PROJECTS_BASE_URL: 'http://localhost:3000/app1/projects/',
        MONGODB_SIGNUP_BASE_URL: 'http://localhost:3000/auth/signup',
        MONGODB_PEOPLE_BASE_URL: 'http://localhost:3000/app1/people/',
        SIGNIN_BASE_URL: 'http://localhost:3000/auth/signin',
        TOKEN: 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnt9LCJnZXR0ZXJzIjp7fSwiX2lkIjoiNWE3MDQ0YzdjNzczNGQwZGU0ZGRlMmQ0Iiwid2FzUG9wdWxhdGVkIjpmYWxzZSwiYWN0aXZlUGF0aHMiOnsicGF0aHMiOnsicGFzc3dvcmQiOiJpbml0IiwidXNlcm5hbWUiOiJpbml0IiwiX192IjoiaW5pdCIsIl9pZCI6ImluaXQifSwic3RhdGVzIjp7Imlnbm9yZSI6e30sImRlZmF1bHQiOnt9LCJpbml0Ijp7Il9fdiI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsInVzZXJuYW1lIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJfX3YiOjAsInBhc3N3b3JkIjoiJDJhJDEwJGw3RnN1aS9FcDdONkEwTW10b1BNa2VjQnY0SzMzaFZwSlF3ckpGcHFSMVZSQ2JaUnkybHk2IiwidXNlcm5hbWUiOiJhbmRyZWEiLCJfaWQiOiI1YTcwNDRjN2M3NzM0ZDBkZTRkZGUyZDQifSwiJGluaXQiOnRydWUsImlhdCI6MTUxNzMwNzExM30.6kpeWLl_o5EgBzmzH3EGtJ_f3yhE7M9VMpx59ze_gbY',
    },
    cloudFunctions: {
        cloud_functions_base_url: 'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/',
        // firebase_IdToken: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUxNmI4ZWFlNTczOTk2NGM1MWJjMTUyNWI1ZmU2ZmRjY2Y1ODJjZDQifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2hhdC12Mi1kZXYiLCJhdWQiOiJjaGF0LXYyLWRldiIsImF1dGhfdGltZSI6MTUxOTAzNTQ0NSwidXNlcl9pZCI6Ikh6eUtTWFN1empnWXExaWI2bjlFOFBNam9ZcDEiLCJzdWIiOiJIenlLU1hTdXpqZ1lxMWliNm45RThQTWpvWXAxIiwiaWF0IjoxNTE5MDY0NjQ0LCJleHAiOjE1MTkwNjgyNDQsImVtYWlsIjoibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.HUkoNGKD_7AgKHft8dOs9StrHCwDjsbdg7tYAuTccGdKFVU2Cx-AnO7ueP1OOaMZFgGMxca-H7hzQe_dVlTZogNu4iPcb-hosMQy8fWyy6LrDZF6xNgbY7As9e6cHNiLxQOPB0bjOQ2dNIIMVdEDh-hj9GJJv4He_Fc9BqZuqW7quW2w164xya1c8rR19Mg7gyDbye0MXDCY7ickGVqOyNSus_wusTRG8r2BS6YQAn5SkVI4mdnuks_vO_j_WVNlN1ld3fqud7Pha8Z73edz4aG5_kcXlGUnNjmKg4-8E1QtBg6jvcq19bTsrBEjmUuGHaBKJgywHVkqypP30YLpdQ',
    },
};
