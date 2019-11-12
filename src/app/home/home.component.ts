import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, SuperUser } from '../core/auth.service';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { DepartmentService } from '../services/mongodb-department.service';
import { RequestsService } from '../services/requests.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../services/project-plan.service';

import { Subscription } from 'rxjs';
import { publicKey } from './../utils/util';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {

  firebaseProjectId: any;
  LOCAL_STORAGE_CURRENT_USER: any;

  // public superUser = new SuperUser('');
  currentUserEmailgetFromStorage: string;
  IS_SUPER_USER: boolean;

  user: any;
  project: Project;
  projectId: string;
  // user_is_available: boolean;

  USER_ROLE: string;

  CHAT_BASE_URL = environment.chat.CHAT_BASE_URL;
  eos = environment.t2y12PruGU9wUtEGzBJfolMIgK;
  browserLang: string;

  prjct_name: string;
  prjct_profile_name: string;
  prjct_profile_type: string;
  prjct_trial_expired: boolean;
  subscription_is_active: boolean;
  subscription_end_date: Date;
  showSpinner = true;

  subscription: Subscription;
  isVisible: boolean;
  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private usersLocalDbService: UsersLocalDbService,
    private departmentService: DepartmentService,
    private requestsService: RequestsService,
    private notify: NotifyService,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService
  ) { }

  ngOnInit() {
    console.log('!!! Hello HomeComponent! ');

    this.getBrowserLanguage();


    // console.log(environment.firebaseConfig.projectId);
    // this.firebaseProjectId = environment.firebaseConfig.projectId;

    // const userKey = Object.keys(window.localStorage)
    //   .filter(it => it.startsWith('firebase:authUser'))[0];
    // this.LOCAL_STORAGE_CURRENT_USER = userKey ? JSON.parse(localStorage.getItem(userKey)) : undefined;
    // console.log('HOMEPAGE - USER GET FROM LOCAL STORAGE ', this.LOCAL_STORAGE_CURRENT_USER)
    // this.currentUserEmailgetFromStorage = this.LOCAL_STORAGE_CURRENT_USER.email
    // console.log('HOMEPAGE - USER EMAIL GET FROM LOCAL STORAGE  ', this.currentUserEmailgetFromStorage)

    // if (this.currentUserEmailgetFromStorage) {
    //   this.superUserAuth();
    // }
    this.getLoggedUser()
    // this.getProjectId()
    this.getCurrentProject()

    // get the PROJECT-USER BY CURRENT-PROJECT-ID AND CURRENT-USER-ID
    // IS USED TO DETERMINE IF THE USER IS AVAILABLE OR NOT AVAILABLE
    this.getProjectUser();

    // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
    this.usersService.getBotsByProjectIdAndSaveInStorage();

    // TEST FUNCTION : GET ALL AVAILABLE PROJECT USER
    // this.getAvailableProjectUsersByProjectId();

    this.getUserRole();
    this.getProjectPlan();
    this.getVisitorCounter();
    this.getOSCODE();
  }

  getOSCODE() {
    console.log('eoscode', this.eos)

    if (this.eos && this.eos === publicKey) {

      this.isVisible = true;
      console.log('eoscode isVisible ', this.isVisible);
    } else {

      this.isVisible = false;
      console.log('eoscode isVisible ', this.isVisible);
    }
  }

  getVisitorCounter() {
    this.departmentService.getVisitorCounter()
      .subscribe((visitorCounter: any) => {
        console.log('getVisitorCounter : ', visitorCounter);

        // x test
        // const visitorCounter = [{ "_id": "5cd2ff0492424372bfa33574", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://www.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T16:08:36.085Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-12T16:24:50.764Z", "totalViews": 12564 }, { "_id": "5cd313cc92424372bfa6fad2", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://www.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T17:37:16.872Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-08T03:14:10.802Z", "totalViews": 108 }, { "_id": "5cd317e492424372bfa7baad", "id_project": "5ad5bd52c975820014ba900a", "origin": null, "__v": 0, "createdAt": "2019-05-08T17:54:44.273Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T23:04:26.285Z", "totalViews": 567 }, { "_id": "5cd3187492424372bfa7d4b4", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://testwidget.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T17:57:08.426Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T14:43:27.804Z", "totalViews": 47 }, { "_id": "5cd3188292424372bfa7d694", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://support.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T17:57:22.763Z", "path": "/5ad5bd52c975820014ba900a/departments/allstatus", "updatedAt": "2019-10-18T10:24:28.260Z", "totalViews": 608 }, { "_id": "5cd37ce592424372bfb4f18c", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://tiledesk.com", "__v": 0, "createdAt": "2019-05-09T01:05:41.918Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-31T15:29:55.687Z", "totalViews": 8 }, { "_id": "5cd5a42392424372bffcf279", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://codingpark.com", "__v": 0, "createdAt": "2019-05-10T16:17:39.561Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-05-12T04:30:49.985Z", "totalViews": 7 }, { "_id": "5cda868492424372bfa41f87", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://edit.tiledesk.com", "__v": 0, "createdAt": "2019-05-14T09:12:36.334Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T14:34:01.768Z", "totalViews": 627 }, { "_id": "5cdbdc5092424372bfd446ed", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:4200", "__v": 0, "createdAt": "2019-05-15T09:30:56.291Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-07-08T15:18:49.783Z", "totalViews": 669 }, { "_id": "5ce3d37e92424372bff07234", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://s3.eu-west-1.amazonaws.com", "__v": 0, "createdAt": "2019-05-21T10:31:26.193Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-05-21T11:41:47.565Z", "totalViews": 4 }, { "_id": "5ce3ee6692424372bff47a01", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://support-pre.tiledesk.com", "__v": 0, "createdAt": "2019-05-21T12:26:14.830Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-09-03T09:52:03.442Z", "totalViews": 29 }, { "_id": "5ce5532492424372bf26422f", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:8000", "__v": 0, "createdAt": "2019-05-22T13:48:20.153Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-05-22T15:10:52.097Z", "totalViews": 4 }, { "_id": "5cea371792424372bfcdf00f", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://evil.com/", "__v": 0, "createdAt": "2019-05-26T06:49:59.238Z", "path": "/5ad5bd52c975820014ba900a/departments/allstatus", "updatedAt": "2019-07-20T06:11:47.539Z", "totalViews": 4 }, { "_id": "5cee342c92424372bf5f5ea3", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://testwidget.tiledesk.it", "__v": 0, "createdAt": "2019-05-29T07:26:36.984Z", "path": "/5ad5bd52c975820014ba900a/departments/5b8eb4955ca4d300141fb2cc/operators", "updatedAt": "2019-05-29T07:27:10.327Z", "totalViews": 3 }, { "_id": "5cf072d392424372bfb993d7", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://importchinaproducts.com", "__v": 0, "createdAt": "2019-05-31T00:18:27.503Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-03T22:52:21.678Z", "totalViews": 27 }, { "_id": "5cf0892292424372bfbbfcc7", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://importchinaproducts.com", "__v": 0, "createdAt": "2019-05-31T01:53:38.809Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-09T14:02:29.505Z", "totalViews": 18 }, { "_id": "5cf64fdf92424372bf9137d0", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://54.37.234.246:1111", "__v": 0, "createdAt": "2019-06-04T11:02:55.936Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-14T18:49:33.847Z", "totalViews": 49 }, { "_id": "5cf8d08b1caa8022ad5248e2", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://www.importchinaproducts.com", "__v": 0, "createdAt": "2019-06-06T08:36:27.328Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-28T08:37:36.711Z", "totalViews": 7 }, { "_id": "5cfa4eff1caa8022ad8fbc5f", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://54.37.225.206:4300", "__v": 0, "createdAt": "2019-06-07T11:48:15.191Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-10T05:58:55.933Z", "totalViews": 26 }, { "_id": "5cfa9c7d1caa8022ad9e40e1", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://vps695843.ovh.net:4300", "__v": 0, "createdAt": "2019-06-07T17:18:53.536Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-07T17:18:53.536Z", "totalViews": 1 }, { "_id": "5cfe93281caa8022ad2bbebf", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://widget.kobs.pl", "__v": 0, "createdAt": "2019-06-10T17:28:08.213Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-10T17:46:51.521Z", "totalViews": 6 }, { "_id": "5cfe96c91caa8022ad2c850a", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://panel.kobs.pl", "__v": 0, "createdAt": "2019-06-10T17:43:37.206Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-17T05:51:44.478Z", "totalViews": 189 }, { "_id": "5cfed7fc1caa8022ad37ff73", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:8080", "__v": 0, "createdAt": "2019-06-10T22:21:48.300Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-10T22:21:50.845Z", "totalViews": 2 }, { "_id": "5d14ead832da4a99f4209603", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://translate.googleusercontent.com", "__v": 0, "createdAt": "2019-06-27T16:12:08.146Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-27T16:12:52.926Z", "totalViews": 3 }, { "_id": "5d1ed5de32da4a99f4bdc056", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost", "__v": 0, "createdAt": "2019-07-05T04:45:18.031Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-07-11T08:25:47.008Z", "totalViews": 168 }, { "_id": "5d1f030932da4a99f4c3bc4b", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://192.168.1.137", "__v": 0, "createdAt": "2019-07-05T07:58:01.426Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-07-05T07:58:01.426Z", "totalViews": 1 }, { "_id": "5db2e17b6b2dfaad7c1f1962", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:3000", "__v": 0, "createdAt": "2019-10-25T11:50:19.452Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-30T12:17:18.155Z", "totalViews": 15 }, { "_id": "5db30c036b2dfaad7c269761", "id_project": "5ad5bd52c975820014ba900a", "origin": "null", "__v": 0, "createdAt": "2019-10-25T14:51:47.062Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-25T14:52:03.462Z", "totalViews": 2 }, { "_id": "5db314186b2dfaad7c281712", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://www.frontiere21.it", "__v": 0, "createdAt": "2019-10-25T15:26:16.834Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-25T15:51:49.450Z", "totalViews": 11 }, { "_id": "5dc92fb73b1c8559fb6c3cc6", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://egov2-dev.comune.bari.it:3000", "__v": 0, "createdAt": "2019-11-11T09:53:59.339Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T09:53:59.339Z", "totalViews": 1 }, { "_id": "5dc9714e3b1c8559fb79445a", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://baribot.herokuapp.com", "__v": 0, "createdAt": "2019-11-11T14:33:50.123Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T14:34:18.612Z", "totalViews": 2 }]
        console.log('getVisitorCounter length : ', visitorCounter.length);
        if (visitorCounter && visitorCounter.length > 0) {



          let count = 0;
          visitorCounter.forEach(visitor => {

            // console.log('getVisitorCounter visitor origin ', visitor.origin);
            if (
              visitor.origin !== "https://s3.eu-west-1.amazonaws.com" &&
              visitor.origin !== "http://testwidget.tiledesk.it" &&
              visitor.origin !== "http://testwidget.tiledesk.com" &&
              visitor.origin !== "https://support.tiledesk.com" &&
              visitor.origin !== null &&
              visitor.origin !== 'null' &&
              visitor.origin !== "http://evil.com/"
            ) {

              count = count + 1;
              console.log('getVisitorCounter the origin ', visitor.origin, ' is != of test-site and is != of support-tiledesk and is != of null ', count);
              // console.log('getVisitorCounter ORIGIN != TEST-SITE AND != SUPPORT-TILEDESK »» HAS INSTALLED');

            } else {
              console.log('getVisitorCounter the origin ', visitor.origin, ' is = of test-site or is = support-tiledesk or is = null');
            }

          });

          if (count === 0) {

            this.notify.presentModalInstallTiledeskModal()
            console.log('getVisitorCounter count', count, '!!!');

          }

        } else {
          console.log('getVisitorCounter length : ', visitorCounter.length);
          console.log('getVisitorCounter VISITOR COUNTER IS O »» HAS NOT INSTALLED');
          this.notify.presentModalInstallTiledeskModal()
        }

      }, (error) => {

        console.log('getVisitorCounter ERROR ', error);

      }, () => {
        console.log('getVisitorCounter * COMPLETE *');
      });
  }


  getBrowserLanguage() {
    this.browserLang = this.translate.getBrowserLang();
    console.log('!!! ===== HELLO HOME COMP ===== BRS LANG ', this.browserLang)
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (HomeComponent) project Profile Data', projectProfileData)
      if (projectProfileData) {


        this.prjct_name = projectProfileData.name;
        this.prjct_profile_name = projectProfileData.profile_name;
        this.prjct_trial_expired = projectProfileData.trial_expired;
        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;
        this.subscription_end_date = projectProfileData.subscription_end_date;


        this.showSpinner = false;

        if (this.prjct_profile_type === 'free') {
          if (this.prjct_trial_expired === false) {
            console.log('!!! ===== HELLO HOME COMP this.browserLang 2 ', this.browserLang);

            if (this.browserLang === 'it') {

              this.prjct_profile_name = 'Piano Pro (trial)'

            } else if (this.browserLang !== 'it') {
              this.prjct_profile_name = 'Pro (trial) Plan'

            }
          } else {
            console.log('!!! ===== HELLO HOME COMP this.browserLang 3 ', this.browserLang);
            if (this.browserLang === 'it') {

              this.prjct_profile_name = 'Piano ' + projectProfileData.profile_name;

            } else if (this.browserLang !== 'it') {

              this.prjct_profile_name = projectProfileData.profile_name + ' Plan';

            }
          }
        } else if (this.prjct_profile_type === 'payment') {
          console.log('!!! ===== HELLO HOME COMP this.browserLang 4 ', this.browserLang);
          if (this.browserLang === 'it') {

            this.prjct_profile_name = 'Piano ' + projectProfileData.profile_name;

          } else if (this.browserLang !== 'it') {

            this.prjct_profile_name = projectProfileData.profile_name + ' Plan';
          }
        }

      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  goToPricingOrOpenModalSubsExpired() {
    if (this.prjct_profile_type === 'free') {

      this.router.navigate(['project/' + this.projectId + '/pricing']);

    } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {

      this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      // this.notify.showCheckListModal(true);
    }
  }

  goToPricing() {
    this.router.navigate(['project/' + this.projectId + '/pricing']);
  }



  // RISOLVE lo USE-CASE: L'UTENTE è NELLA HOME DEL PROGETTO A (DI CUI è OWNER)
  // SEGUE UN LINK CHE LO PORTA (AD ESEMPIO) AL DETTAGLIO DI UNA RICHIESTA DEL PROGETTO B (DI CUI è AGENT)
  // AVVIENE IL CAMBIO DAL PROGETTO A AL PROGETTO B 'ON THE FLY'
  // DOPO AVER VISUALIZZATO IL DETTAGLIO DELLA RICHIESTA L'UTENTE PREME SUL PULSANTE BACK E TORNA INDIETRO ALLA HOME DEL PROGETTO A
  // ANCHE SE NELLO STORAGE IL RUOLO DELL'UTENTE è STATO AGGIORNATO (DA AGENT A OWNER) LA PAGINA HOME NON VISUALIZZA
  // IL PULSANTE 'WIDGET' NN AVENDO FATTO IN TEMPO A AGGIORNARE IL 'ROLE' NELL'HTML
  // CON getUserRole() AGGIORNO this.USER_ROLE QUANDO LA SIDEBAR, NEL MOMENTO
  // IN CUI ESGUE getProjectUser() PASSA LO USER ROLE ALLO USER SERVICE CHE LO PUBBLICA
  // NOTA: LA SIDEBAR AGGIORNA LO USER ROLE PRIMA DELLA HOME
  getUserRole() {
    this.usersService.project_user_role_bs.subscribe((userRole) => {

      console.log('!! »»» HOME - SUBSCRIPTION TO USER ROLE »»» ', userRole)
      // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
      this.USER_ROLE = userRole;
    })
  }

  // TEST FUNCTION : GET ALL AVAILABLE PROJECT USER
  getAvailableProjectUsersByProjectId() {
    console.log('... CALLING GET AVAILABLE PROJECT USERS')
    this.usersService.getAvailableProjectUsersByProjectId().subscribe((available_project) => {
      console.log('»»»»»»» AVAILABLE PROJECT USERS ', available_project)
    })
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> HOME project from AUTH service subscription  ', project)

      if (this.project) {
        this.projectId = this.project._id
      }
    });
  }

  // <!-- RESOUCES (link renamed in WIDGET) -->
  goToResources() {
    // this.router.navigate(['project/' + this.projectId + '/resources']);
    this.router.navigate(['project/' + this.projectId + '/widget']);
  }
  goToRequests() {
    this.router.navigate(['project/' + this.projectId + '/requests']);
  }

  goToAnalytics() {
    this.router.navigate(['project/' + this.projectId + '/analytics']);
  }

  goToAnalyticsStaticPage() {
    this.router.navigate(['project/' + this.projectId + '/analytics-demo']);
  }

  goToActivitiesStaticPage() {
    this.router.navigate(['project/' + this.projectId + '/activities-demo']);
  }

  goToHoursStaticPage() {
    this.router.navigate(['project/' + this.projectId + '/hours-demo']);
  }


  openChat() {
    // localStorage.setItem('chatOpened', 'true');
    const url = this.CHAT_BASE_URL;
    window.open(url, '_blank');

    this.notify.publishHasClickedChat(true);

    // this.openWindow('tiledesk_chat', url)
    // this.focusWin('tiledesk_chat')
  }

  openWindow(winName: any, winURL: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      alert('window already exists');
    } else {
      myWindows[winName] = window.open(winURL, winName);
    }
  }

  focusWin(winName: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      myWindows[winName].focus();
    } else {
      alert('cannot focus closed or nonexistant window');
    }
  }

  // loads an URL into the popup without reloading it
  openChatWindow(chatUrl: any, chatWindowName: any) {
    // open the window with blank url
    const chatwin = window.open('', chatWindowName);
    try {
      // if we just opened the window
      // console.log('1) mywin ', chatwin)
      // console.log('1) mywin.document ', chatwin.document)
      if (chatwin.closed || (!chatwin.document.URL) || (chatwin.document.URL.indexOf('about') === 0)) {
        // console.log('2) mywin ', chatwin)
        // console.log('2) mywin.document ', chatwin.document)
        chatwin.location.href = chatUrl;
      } else {
        // console.log('3) mywin ', chatwin)
        // console.log('3) mywin.document ', chatwin.document)
        chatwin.focus();
      }
    } catch (err) {
      console.log('err ', err)
    }
    // return the window
    return chatwin;
  }

  goToTiledeskMobileAppPage() {
    let url = ''
    if (this.browserLang === 'it') {
      url = 'https://www.tiledesk.com/it/mobile-live-chat-android-iphone-app/';
    } else {
      url = 'https://www.tiledesk.com/mobile-live-chat-android-iphone-app-en/';
    }
    window.open(url, '_blank');
  }

  goToAdminDocs() {
    let url = ''
    if (this.browserLang === 'it') {
      url = 'https://www.tiledesk.com/it/guida-introduttiva/guida-introduttiva-per-amministratori/';
    } else {
      url = 'https://www.tiledesk.com/getting-started/getting-started-for-admins/';
    }
    window.open(url, '_blank');
  }


  goToAgentDocs() {
    let url = ''
    if (this.browserLang === 'it') {
      url = 'https://www.tiledesk.com/it/guida-introduttiva/guida-introduttiva-per-agenti/';
    } else {
      url = 'https://www.tiledesk.com/getting-started/getting-started-for-agents/';
    }
    window.open(url, '_blank');
  }

  goToDeveloperDocs() {
    const url = ' https://docs.tiledesk.com/';
    window.open(url, '_blank');
  }


  goToInstallWithTagManagerDocs() {
    let url = ''
    if (this.browserLang === 'it') {
      url = 'https://www.tiledesk.com/it/google-tag-manager-aggiungi-tiledesk-ai-tuoi-siti/';
    } else {
      url = 'https://www.tiledesk.com/google-tag-manager-add-tiledesk-to-your-sites/';
    }
    window.open(url, '_blank');

  }


  // NO MORE USED
  goToHistory() {
    this.router.navigate(['project/' + this.projectId + '/history']);
  }

  // no more used
  getProjectId() {
    // this.projectid = this.route.snapshot.params['projectid'];
    // console.log('SIDEBAR - - - - - CURRENT projectid ', this.projectid);
    this.route.params.subscribe(params => {
      // const param = params['projectid'];
      console.log('NAVBAR - CURRENT projectid ', params);
    });
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN HOME ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;

      if (this.user) {

        // !!!! NO MORE USED - MOVED IN USER SERVICE
        // this.getAllUsersOfCurrentProject();
        console.log('HOME CALL -> getAllUsersOfCurrentProjectAndSaveInStorage')
        this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

      }
    });
  }

  // IS USED TO GET THE PROJECT-USER AND DETERMINE IF THE USER IS AVAILAVLE/UNAVAILABLE WHEN THE USER ENTER IN HOME
  // (GET THE PROJECT-USER CAN NOT BE DONE IN THE SIDEBAR BECAUSE WHEN THE PROJECT
  // IS SELECTED THE SIDEBAR HAS BEEN ALREADY CALLED)
  // *** NOTE: THE SAME CALLBACK IS RUNNED IN THE SIDEBAR.COMP ***
  getProjectUser() {
    console.log('!!! HOME CALL GET-PROJECT-USER')
    this.usersService.getProjectUsersByProjectIdAndUserId(this.user._id, this.projectId).subscribe((projectUser: any) => {
      console.log('!!! H PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ', projectUser)
      if (projectUser) {
        console.log('H PROJECT-USER ID ', projectUser[0]._id)
        console.log('H USER IS AVAILABLE ', projectUser[0].user_available)
        // this.user_is_available_bs = projectUser.user_available;

        if (projectUser[0].user_available !== undefined) {
          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available);
        }
        if (projectUser[0].role !== undefined) {
          console.log('!!! »»» HOME GET THE USER ROLE FOR THE PROJECT »»', this.projectId, '»»» ', projectUser[0].role);

          // SEND THE ROLE TO USER SERVICE THAT PUBLISH
          this.usersService.user_role(projectUser[0].role);

          // save the user role in storage - then the value is get by auth.service:
          // the user with agent role can not access to the pages under the settings sub-menu
          // this.auth.user_role(projectUser[0].role);
          // this.usersLocalDbService.saveUserRoleInStorage(projectUser[0].role);

          // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
          this.USER_ROLE = projectUser[0].role;
        }

      }
    }, (error) => {
      console.log('H PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ERROR ', error);
    }, () => {
      console.log('H PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
    });
  }



  // !!!! NO MORE USED - MOVED IN USER SERVICE
  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('HOME COMP - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      if (projectUsers) {
        projectUsers.forEach(projectUser => {
          if (projectUser && projectUser !== null) {
            if (projectUser.id_user) {
              console.log('HOME COMP - PROJECT-USERS - USER ', projectUser.id_user, projectUser.id_user._id)

              // localStorage.setItem(projectUser.id_user._id, JSON.stringify(projectUser.id_user));
              this.usersLocalDbService.saveMembersInStorage(projectUser.id_user._id, projectUser.id_user);
            }
          }
        });
      }
      // localStorage.setItem('project', JSON.stringify(project));
      //   this.showSpinner = false;
      //   this.projectUsersList = projectUsers;
    }, error => {
      // this.showSpinner = false;
      console.log('PROJECT-USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      console.log('PROJECT-USERS (FILTERED FOR PROJECT ID) - COMPLETE')
    });
  }

  // NOT YET USED
  superUserAuth() {
    if (!this.auth.superUserAuth(this.currentUserEmailgetFromStorage)) {
      console.log('+++ CURRENT U IS NOT SUPER USER ', this.currentUserEmailgetFromStorage);
      this.IS_SUPER_USER = false;
    } else {
      console.log('+++ !! CURRENT U IS SUPER USER ', this.currentUserEmailgetFromStorage);
      this.IS_SUPER_USER = true;

    }
  }

  displayCheckListModal() {
    this.notify.showCheckListModal(true);
  }

  goToUserActivitiesLog() {
    this.router.navigate(['project/' + this.projectId + '/activities']);
  }




}
