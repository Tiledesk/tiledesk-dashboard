import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { UsersService } from './users.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
// Define a type for the emitted value
interface UpdatePermissionStatus {
  role: string;
  matchedPermissions: string[];
}

@Injectable({
  providedIn: 'root'
})



export class RolesService {
  // private updateRequestPermission$ = new BehaviorSubject<boolean>(true); // ✅ default is true

  // Define a type for the emitted value


  // private updateRequestPermission$ = new BehaviorSubject<UpdatePermissionStatus>({
  //   allowed: true,
  //   matchedPermissions: []
  // });

  private updateRequestPermission$ = new BehaviorSubject<UpdatePermissionStatus>({
    role: '',
    matchedPermissions: []
  });


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

  // listenToProjectUserPermissions(unsubscribe$: Observable<void>) {
  //   this.usersService.projectUser_bs
  //     .pipe(
  //       takeUntil(unsubscribe$),
  //       filter(projectUser => !!projectUser)
  //     )
  //     .subscribe((projectUser) => {
  //       const rolePermissions: string[] = projectUser.rolePermissions || [];
  //       const userRole = projectUser.role;

  //       this.updateRequestPermission$.next({
  //         role: userRole,
  //         matchedPermissions: rolePermissions
  //       });
  //     });
  // }

  // listenToProjectUserPermissions(unsubscribe$: Observable<void>) {
  //   this.usersService.projectUser_bs
  //     .pipe(
  //       takeUntil(unsubscribe$),
  //       filter((projectUser) => !!projectUser && !!projectUser.role) // role must exist
  //     )
  //     .subscribe((projectUser) => {
  //       const rolePermissions: string[] = projectUser.rolePermissions || [];
  //       const userRole = projectUser.role;

  //       this.updateRequestPermission$.next({
  //         role: userRole,
  //         matchedPermissions: rolePermissions
  //       });
  //     });
  // }

// listenToProjectUserPermissions(unsubscribe$: Observable<void>) {
//   this.usersService.projectUser_bs
//     .pipe(
//       takeUntil(unsubscribe$),
//       skipWhile((projectUser) =>
//         !projectUser ||
//         typeof projectUser !== 'object' ||
//         !projectUser.role ||
//         !Array.isArray(projectUser.rolePermissions) ||
//         projectUser.rolePermissions.length === 0
//       )
//     )
//     .subscribe((projectUser) => {
//       const rolePermissions: string[] = projectUser.rolePermissions;
//       const userRole = projectUser.role;

//       this.updateRequestPermission$.next({
//         role: userRole,
//         matchedPermissions: rolePermissions
//       });
//     });
// }

listenToProjectUserPermissions(unsubscribe$: Observable<void>) {
  this.usersService.projectUser_bs
    .pipe(
      takeUntil(unsubscribe$),
      filter((projectUser) =>
        projectUser &&
        typeof projectUser === 'object' &&
        projectUser.role // ✅ Filter out null/undefined/invalid values
      )
    )
    .subscribe((projectUser) => {
      // Additional safety check as a defensive measure
      if (!projectUser || typeof projectUser !== 'object' || !projectUser.role) {
        this.logger.log('[ROLES-SERV] - listenToProjectUserPermissions - Invalid projectUser, skipping');
        return;
      }

      const rolePermissions: string[] = Array.isArray(projectUser.rolePermissions)
        ? projectUser.rolePermissions
        : [];

      const userRole = projectUser.role;

      this.updateRequestPermission$.next({
        role: userRole,
        matchedPermissions: rolePermissions
      });
    });
}

  getUpdateRequestPermission(): Observable<UpdatePermissionStatus> {
    return this.updateRequestPermission$.asObservable();
  }

  // Reset permissions when project changes to prevent stale permission data
  resetPermissions() {
    this.updateRequestPermission$.next({
      role: '',
      matchedPermissions: []
    });
    this.logger.log('[ROLES-SERV] - Reset permissions BehaviorSubject');
  }

  //  listenToProjectUserPermissions(unsubscribe$: Observable<void>) {
  //   this.usersService.projectUser_bs
  //     .pipe(
  //       takeUntil(unsubscribe$),
  //       filter(projectUser => !!projectUser)
  //     )
  //     .subscribe((projectUser) => {
  //       console.log('[ROLES-SERV]  projectUser', projectUser)
  //       console.log('[ROLES-SERV]  projectUser > rolePermissions', projectUser.rolePermissions)
  //       // ✅ Skip checking for these roles
  //       if (['owner', 'admin', 'agent'].includes(projectUser.role)) {
  //         this.updateRequestPermission$.next(true);
  //         return;
  //       }

