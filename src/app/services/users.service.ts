import { Injectable } from '@angular/core';
import { User } from '../models/user-model';
import { Activity } from '../models/activity-model';
import { PendingInvitation } from '../models/pending-invitation-model';
import { ProjectUser } from '../models/project-user';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../core/auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocalDbService } from '../services/users-local-db.service';
import { Router } from '@angular/router';
import { Project } from '../models/project-model';
import { FaqKbService } from '../services/faq-kb.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { AppConfigService } from '../services/app-config.service';
import { WebSocketJs } from "../services/websocket/websocket-js";
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { LoggerService } from '../services/logger/logger.service';
interface NewUser {
  displayName: string;
  email: string;
  time: number;
}

@Injectable()
export class UsersService {

  wsService: WebSocketJs;
  public user_is_available_bs: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public user_is_busy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public project_user_id_bs: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public project_user_role_bs: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public has_changed_availability_in_sidebar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public has_changed_availability_in_users: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public userProfileImageExist: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  // public currentUserWsAvailability$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null); // Moved to ws-requests.sercice
  // public currentUserWsIsBusy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null); // Moved to ws-requests.sercice
  public currentUserWsBusyAndAvailabilityForProject$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  public contactsEvents$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  public imageStorage$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  // public has_clicked_logoutfrom_mobile_sidebar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // public has_clicked_logoutfrom_mobile_sidebar_project_undefined: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  http: Http;

