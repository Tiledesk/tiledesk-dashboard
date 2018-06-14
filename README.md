
# Tiledesk-dashboard


## Features

- Angular 5.0
- Firebase Auth
- Firebase Database CRUD (Firestore & Realtime DB)
- MongoDB CRUD

## Prerequisite

For Firebase Auth and Firebase Database: create an account at https://firebase.google.com/
For MongoDB CRUD: install and running tiledesk-api-nodejs (https://github.com/Tiledesk/tiledesk-api-nodejs)

- `git clone https://github.com/Tiledesk/tiledesk-dashboard.git`
- `cd tiledesk-dashboard`
- `npm install`

Edit the environment.ts file and create the enviroment.prod.ts in `src/environments/`.

#### environment.ts
```typescript
export const environment = {
    production: false,
    firebaseConfig: {
        apiKey: 'APIKEY',
        authDomain: 'PROJECT-ID.firebaseapp.com',
        databaseURL: 'https://PROJECT-ID.firebaseio.com',
        projectId: 'PROJECT-ID',
        storageBucket: 'PROJECT-ID.appspot.com',
        messagingSenderId: '123456789'
    },
    mongoDbConfig: {
        BASE_URL: 'http://localhost:3000/',
        PROJECTS_BASE_URL: 'http://localhost:3000/projects/',
        SIGNUP_BASE_URL: 'http://localhost:3000/auth/signup',
        SIGNIN_BASE_URL: 'http://localhost:3000/auth/signin',
    },
};
```
#### environment.prod.ts
```typescript
export const environment = {
    production: true,
    firebaseConfig: {
        // same as above, or use a different firebase project to isolate environments
    },
     mongoDbConfig: {
        // same as above
    },
};
```

And finally `ng serve`

# Build 
Run `ng build --prod --base-href /dashboard/`

# Deploy on AWS CloudFront and AWS S3

```
aws s3 sync ./dist/ s3://tiledesk-dashboard/dashboard
```

```
aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*
```