  //       // 🔍 For custom roles, check the permissions array
  //       const hasPermission = Array.isArray(projectUser.rolePermissions)
  //         && projectUser.rolePermissions.includes('request_update');

  //       this.updateRequestPermission$.next(hasPermission);
  //     });
  // }

  //  getUpdateRequestPermission(): Observable<boolean> {
  //   return this.updateRequestPermission$.asObservable();
  // }

  //   listenToProjectUserPermissions(unsubscribe$: Observable<void>) {
  //   this.usersService.projectUser_bs
  //     .pipe(
  //       takeUntil(unsubscribe$),
  //       filter(projectUser => !!projectUser)
  //     )
  //     .subscribe((projectUser) => {
  //       console.log('[ROLES-SERV]  projectUser', projectUser);
  //       console.log('[ROLES-SERV]  rolePermissions', projectUser.rolePermissions);

  //       if (['owner', 'admin', 'agent'].includes(projectUser.role)) {
  //         this.updateRequestPermission$.next({
  //           allowed: true,
  //           matchedPermissions: ['owner_or_admin_or_agent']
  //         });
  //         return;
  //       }

  //       const requiredPermissions = ['request_update', 'lead_update', 'kb_update', 'flows_update'];

  //       const matchedPermissions = requiredPermissions.filter(perm =>
  //         projectUser.rolePermissions?.includes(perm)
  //       );

  //       this.updateRequestPermission$.next({
  //         allowed: matchedPermissions.length > 0,
  //         matchedPermissions
  //       });
  //     });
  // }

  // getUpdateRequestPermission(): Observable<UpdatePermissionStatus> {
  //   return this.updateRequestPermission$.asObservable();
  // }

  // listenToProjectUserPermissions(unsubscribe$: Observable<void>) {
  //   this.usersService.projectUser_bs
  //     .pipe(
  //       takeUntil(unsubscribe$),
  //       filter(projectUser => !!projectUser)
  //     )
  //     .subscribe((projectUser) => {
  //       console.log('[ROLES-SERV] projectUser', projectUser);
  //       console.log('[ROLES-SERV] rolePermissions', projectUser.rolePermissions);

  //       // ✅ Skip check for system roles
  //       if (['owner', 'admin', 'agent'].includes(projectUser.role)) {
  //         this.updateRequestPermission$.next({
  //           allowed: true,
  //           matchedPermissions: ['owner_or_admin_or_agent'] // you can replace this with all permissions if needed
  //         });
  //         return;
  //       }

  //       // 🔍 Define which permissions are needed
  //       const requiredPermissions = [
  //         'request_update',
  //         'lead_update',
  //         'kb_update',
  //         'flows_update'
  //         // Add more as needed
  //       ];

  //       const matchedPermissions = requiredPermissions.filter(perm =>
  //         projectUser.rolePermissions?.includes(perm)
  //       );

  //       const allowed = matchedPermissions.length > 0;

  //       this.updateRequestPermission$.next({
  //         allowed,
  //         matchedPermissions
  //       });
  //     });
  // }

  // getUpdateRequestPermission(): Observable<UpdatePermissionStatus> {
  //   return this.updateRequestPermission$.asObservable();
  // }

  // listenToProjectUserPermissions(unsubscribe$: Observable<void>) {
  //   this.usersService.projectUser_bs
  //     .pipe(
  //       takeUntil(unsubscribe$),
  //       filter(projectUser => !!projectUser)
  //     )
  //     .subscribe((projectUser) => {
  //       const rolePermissions: string[] = projectUser.rolePermissions || [];
  //       const systemRoles = ['owner', 'admin', 'agent'];

  //       // ✅ System roles always allowed, but return actual permissions
  //       if (systemRoles.includes(projectUser.role)) {
  //         this.updateRequestPermission$.next({
  //           allowed: true,
  //           matchedPermissions: rolePermissions
  //         });
  //         return;
  //       }

  //       // 🔍 For custom roles, return the full permissions list (if not empty)
  //       const allowed = rolePermissions.length > 0;

  //       this.updateRequestPermission$.next({
  //         allowed,
  //         matchedPermissions: rolePermissions
  //       });
  //     });
  // }



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