  SERVER_BASE_PATH: string;
  PROJECTS_URL: string;
  UPDATE_USER_URL: string;
  CHANGE_PSW_URL: string;
  RESEND_VERIFY_EMAIL: string;
  AVAILABLE_USERS_URL: any;
  USERS_ACTIVITIES_URL: any;
  PROJECT_USER_URL: any;
  INVITE_USER_URL: any;
  PENDING_INVITATION_URL: string;
  TOKEN: string
  user: any;
  orderBy_field: any;
  orderBy_direction: any;
  project: any;
  currentUserId: string;
  project_id: string;
  project_name: string;
  storageBucket: string;
  baseUrl: string;
  eventlist: any;
  constructor(
    http: Http,
    private auth: AuthService,
    private usersLocalDbService: LocalDbService,
    private router: Router,
    private faqKbService: FaqKbService,
    private botLocalDbService: BotLocalDbService,
    public appConfigService: AppConfigService,
    public webSocketJs: WebSocketJs,
    private logger: LoggerService
  ) {

    this.http = http;
    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    // this.logger.log('[USER-SERV] 1 User', this.user)
    this.checkUserAndVerifyIfExistProfileImage()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      // this.logger.log('[USER-SERV] 2 User', this.user)
      this.checkUserAndVerifyIfExistProfileImage()
    });

    this.getAppConfigAndBuildUrl();
    this.getCurrentProject();
  }

  getAppConfigAndBuildUrl() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.PROJECTS_URL = this.SERVER_BASE_PATH + 'projects/';
    this.UPDATE_USER_URL = this.SERVER_BASE_PATH + 'users/';
    this.CHANGE_PSW_URL = this.SERVER_BASE_PATH + 'users/changepsw/';
    this.RESEND_VERIFY_EMAIL = this.SERVER_BASE_PATH + 'users/resendverifyemail/';

    this.logger.log('[USER-SERV] - SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
    this.logger.log('[USER-SERV] - PROJECTS_URL  ', this.PROJECTS_URL);
    this.logger.log('[USER-SERV] - UPDATE_USER_URL ', this.UPDATE_USER_URL);
    this.logger.log('[USER-SERV] - CHANGE_PSW_URL ', this.CHANGE_PSW_URL);
    this.logger.log('[USER-SERV] - RESEND_VERIFY_EMAIL ', this.RESEND_VERIFY_EMAIL);
  }

  getCurrentProject() {

    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // tslint:disable-next-line:no-debugger
      // debugger
      if (this.project) {
        this.project_id = this.project._id;
        this.project_name = this.project.name;
        this.logger.log('[USER-SERV] project ID ', this.project._id);

        this.PROJECT_USER_URL = this.SERVER_BASE_PATH + this.project._id + '/project_users/';
        this.INVITE_USER_URL = this.SERVER_BASE_PATH + this.project._id + '/project_users/invite';
        this.PENDING_INVITATION_URL = this.SERVER_BASE_PATH + this.project._id + '/pendinginvitations';
        this.AVAILABLE_USERS_URL = this.PROJECTS_URL + this.project._id + '/users/availables';
        this.USERS_ACTIVITIES_URL = this.SERVER_BASE_PATH + this.project._id + '/activities';

        this.logger.log('[USER-SERV] - PROJECT_USER_URL ', this.PROJECT_USER_URL);
        this.logger.log('[USER-SERV] - INVITE_USER_URL ', this.INVITE_USER_URL);
        this.logger.log('[USER-SERV] - PENDING_INVITATION_URL ', this.PENDING_INVITATION_URL);
        this.logger.log('[USER-SERV] - AVAILABLE_USERS_URL ', this.AVAILABLE_USERS_URL);
        this.logger.log('[USER-SERV] - USERS_ACTIVITIES_URL ', this.USERS_ACTIVITIES_URL);

      }
    });
  }

  checkUserAndVerifyIfExistProfileImage() {
    if (this.user) {
      this.TOKEN = this.user.token
      this.currentUserId = this.user._id

      let imageStorage = ''
      if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
        imageStorage = this.getStorageBucket();
        this.logger.log('[USER-SERV] IMAGE STORAGE ', imageStorage, 'usecase Firebase');

      } else {
        imageStorage = this.getBaseUrl();
        this.logger.log('[USER-SERV] IMAGE STORAGE ', imageStorage, 'usecase Native');
      }

      if (imageStorage) {
        this.imageStorage$.next(imageStorage)

        this.verifyIfExistProfileImage(this.currentUserId, imageStorage);
      }

    } else {
      this.logger.log('[USER-SERV] No user is signed in');
    }
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    return this.storageBucket = firebase_conf['storageBucket'];
  }

  getBaseUrl() {
    this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
    return this.baseUrl
  }


  verifyIfExistProfileImage(user_id, imageStorage) {
    let imageUrl = ''
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      imageUrl = 'https://firebasestorage.googleapis.com/v0/b/' + imageStorage + '/o/profiles%2F' + user_id + '%2Fphoto.jpg?alt=media';
    } else {
      imageUrl = imageStorage + 'images?path=uploads%2Fusers%2F' + user_id + '%2Fimages%2Fthumbnails_200_200-photo.jpg'
    }
    const self = this;

    this.verifyImageURL(imageUrl, function (imageExists) {
      if (imageExists === true) {

        self.logger.log('[USER-SERV] - PUBLISH - USER PROFILE IMAGE EXIST? ', imageExists)
        self.userProfileImageExist.next(imageExists);
      } else {
        // alert('Image does not Exist');
        self.logger.log('[USER-SERV] - PUBLISH - USER PROFILE IMAGE EXIST? ', imageExists)
        self.userProfileImageExist.next(imageExists);
      }
    });
  }

  verifyImageURL(image_url, callBack) {
    const img = new Image();
    img.src = image_url;
    img.onload = function () {
      callBack(true);
    };
    img.onerror = function () {
      callBack(false);
    };
  }


  /**
   * GET USER ACTIVITIES
   * @param querystring 
   * @param pagenumber 
   * @returns 
   */
  public getUsersActivities(querystring: string, pagenumber: number): Observable<Activity[]> {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }

    const url = this.USERS_ACTIVITIES_URL + '?page=' + pagenumber + _querystring;

    this.logger.log('[USER-SERV] - GET USER ACTIVITIES - URL ', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * GET - DOWNLOAD ACTIVITIES CSV
   * @param querystring 
   * @param pagenumber 
   * @param language 
   * @returns 
   */
  public downloadActivitiesAsCsv(querystring: string, pagenumber: number, language: string) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }

    const url = this.USERS_ACTIVITIES_URL + '/csv' + '?page=' + pagenumber + _querystring + '&lang=' + language;
    this.logger.log('[USER-SERV] - DOWNLOAD ACTIVITIES CSV - URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/csv');
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.text());
  }

  /**
   * !!!! NOT  USED
   * Get Name Surname and id of the logged user
   */
  public getCurrentUserProfile(): Observable<User[]> {
    // const url = this.BASE_URL + 'users/' + user_id;
    const url = this.SERVER_BASE_PATH + 'users';
    // const url = this.BASE_URL + 'project_users/users/' + user_id;

    this.logger.log('[USER-SERV] - GET CURRENT USER PROFILE - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  // ---------------------------------------------------------
  // Delete user account 
  // ---------------------------------------------------------
  public deleteUserAccount() {
    const url = this.SERVER_BASE_PATH + 'users';
    this.logger.log('[USER-SERV] - DELETE USER ACCOUNT - URL ', url);
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }


  /**
   * GET PROJECT USER BY PROJECT USER ID
   * @param project_user_id 
   * @returns 
   */
  public getProjectUserByProjecUserId(project_user_id): Observable<ProjectUser[]> {

    const url = this.SERVER_BASE_PATH + this.project._id + '/project_users/' + project_user_id;;
    this.logger.log('[USER-SERV] - GET PROJECT USER BY PROJECT USER ID - URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }



  /**
   * GET PROJECT-USERS BY USER ID
   * @param user_id 
   * @returns 
   */
  public getProjectUserById(user_id): Observable<User[]> {

    const url = this.SERVER_BASE_PATH + this.project._id + '/project_users/users/' + user_id;;

    this.logger.log('[USER-SERV] - GET PROJECT-USERS BY USER ID - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  // -------------------------------------------------------------
  // GET PROJECT'S PROJECT-USERS BY PROJECT ID
  // -------------------------------------------------------------
  public getProjectUsersByProjectId(): Observable<ProjectUser[]> {
    const url = this.PROJECT_USER_URL;

    this.logger.log('[USER-SERV] - GET PROJECT USERS BY PROJECT ID - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  // -------------------------------------------------------------
  // GET VISITORS WITH ROLE GUEST & ONLINE
  // -------------------------------------------------------------
  public getProjectUsersByProjectId_GuestRole(): Observable<ProjectUser[]> {
    const url = this.PROJECT_USER_URL + '?role=guest&presencestatus=online';

    this.logger.log('[USER-SERV] - GET VISITORS WITH ROLE GUEST & ONLINE - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  // ----------------------------------------------------------------
  // TEST FUNCTION -- ALL AVAILABLE PROJECT-USER (OF CURRENT PROJECT)
  // ----------------------------------------------------------------
  public getAvailableProjectUsersByProjectId(): Observable<ProjectUser[]> {
    // const url = this.MONGODB_BASE_URL + 'availables';
    const url = this.AVAILABLE_USERS_URL;
    this.logger.log('[USER-SERV] - PROJECT USERS AVAILABLE URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  // -------------------------------------------------------------------------------------------------
  // TEST FUNCTION -- ALL AVAILABLE PROJECT-USER (OF CURRENT PROJECT) ALSO CONSIDERING OPERATING HOURS
  // -------------------------------------------------------------------------------------------------
  public getAvailableProjectUsersConsideringOperatingHours(): Observable<ProjectUser[]> {
    // const url = this.MONGODB_BASE_URL + 'availables';
    const url = this.AVAILABLE_USERS_URL;
    this.logger.log('[USER-SERV] - PROJECT USERS AVAILABLE ALSO CONSIDERING OPERATING HOURS - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  /**
   * INVITE PROJECT-USER - NOTE: only admin can do it
   * @param email 
   * @param role 
   * @returns 
   */
  public inviteUser(email: string, role: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const url = this.INVITE_USER_URL;
    this.logger.log('[USER-SERV] INVITE PROJECT-USER - URL ', url);

    const body = { 'email': email, 'role': role, 'user_available': false };
    this.logger.log('[USER-SERV] INVITE PROJECT-USER - POST REQUEST BODY ', body);

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  // -------------------------------------------------------
  // GET PENDING USERS
  // --------------------------------------------------------
  public getPendingUsers(): Observable<PendingInvitation[]> {
    const url = this.PENDING_INVITATION_URL;

    this.logger.log('[USER-SERV] - GET PENDING USERS - URL ', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // this.logger.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }



  /**
   * DELTE PENDING INVITATION
   * @param pendingInvitationId 
   * @returns 
   */
  public deletePendingInvitation(pendingInvitationId): Observable<PendingInvitation[]> {
    const url = this.PENDING_INVITATION_URL + '/' + pendingInvitationId;
    this.logger.log('[USER-SERV] - DELETE PENDING INVITATION - URL ', url);
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }


  /**
   * RESEND EMAIL TO PENDING PROJECT-USERS
   * @param pendingInvitationId 
   * @returns 
   */
  public getPendingUsersByIdAndResendEmail(pendingInvitationId): Observable<PendingInvitation[]> {
    const url = this.PENDING_INVITATION_URL + '/resendinvite/' + pendingInvitationId;

    this.logger.log('[USER-SERV] - RESEND EMAIL TO PENDING PROJECT-USERS - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // this.logger.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  /**
   * GET PENDING INVITATION BY PENDING INVITATION ID
   * @param pendingInvitationId 
   * @returns 
   */
  public getPendingUsersById(pendingInvitationId): Observable<PendingInvitation[]> {
    // const url = this.PENDING_INVITATION_URL + '/' + pendingInvitationId;
    const url = this.SERVER_BASE_PATH + 'auth/pendinginvitationsnoauth/' + pendingInvitationId;
    this.logger.log('[USER-SERV] - GET PENDING INVITATION BY PENDING INVITATION ID ', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // this.logger.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }



  /**
   * GET PROJECT-USER BY USER-ID
   * @param user_id 
   * @returns 
   */
  public getProjectUserByUserId(user_id: string): Observable<ProjectUser[]> {

    const url = this.PROJECT_USER_URL + 'users/' + user_id;
    this.logger.log('[USER-SERV] - GET PROJECT-USER BY USER-ID - URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // this.logger.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  /**
   * GET PROJECT-USER BY ID (PROJECT USER DETAIL)
   * @param projectuser_id 
   * @returns 
   */
  public getProjectUsersById(projectuser_id: string): Observable<ProjectUser[]> {

    const url = this.PROJECT_USER_URL + projectuser_id;
    this.logger.log('[USER-SERV] - GET PROJECT USERS BY ID - URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  // ------------------------------------------------------------------------------------------------
  // TODO: TO REPLACE "getProjectUser()" USED BY THE SIDEBAR AND HOME COMPONENTS - CURRENTLY NOT USED
  // -------------------------------------------------------------------------------------------------
  getProjectUserAvailabilityAndRole() {
    this.getProjectUserByUserId(this.currentUserId).subscribe((projectUser: any) => {
      // this.logger.log('!! USER SERVICE - PROJECT-USER GET BY PROJECT-ID ', this.project_id);
      this.logger.log('[USER-SERV] - PROJECT-USER GET BY CURRENT-USER-ID - CURRENT USE ID ', this.currentUserId);
      this.logger.log('[USER-SERV] - PROJECT-USER GET BY CURRENT-USER-ID - PROJECT-USER ', projectUser);
      this.logger.log('[USER-SERV] - PROJECT-USER GET BY CURRENT-USER-ID - PROJECT-USER LENGTH', projectUser.length);
      if ((projectUser) && (projectUser.length !== 0)) {
        this.logger.log('[USER-SERV] - PROJECT-USER GET BY CURRENT-USER-ID - PROJECT-USER ID ', projectUser[0]._id)
        this.logger.log('[USER-SERV] - PROJECT-USER GET BY CURRENT-USER-ID - USER IS AVAILABLE ', projectUser[0].user_available)
        // this.user_is_available_bs = projectUser.user_available;

        if (projectUser[0].user_available !== undefined) {
          this.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy)
        }

        // ADDED 21 AGO
        if (projectUser[0].role !== undefined) {
          this.logger.log('[USER-SERV] - PROJECT-USER GET BY CURRENT-USER-ID - CURRENT USER ROLE ', projectUser[0].role);
          this.user_role(projectUser[0].role);

          // save the user role in storage - then the value is get by auth.service:
          // the user with agent role can not access to the pages under the settings sub-menu
          // this.auth.user_role(projectUser[0].role);

          this.usersLocalDbService.saveUserRoleInStorage(projectUser[0].role);
        }
      } else {
        // this could be the case in which the current user was deleted as a member of the current project
        this.logger.log('[USER-SERV] -  PROJECT-USER GET BY CURRENT-USER-ID - PROJECT-USER UNDEFINED ')
      }

    }, (error) => {
      this.logger.error('[USER-SERV] - PROJECT-USER GET BY CURRENT-USER-ID - ERROR  ', error);
    }, () => {
      this.logger.log('[USER-SERV] - PROJECT-USER GET BY CURRENT-USER-ID * COMPLETE *');
    });
  }


  // -------------------------------------------------------------------------
  // GET ALL PROJECT PROJECT-USERS AND SAVE IN STORAGE USERS AND PROJECT-USERS
  // -------------------------------------------------------------------------
  getAllUsersOfCurrentProjectAndSaveInStorage() {
    this.logger.log('[USER-SERV] - GET ALL PROJECT PROJECT-USERS AND SAVE IN STORAGE USERS AND PROJECT-USERS - PROJECT ID ', this.project_id);

    this.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[USER-SERV] - GET ALL PROJECT PROJECT-USERS AND SAVE IN STORAGE USERS AND PROJECT-USERS - PROJECT-USERS ', projectUsers);

      if (projectUsers) {
        projectUsers.forEach(projectUser => {
          if (projectUser && projectUser !== null) {
            if (projectUser.id_user) {
              this.logger.log('[USER-SERV] - GET ALL PROJECT PROJECT-USERS AND SAVE IN STORAGE USERS AND PROJECT-USERS - USER', projectUser.id_user, 'USER-ID', projectUser.id_user._id)

              let imgUrl = ''
              if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
                imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + this.storageBucket + "/o/profiles%2F" + projectUser.id_user._id + "%2Fphoto.jpg?alt=media"
              } else {
                imgUrl = this.baseUrl + "images?path=uploads%2Fusers%2F" + projectUser.id_user._id + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
              }

              this.checkImageExists(imgUrl, (existsImage) => {
                if (existsImage == true) {
                  projectUser.id_user.hasImage = true
                }
                else {
                  projectUser.id_user.hasImage = false

                  this.createAvatarInitialsAndBckgrnd(projectUser.id_user)
                }

                this.usersLocalDbService.saveMembersInStorage(projectUser.id_user._id, projectUser.id_user);
                this.usersLocalDbService.saveUserInStorageWithProjectUserId(projectUser._id, projectUser.id_user);
              });
            }
          }
        });
      }
    }, error => {
      this.logger.error('[USER-SERV] - GET ALL PROJECT PROJECT-USERS AND SAVE IN STORAGE USERS AND PROJECT-USERS - ERROR', error);
    }, () => {
      this.logger.log('[USER-SERV] - GET ALL PROJECT PROJECT-USERS AND SAVE IN STORAGE USERS AND PROJECT-USERS - COMPLETE')
    });
  }


  checkImageExists(imageUrl, callBack) {
    var imageData = new Image();
    imageData.onload = function () {
      callBack(true);
    };
    imageData.onerror = function () {
      callBack(false);
    };
    imageData.src = imageUrl;
  }

  createAvatarInitialsAndBckgrnd(user) {
    let fullname = '';
    if (user && user.firstname && user.lastname) {

      fullname = user.firstname + ' ' + user.lastname
      user['fullname_initial'] = avatarPlaceholder(fullname);
      user['fillColour'] = getColorBck(fullname)
    } else if (user && user.firstname) {

      fullname = user.firstname
      user['fullname_initial'] = avatarPlaceholder(fullname);
      user['fillColour'] = getColorBck(fullname)
    } else {
      user['fullname_initial'] = 'N/A';
      user['fillColour'] = 'rgb(98, 100, 167)';
    }
  }

  // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
  getBotsByProjectIdAndSaveInStorage() {
    this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {

      if (bots && bots !== null) {

        bots.forEach(bot => {
          this.logger.log('[USER-SERV] - GET BOT BY PROJECT ID AND SAVE IN STORAGE - BOT', bot);
          this.logger.log('[USER-SERV] - GET BOT BY PROJECT ID AND SAVE IN STORAGE - BOT-ID', bot._id);
          this.botLocalDbService.saveBotsInStorage(bot._id, bot);
        });

      }
    }, (error) => {
      this.logger.error('[USER-SERV] - GET BOT BY PROJECT ID AND SAVE IN STORAGE - ERROR ', error);
    }, () => {
      this.logger.log('[USER-SERV] - GET BOT BY PROJECT ID AND SAVE IN STORAGE * COMPLETE');

    });

  }


  // -----------------------------------------------------------------------------------------------------
  // PUBLISH: Project User ID, Availability; Busy - PUBLISH projectUser_id, user_available, isBusy
  // -----------------------------------------------------------------------------------------------------
  // NOTE: THE projectUser_id AND user_available ARE PASSED FROM HOME.COMPONENT and from SIDEBAR.COMP

  /**
   * PUBLISH: PROJECT-USER-ID - USER AVAILABILITY - USER IS BUSY - PUBLISH projectUser_id, user_available, isBusy
   * NOTE: THE PARAMS ARE PASSED FROM HOME.COMPONENT - SIDEBAR.COMP - NAVBAR-FOR-PANEL
   * @param projectUser_id 
   * @param user_available 
   * @param user_isbusy 
   */
  public user_availability(projectUser_id: string, user_available: boolean, user_isbusy: boolean) {
    this.logger.log('[USER-SERV] - PUBLISH PROJECT-USER-ID ', projectUser_id);
    this.logger.log('[USER-SERV] - PUBLISH USER AVAILABLE ', user_available);
    this.logger.log('[USER-SERV] - PUBLISH USER IS BUSY ', user_isbusy);

    this.project_user_id_bs.next(projectUser_id);
    this.user_is_available_bs.next(user_available);
    this.user_is_busy$.next(user_isbusy);
  }


  // -----------------------------------------------------------------------------------------------------
  // AVAILABILITY - PUBLISH WHEN THE SIDEBAR AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
  // NOTE: NAVBAR USER-EDIT-ADD & USER COMPONENT SUBSCRIBES WHEN IN SIDEBAR IS CHANGED AVAILABILITY
  // -----------------------------------------------------------------------------------------------------
  public availability_btn_clicked(clicked: boolean) {
    this.has_changed_availability_in_sidebar.next(clicked)
    this.logger.log('[USER-SERV] - CURRENT-USER AVAILABILITY  availability_btn_clicked ', clicked)
  }


  // -----------------------------------------------------------------------------------------------------
  // AVAILABILITY - PUBLISH WHEN THE USERS-COMP AVAILABLE / UNAVAILABLE Toggle Switch BTN IS CLICKED
  // NOTE: SIDEBAR & NAVBAR SUBSCRIBES WHEN IN USER-EDIT-ADD & USER COMPONENT IS CHANGED AVAILABILITY
  // -----------------------------------------------------------------------------------------------------
  public availability_switch_clicked(clicked: boolean) {
    this.has_changed_availability_in_users.next(clicked)
  }


  /**
   * Subscribe to WS - CURRENT USER OF ALL PROJECTS 
   * used to get availability and is busy in PROJECTS (i.e Recent projects page) & PROJECT-FOR-PANEL)
   * @param projectid 
   * @param prjctuserid 
   * @returns 
   */
  subscriptionToWsCurrentUser_allProject(projectid, prjctuserid) {

    var self = this;
    const path = '/' + projectid + '/project_users/' + prjctuserid
    this.logger.log('[USER-SERV] - SUBSCR (REF) TO WS CURRENT USERS PATH: ', path);

    return new Promise(function (resolve, reject) {

      self.webSocketJs.ref(path, 'subscriptionToWsCurrentUser_allProject',
        function (data, notification) {
          self.logger.log("[USER-SERV] SUBSCR TO WS CURRENT USER OF ALL PROJECTS  - CREATE - data ", data);
          resolve(data)
          // self.currentUserWsAvailability$.next(data.user_available);
          self.currentUserWsBusyAndAvailabilityForProject$.next(data)

        }, function (data, notification) {
          resolve(data)
          self.logger.log("[USER-SERV] SUBSCR TO WS CURRENT USER OF ALL PROJECTS - UPDATE - data ", data);
          self.currentUserWsBusyAndAvailabilityForProject$.next(data)

        }, function (data, notification) {
          resolve(data)
          if (data) {
            self.logger.log("[USER-SERV] SUBSCR TO WS CURRENT USER OF ALL PROJECTS - ON-DATA - data", data);
          }
        });

    })
  }

  /**
   * UN-SUBSCRIBE TO WS CURRENT USER OF ALL PROJECTS
   * @param projectid 
   * @param prjctuserid 
   */
  unsubsToWS_CurrentUser_allProject(projectid, prjctuserid) {
    this.webSocketJs.unsubscribe('/' + projectid + '/project_users/' + prjctuserid);
    this.logger.log("[USER-SERV] - UN-SUBSCRIBE TO WS CURRENT USER OF ALL PROJECTS  projectid: ", projectid, ' prjctuserid:', prjctuserid);
  }


  /**
   * Subscribe to WS Contact Events
   * @param projectid 
   * @param leadid 
   * @returns 
   */
  subscriptionToWsContactEvents(projectid, leadid) {
    var self = this;
    self.eventlist = []

    const path = '/' + projectid + '/events/' + leadid
    this.logger.log('[USER-SERV] - SUBSCR TO WS CONTACT EVENTS PATH: ', path);
    return new Promise(function (resolve, reject) {

      self.webSocketJs.ref(path, 'subscriptionToWsContactEvents', function (data, notification) {
        self.logger.log('[USER-SERV] - SUBSCR TO WS CONTACT EVENTS - CREATE data: ', data);

        const index = self.eventlist.findIndex((e) => e._id === data._id);
        if (index === -1) {

          self.logger.log("[USER-SERV] - SUBSCR TO WS CONTACT EVENTS CREATE  - the event not exist - ADD");
          self.eventlist.push(data)
          self.contactsEvents$.next(self.eventlist)
        }


      }, function (data, notification) {
        resolve(data)
        self.logger.log("[USER-SERV] - SUBSCR TO WS CONTACT EVENTS - UPDATE data ", data);


      }, function (data, notification) {
        resolve(data)
        if (data) {
          self.logger.log("[USER-SERV] - SUBSCR TO WS CONTACT EVENTS - ON-DATA data", data);
        }
      });

    })
  }


  /**
   * PUBLISH PROJECT-USER ROLE AND CHECK THE ROLE (FOR THE CURRENT PROJECT) SAVED IN THE STORAGE
   * NOTE: THE projectUser_role IS PASSED FROM HOME - SIDEBAR - NAVBAR-FOR-PANEL
   * NOTE: IF THE USER ROLE STORED NOT MATCHES THE USER ROLE PUBLISHED IS RESET IN STORAGE THE PROJECT OBJCT
   * @param projectUser_role 
   */
  public user_role(projectUser_role: string) {
    this.logger.log('[USER-SERV] PUBLISH THE USER-ROLE  >>', projectUser_role, '<< FOR THE PROJECT ID ', this.project_id);

    // PUBLISH THE USER ROLE
    this.project_user_role_bs.next(projectUser_role);

    // COMPARE THE STORED ROLE WITH THE USER ROLE PUBLISHED
    const storedProjectJson = localStorage.getItem(this.project_id);
    if (storedProjectJson) {
      const projectObject = JSON.parse(storedProjectJson);
      const storedUserRole = projectObject['role'];
      const storedProjectName = projectObject['name'];
      const storedProjectId = projectObject['_id'];
      const storedProjectOH = projectObject['operatingHours'];
      this.logger.log('[USER-SERV] USER ROLE FROM STORAGE >>', storedUserRole, '<<');
      this.logger.log('[USER-SERV] PROJECT NAME FROM STORAGE ', storedProjectName);
      this.logger.log('[USER-SERV] PROJECT ID FROM STORAGE ', storedProjectId);

      if (storedUserRole !== projectUser_role) {
        this.logger.log('[USER-SERV] - USER ROLE STORED !!! NOT MATCHES USER ROLE PUBLISHED - RESET PROJECT IN STORAGE ');

        const projectForStorage: Project = {
          _id: storedProjectId,
          name: storedProjectName,
          role: projectUser_role,
          operatingHours: storedProjectOH
        }

        // RESET THE PROJECT IN THE STORAGE WITH THE UPDATED ROLE
        localStorage.setItem(storedProjectId, JSON.stringify(projectForStorage));
      }
    }
  }


  /**
   * UPDATE PROJECT-USER AVAILABILITY (PUT)
   * @param projectUser_id 
   * @param user_is_available 
   * @returns 
   */
  public updateProjectUser(projectUser_id: string, user_is_available: boolean) {

    let url = this.SERVER_BASE_PATH + this.project._id + '/project_users/' + projectUser_id;
    this.logger.log('[USER-SERV] - PROJECT-USER UPDATE AVAILABILITY (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'user_available': user_is_available };
    this.logger.log('[USER-SERV] - PROJECT-USER UPDATE AVAILABILITY - PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // DONE - WORKS NK-TO-TEST - da fare e da testare dopo che L. esegue il commit del servizio aggiornato (lo puo fare solo l'admin)
  // this is a service equal to updateProjectUser() in which project User_id was not passed
  // must be implemented for to change the availability status (available / unavailable) of the current user

  /**
   * UPDATE CURRENT USER AVAILABILITY
   * @param projectId 
   * @param user_is_available 
   * @returns 
   */
  public updateCurrentUserAvailability(projectId: string, user_is_available: boolean) {

    let url = this.SERVER_BASE_PATH + projectId + '/project_users/';
    this.logger.log('[USER-SERV] - UPDATE CURRENT USER AVAILABILITY (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'user_available': user_is_available };
    this.logger.log('[USER-SERV] - UPDATE CURRENT USER AVAILABILITY - BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }



  /**
   * UPDATE PROJECT-USER ROLE & MAX-CHAT 
   * NOTE: only admin can do it
   * @param projectUser_id 
   * @param user_role 
   * @param max_assigned_chat 
   * @returns 
   */
  public updateProjectUserRoleAndMaxchat(projectUser_id: string, user_role: string, max_assigned_chat: number) {
    let url = this.PROJECT_USER_URL + projectUser_id;
    this.logger.log('[USER-SERV] - UPDATE PROJECT-USER ROLE & MAX-CHAT (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    // const body = { 'role': user_role, 'max_served_chat': max_served_chat };
    const body = { 'role': user_role, 'max_assigned_chat': max_assigned_chat };


    this.logger.log('[USER-SERV] - UPDATE PROJECT-USER ROLE & MAX-CHAT  BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


  /**
   * DELETE PROJECT-USER (DELETE) 
   * @param projectUser_id 
   * @returns 
   */
  public deleteProjectUser(projectUser_id: string) {

    let url = this.PROJECT_USER_URL + projectUser_id;
    this.logger.log('[USER-SERV] - DELETE PROJECT-USER - DELETE URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }


  /**
   * UPDATE CURRENT USER LASTNAME / FIRSTNAME
   * @param user_firstname 
   * @param user_lastname 
   * @param callback 
   * @returns 
   */
  public updateCurrentUserLastnameFirstname(user_firstname: string, user_lastname: string, callback) {

    const url = this.UPDATE_USER_URL;
    this.logger.log('[USER-SERV] - UPDATE CURRENT USER LASTNAME & FIRSTNAME (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    this.logger.log('[USER-SERV] - UPDATE CURRENT USER-LASTNAME ', user_lastname, 'USER-FIRSTNAME', user_firstname);

    const body = { 'firstname': user_firstname, 'lastname': user_lastname };

    this.logger.log('[USER-SERV] - UPDATE CURRENT USER LASTNAME & FIRSTNAME - BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .toPromise()
      .then(res => {

        this.logger.log('[USER-SERV] - UPDATE CURRENT USER LASTNAME & FIRSTNAME - RESPONSE: ', res.json())

        const jsonRes = res.json()

        if (jsonRes['success'] === true) {

          callback('success');

          const user: User = jsonRes.updatedUser;

          user.token = this.TOKEN;
          this.logger.log('[USER-SERV] - UPDATED USER + token (before to set in storage) ', user)

          /* PUBLISH THE UPDATED USER CURRENT USER */
          this.auth.publishUpdatedUser(user)

        } else {
          callback('error');
        }
      })
      .catch(res => Promise.reject(`my error is: ${res}`))
      .then(res => this.logger.log('good', res),
        err => {
          this.logger.error('* Bad *', err)
          callback('error')
        });
  }

  /**
   * CHANGE PSW
   * @param user_id 
   * @param old_psw 
   * @param new_psw 
   * @returns 
   */
  public changePassword(user_id: string, old_psw: string, new_psw: string) {

    const url = this.CHANGE_PSW_URL;
    this.logger.log('[USER-SERV] - CHANGE PSW (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'oldpsw': old_psw, 'newpsw': new_psw };
    this.logger.log('[USER-SERV] - PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /**
   * RESEND VERIFY EMAIL
   * @returns 
   */
  public resendVerifyEmail() {

    const url = this.RESEND_VERIFY_EMAIL;
    this.logger.log('[USER-SERV] - RESEND VERIFY EMAIL URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    return this.http
      .get(url, options)
      .map((res) => res.json());
  }


}
