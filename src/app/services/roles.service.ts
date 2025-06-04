import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { UsersService } from './users.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})


export class RolesService {
   private updateRequestPermission$ = new BehaviorSubject<boolean>(true); // ✅ default is true
  SERVER_BASE_PATH: string;
  ROLES_URL: string;
  TOKEN: string
  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private _httpClient: HttpClient,
    private auth: AuthService,
    private usersService: UsersService

  ) {
    this.getToken();
    this.getAppBasePath();
    this.getCurrentProjectAndBuildUrl()
  }

   listenToProjectUserPermissions(unsubscribe$: Observable<void>) {
    this.usersService.projectUser_bs
      .pipe(
        takeUntil(unsubscribe$),
        filter(projectUser => !!projectUser)
      )
      .subscribe((projectUser) => {
        // ✅ Skip checking for these roles
        if (['owner', 'admin', 'agent'].includes(projectUser.role)) {
        // if (['owner', 'admin'].includes(projectUser.role)) {
          this.updateRequestPermission$.next(true);
          return;
        }

        // 🔍 For custom roles, check the permissions array
        const hasPermission = Array.isArray(projectUser.permissions)
          && projectUser.permissions.includes('request_update');

        this.updateRequestPermission$.next(hasPermission);
      });
  }

   getUpdateRequestPermission(): Observable<boolean> {
    return this.updateRequestPermission$.asObservable();
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
      }
    });
  }

  getAppBasePath() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
  }

  getCurrentProjectAndBuildUrl() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.ROLES_URL = this.SERVER_BASE_PATH + project._id + '/roles/'
      }
    })
  }
  // per creare un ruolo: curl -v -X POST -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 -d '{ "name":"role1", "permissions":["lead_create","request_read_group"]}' http://localhost:3000/68222598665ba5461066bad9/roles/
  // per aggiornare un ruolo : curl -v -X PUT -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 -d '{ "name":"role1.1", "permissions":["lead_create"]}' http://localhost:3000/68222598665ba5461066bad9/roles/682cafa3e7ee4068aebbdd51
  // per eliminare un ruolo: curl -v -X DELETE -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 http://localhost:3000/68222598665ba5461066bad9/roles/682cad3f1c674b5fc76e855c
  // per elenco ruoli : curl -v -X GET -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 http://localhost:3000/68222598665ba5461066bad9/roles/
  // ritorna un array di ruoli cosi: [{ "name":"role1", "permissions":["lead_create","request_read_group"]}, { "name":"role2", "permissions":["request_read_group"]}]
  // per dettaglio ruolo: curl -v -X GET -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 http://localhost:3000/68222598665ba5461066bad9/roles/682cad08a54f645ea74af03d

  /**
   * CREATE NEW ROLE
   * @param payload 
   * @returns 
   */
  public createNewRole(payload) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.ROLES_URL;
    console.log('[ROLES-SERV] - CREATE NEW ROLE - URL ', url);

    const body = payload;
    this.logger.log('[ROLES-SERV] - CREATE NEW ROLE - REQUEST BODY ', body);

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)
  }

  /**
   * UPDATED ROLE BY ID
   * @param payload 
   * @param roleid 
   * @returns 
   */
  public updateRole(payload, roleid) {
    let url = this.ROLES_URL + roleid;
    console.log('[ROLES-SERV] - UPDATE ROLE - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = payload;
    console.log('[ROLES-SERV] - UPDATE ROLE - BODY ', body);

    return this._httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

  /**
   * DELETE ROLE
   * @param roleid 
   * @returns 
   */
  public deleteRole(roleid: string) {

    let url = this.ROLES_URL + roleid;
    console.log('[ROLES-SERV] - DELETE ROLE - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient
      .delete(url, httpOptions)
  }

  /**
   * GET ALL ROLES
   * @returns
   */
  public getAllRoles() {

    const url = this.ROLES_URL;

    console.log('[ROLES-SERV] - GET ALL ROLES - URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient
      .get(url, httpOptions)
  }

  public getRoleById(roleid) {

    const url = this.ROLES_URL + roleid;

    console.log('[ROLES-SERV] - GET ROLES BY ID - URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient
      .get(url, httpOptions)
  }



}
