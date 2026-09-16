import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { LoggerService } from './logger/logger.service';
// import Keycloak, { KeycloakInstance } from 'keycloak-js';
// import * as Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloak: Keycloak;
  // private keycloak: ReturnType<typeof Keycloak>;
  constructor(private logger: LoggerService) {
    this.keycloak = new Keycloak({
      url: 'https://keycloak.stage.eks.tiledesk.com',
      realm: 'master',
      clientId: 'tiledesk'
    });
   }



   init(): Promise<boolean> {
    return this.keycloak.init({
      // onLoad: 'login-required',
      onLoad: 'check-sso',
      // silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      checkLoginIframe: true,
      checkLoginIframeInterval: 25
    }).then(authenticated => {
      if (authenticated) {
        this.logger.log('[KEYCLOAK-SERV] ✅ User authenticated');
        this.registerLogoutListener();
      } else {
        this.logger.log('[KEYCLOAK-SERV] ⚠️ User not authenticated');
      }
      return authenticated;
    }).catch(err => {
      this.logger.error('[KEYCLOAK-SERV] ❌ Keycloak initialization failed', err);
      return false;
    });
  }

  private registerLogoutListener() {
    this.keycloak.onAuthLogout = () => {
      this.logger.log('[KEYCLOAK-SERV] 🔴 Session ended or user logged out');
      // window.location.href = '/login';
    };
  }

  // logout() {
  //   this.keycloak.logout({
  //     redirectUri: window.location.origin + '/login'
  //   });
  // }

  getToken(): string | undefined {
    this.logger.log('[KEYCLOAK-SERV] getToken keycloak token ', this.keycloak.token);
    return this.keycloak.token;
  }

}
