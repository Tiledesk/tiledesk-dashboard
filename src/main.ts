import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { relayMs365PopupReturn } from './app/knowledge-bases/utils/ms365-popup-return';
// https://stackoverflow.com/questions/41322566/angular-could-not-find-hammerjs
import 'hammerjs'; 

if (environment.production) {
  enableProdMode();
}

// Microsoft 365 sign-in popup coming back (ms365_popup=1): relay the result and do not boot the app in it.
if (!relayMs365PopupReturn(window)) {
  platformBrowserDynamic().bootstrapModule(AppModule);
}
