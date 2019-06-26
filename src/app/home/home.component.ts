import { Component, OnInit } from '@angular/core';
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


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

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

  CHAT_BASE_URL = environment.chat.CHAT_BASE_URL
  browserLang: string;

  prjct_name: string;
  prjct_profile_name: string;
  prjct_trial_expired: boolean;

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
    this.getAvailableProjectUsersByProjectId();

    this.getUserRole();
    this.getProjectPlan();
  }


  getBrowserLanguage() {
    this.browserLang = this.translate.getBrowserLang();
    console.log('!!! ===== HELLO HOME COMP ===== BRS LANG ', this.browserLang)
  }

  getProjectPlan() {
    this.prjctPlanService.projectPlan.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (navbar) project Profile Data', projectProfileData)
      if (projectProfileData) {
        this.prjct_name = projectProfileData.name;
        this.prjct_profile_name = projectProfileData.profile_name;
        this.prjct_trial_expired = projectProfileData.trial_expired;



        if (this.prjct_profile_name === 'free') {
          if (this.prjct_trial_expired === false) {
            console.log('!!! ===== HELLO HOME COMP this.browserLang 2 ', this.browserLang);

            if (this.browserLang === 'it') {

              this.prjct_profile_name = 'Piano Pro (trial)'

            } else {
              this.prjct_profile_name = 'Pro (trial) Plan'

            }
          } else {
            console.log('!!! ===== HELLO HOME COMP this.browserLang 3 ', this.browserLang);
            if (this.browserLang === 'it') {

              this.prjct_profile_name = 'Piano ' + projectProfileData.profile_name;
            } else {

              this.prjct_profile_name = projectProfileData.profile_name + ' Plan';

            }
          }
        } else if (this.prjct_profile_name === 'pro') {

          if (this.browserLang === 'it') {

            this.prjct_profile_name = projectProfileData.profile_name + ' Plan';

          } else {

            this.prjct_profile_name = 'Piano ' + projectProfileData.profile_name;
          }
        }

      }
    })
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
