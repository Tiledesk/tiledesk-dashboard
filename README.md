[![npm version](https://badge.fury.io/js/%40tiledesk%2Ftiledesk-dashboard.svg)](https://badge.fury.io/js/%40tiledesk%2Ftiledesk-dashboard)

# Tiledesk-dashboard

<img width="1200" alt="tiledesk-routing" src="https://user-images.githubusercontent.com/32564846/43013863-8b1ed646-8c4a-11e8-8dba-54c1a6b3c8c1.png" width="500">
<img width="1191" alt="tiledesk-hours" src="https://user-images.githubusercontent.com/32564846/43013892-a3864e4e-8c4a-11e8-97d6-1721076f1523.png" width="500">
<img width="1203" alt="tiledesk-widget" src="https://user-images.githubusercontent.com/32564846/43013900-b2fffda2-8c4a-11e8-81ca-38aaaeff6c9a.png" width="500">

Tiledesk.com backoffice application is available on GitHub with the AGPL-3.0 licence.
Follow this instructions to setup the environment.

Consider that Tiledesk.com cloud service makes every module available with the same open source licence.

- Web Widget component
- iOS Widget API (work in progress)
- full iOS App
- full Android App
- Tiledesk Dashboard (this repo)
- All the chat components are available thanks to the Chat21 open source project, also available on GitHub (https://github.com/chat21)

Feel free to ask for support on https://tiledesk.com, using the live chat widget on the the website.

## Features

- Angular 5.0
- Firebase Auth
- Firebase Database CRUD (Firestore & Realtime DB)
- MongoDB CRUD

## Prerequisite

- Install Node and NPM (https://nodejs.org/en)
- Install angular-cli v7.3.5 with `npm install -g @angular/cli@7.3.5`
- A Firebase project (https://firebase.google.com)
- tiledesk-server installed and running (https://github.com/Tiledesk/tiledesk-server.git)
                                            
## Installation

Install the latest stable release. Check on Github page the last release under the Releases tab and then run 
- `git clone https://github.com/Tiledesk/tiledesk-dashboard.git --branch <LATEST-RELEASE-VERSION>`
- `cd tiledesk-dashboard`
- `npm install`

## Dev configuration 

Configure the environment.ts file in `src/environments/`.

#### environment.ts
```typescript
const serverUrl = 'https://<YOUR_TILEDESK_SERVER>/';
export const environment = {
 ...
    production: false,
    VERSION: require('../../package.json').version,
    widgetUrl: 'https://<YOUR_CHAT21_WEB_WIDGET_URL>:4200/launch.js',
    remoteConfig: true,
    remoteConfigUrl: '/firebase-config.json',
    firebase: {
        apiKey: 'CHANGEIT',
        authDomain: 'CHANGEIT',
        databaseURL: 'CHANGEIT',
        projectId: 'CHANGEIT',
        storageBucket: 'CHANGEIT',
        messagingSenderId: 'CHANGEIT',
        chat21ApiUrl: '<YOUR_CHAT21_CLOUD_FUNCTION_FIREBASE_ENDPOINT>'
    },
    ...
    chat: {
        CHAT_BASE_URL: 'https://<YOUR_CHAT21_IONIC_URL>/chat',
    },
    testsite: {
        testsiteBaseUrl: 'https://<YOUR_CHAT21_WEB_WIDGET_URL>:4200/testi.html'
    },
    websocket: {
        wsUrl: 'ws://' + window.location.hostname + '/ws/?token='
    }
};

```
### RUN in dev

Run the app with `ng serve`

## Prod configuration 

For production installation, configure the environment.prod.ts file in `src/environments/`.

#### environment.prod.ts
```typescript
const serverUrl = 'https://api.TILEDESKSERVER/';
export const environment = {
    production: true,
    firebaseConfig: {
        // same as above, or use a different firebase project to isolate environments
    }
    ...
    chat: {
        CHAT_BASE_URL: 'https://support.YOURDOMAIN/chat/',
    },
    testsite: {
        testsiteBaseUrl: 'https://widget.YOURDOMAIN/testi.html'
    },
    websocket: {
        wsUrl: 'wss://<YOUR_TILEDESK_WS_URL>?token='
    }
},

```

# Brand

Edit the file brand.json in the folder `src/assets/brand/` to customize 
- company name, 
- logo images,
- navigation,
- contact email and more

Edit the file _variables.scss in the folder `src/assets/sass/md/` to customize the colors

# Build
 
Run `ng build --prod --base-href ./`

Copy the build files to your WebServer (Apache or Nginx)

# Deploy

## Deploy to a Web Server
Copy the content of the dist folder to your Web Server (for example Apache or Nginx)

## Deploy on AWS CloudFront and AWS S3

```
aws s3 sync ./dist/ s3://tiledesk-dashboard/dashboard
```

```
aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*
```
