import { Component, OnDestroy, OnInit, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { Project } from 'app/models/project-model';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';
import { ProjectService } from 'app/services/project.service';
import { KbBaseComponent } from './kb-base/kb-base.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog';
import { KbModalComponent } from './kb-modal/kb-modal.component';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';

@Component({
  selector: 'appdashboard-knowledge-bases',
  templateUrl: './knowledge-bases.component.html',
  styleUrls: ['./knowledge-bases.component.scss']
})
// extends KbBaseComponent
export class KnowledgeBasesComponent extends PricingBaseComponent implements OnInit, OnDestroy {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean;
  private unsubscribe$: Subject<any> = new Subject<any>();

  addKnowledgeBaseModal = 'none';
  previewKnowledgeBaseModal = 'none';
  deleteKnowledgeBaseModal = 'none';
  secretsModal = 'none';
  showSpinner: boolean = true;
  buttonDisabled: boolean = true;
  addButtonDisabled: boolean = false;
  gptkeyVisible: boolean = false;
  CURRENT_USER: any;
  project: Project;
  project_name: string;
  id_project: string;
  profile_name: string;
  callingPage: string;
  USER_ROLE: string;
  kbCount: number;

  kbForm: FormGroup;
  kbsList = [];

  kbSettings: KbSettings = {
    _id: null,
    id_project: null,
    gptkey: null,
    maxKbsNumber: null,
    maxPagesNumber: null,
    kbs: []
  }
  newKb: KB = {
    _id: null,
    name: '',
    url: ''
  }

  // PREVIEW
  question: string = "";
  answer: string = "";
  source_url: any;
  searching: boolean = false;
  error_answer: boolean = false;
  show_answer: boolean = false;
  kbid_selected: any;


  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private kbService: KnowledgeBaseService,
    private projectService: ProjectService,
    public route: ActivatedRoute,
    public notify: NotifyService,
    public prjctPlanService: ProjectPlanService,
    public usersService: UsersService,
    public dialog: MatDialog,
  ) {
    super(prjctPlanService, notify);
  }

  ngOnInit(): void {

    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    //this.getKnowledgeBases();
    this.getKnowledgeBaseSettings();
    this.kbForm = this.createConditionGroup();
    this.trackPage();
    this.getLoggedUser();
    this.getCurrentProject()
    this.getRouteParams();
    this.getProjectPlan();
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getRouteParams() {
    this.route.params.subscribe((params) => {
      // this.projectId = params.projectid
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ROUTE PARAMS ', params);
      if (params.calledby && params.calledby === 'h') {
        this.callingPage = 'Home'
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ROUTE PARAMS callingPage ', this.callingPage);
      } else if (!params.calledby) {
        this.callingPage = 'Knowledge Bases'
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ROUTE PARAMS callingPage ', this.callingPage);
      }
    })
  }

  trackPage() {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Knowledge Bases Page", {

          });
        } catch (err) {
          this.logger.error('Signin page error', err);
        }
      }
    }
  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[KNOWLEDGE-BASES-COMP] - LOGGED USER ', user)
        if (user) {
          this.CURRENT_USER = user
        }
      });
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {

        this.logger.log('[BOTS-LIST] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        this.project = project
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CURRENT PROJECT ', this.project)
        if (this.project) {
          this.project_name = project.name;
          this.id_project = project._id;
          this.getProjectById(this.id_project)
          this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CURRENT PROJECT - PROJECT-NAME ', this.project_name, ' PROJECT-ID ', this.id_project)
        }
      });
  }

  getProjectById(projectId) {
    this.projectService.getProjectById(projectId).subscribe((project: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - PROJECT: ', project);

      this.profile_name = project.profile.name
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - profile_name: ', this.profile_name);

    }, error => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID * COMPLETE * ');

    });
  }

  startPooling() {
    let id = setInterval(() => {
      this.checkAllStatuses();
    }, 30000);
  }

  // ----------------------
  // UTILS FUNCTION - Start
  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }
  // UTILS FUNCTION - End
  // --------------------


  getKnowledgeBaseSettings() {
    this.kbService.getKbSettings().subscribe((kbSettings: KbSettings) => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] get kbSettings: ", kbSettings);
      this.kbSettings = kbSettings;
      if (this.kbSettings) {
        this.kbCount = this.kbSettings.kbs.length
        console.log("[KNOWLEDGE-BASES-COMP] KbCount: ", this.kbCount);
      }

      // if (this.kbSettings.kbs.length < kbSettings.maxKbsNumber) {

      // if (this.kbSettings.kbs.length < this.kbLimit) {

      //   this.addButtonDisabled = false;
      // } else {
      //   this.addButtonDisabled = true;
      // }
      this.checkAllStatuses();
      this.startPooling();
    }, (error) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR get kbSettings: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] get kbSettings *COMPLETE*");
      this.showSpinner = false;

    })
  }

  createConditionGroup(): FormGroup {
    return this.formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
    })
  }

  onChangeInput(event): void {
    console.log( '[KNOWLEDGE-BASES-COMP] onChangeInput this.kbForm.valid ', this.kbForm.valid)
    if (this.kbForm.valid) {
      this.buttonDisabled = false;
    } else {
      this.buttonDisabled = true;
    }
  }

  onInputPreviewChange() {
    let element = document.getElementById('enter-button')
    if (this.question !== "") {
      element.style.display = 'inline-block';
    } else {
      element.style.display = 'none';
    }
  }

  openAddKnowledgeBaseModal() {
    console.log('[KNOWLEDGE-BASES-COMP] KB Lenght ', this.kbSettings.kbs.length)
    console.log('[KNOWLEDGE-BASES-COMP] KB Limit ', this.kbLimit)
    if (this.USER_ROLE !== 'agent') {
      if (this.kbLimit) {
        if (this.kbCount < this.kbLimit) {
          this.addKnowledgeBaseModal = 'block';
        } else if (this.kbSettings.kbs.length >= this.kbLimit) {

          this.presentDialogReachedKbLimit()
        }
      } else if (!this.kbLimit) {
        this.addKnowledgeBaseModal = 'block';
      }
    } else if (this.USER_ROLE === 'agent') {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  presentDialogReachedKbLimit() {
    console.log('[KNOWLEDGE-BASES-COMP] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
    const dialogRef = this.dialog.open(KbModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: {
        projectProfile: this.prjct_profile_name,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`[KNOWLEDGE-BASES-COMP] Dialog result: ${result}`);
    });
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan('Agents can\'t manage chatbots', 'Learn more about default roles')
  }

  saveKnowledgeBase() {
    // this.closeAddKnowledgeBaseModal();
    let first_index = this.newKb.url.indexOf('://');
    let second_index = this.newKb.url.indexOf('www.');

    let split_index;
    if (first_index !== -1 || first_index !== -1) {
      if (second_index > first_index) {
        split_index = second_index + 4;
      } else {
        split_index = first_index + 3;
      }
      this.newKb.name = this.newKb.url.substring(split_index);
    } else {
      this.newKb.name = this.newKb.url;
    }

    this.kbService.addNewKb(this.kbSettings._id, this.newKb).subscribe((savedSettings: KbSettings) => {
      console.log('[KNOWLEDGE-BASESCOMP] savedSettings' , savedSettings) 
      this.runIndexing(this.newKb);
      this.getKnowledgeBaseSettings();
      let kb = savedSettings.kbs.find(kb => kb.url === this.newKb.url);
      this.checkStatus(kb).then((status_code) => {
        if (status_code === 0) {
          this.runIndexing(kb);
        }
        this.closeAddKnowledgeBaseModal();
      })
    }, (error) => {
      this.logger.error("[KNOWLEDGE-BASESCOMP] ERROR add new kb: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE-BASESCOMP] add new kb *COMPLETED*");

      this.trackUserActioOnKB('Added Knowledge Base')
    })
  }

  trackUserActioOnKB(event) {
    if (!isDevMode()) {
      if (window['analytics']) {
        let userFullname = ''
        if (this.CURRENT_USER.firstname && this.CURRENT_USER.lastname) {
          userFullname = this.CURRENT_USER.firstname + ' ' + this.CURRENT_USER.lastname
        } else if (this.CURRENT_USER.firstname && !this.CURRENT_USER.lastname) {
          userFullname = this.CURRENT_USER.firstname
        }

        try {
          window['analytics'].identify(this.CURRENT_USER._id, {
            name: userFullname,
            email: this.CURRENT_USER.email,
            plan: this.profile_name

          });
        } catch (err) {
          this.logger.error('identify Invite Sent Profile error', err);
        }

        try {
          window['analytics'].track(event, {
            "type": "organic",
            "username": userFullname,
            "email": this.CURRENT_USER.email,
            'userId': this.CURRENT_USER._id,
            'page': this.callingPage

          }, {
            "context": {
              "groupId": this.id_project
            }
          });
        } catch (err) {
          this.logger.error('track Invite Sent event error', err);
        }

        try {
          window['analytics'].group(this.id_project, {
            name: this.project_name,
            plan: this.profile_name + ' plan',
          });
        } catch (err) {
          this.logger.error('group Invite Sent error', err);
        }
      }
    }

  }



  saveKnowledgeBaseSettings() {
    this.kbService.saveKbSettings(this.kbSettings).subscribe(((savedSettings) => {
      this.getKnowledgeBaseSettings();
      this.closeSecretsModal();
    }), (error) => {
      this.logger.error("[KNOWLEDGE-BASESCOMP] ERROR save kb settings: ", error);
    }, () => {
      this.logger.info("[KNOWLEDGE-BASES-COMP] save kb settings *COMPLETE*");
    })
  }

  deleteKnowledgeBase(id) {
    this.logger.debug("[KNOWLEDGE-BASES-COMP] kb to delete id: ", id);
    this.kbService.deleteKb(this.kbSettings._id, id).subscribe((response) => {
      this.getKnowledgeBaseSettings();
      this.closeDeleteKnowledgeBaseModal();
    }, (error) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR delete kb: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] delete kb *COMPLETE*");
      this.trackUserActioOnKB('Deleted Knowledge Base')
    })
  }

  runIndexing(kb) {
    let data = {
      full_url: kb.url,
      gptkey: this.kbSettings.gptkey
    }
    this.openaiService.startScraping(data).subscribe((response: any) => {
      this.logger.log("start scraping response: ", response);

      if (response.message && response.message === "Invalid Openai API key") {
        this.notify.showWidgetStyleUpdateNotification("Invalid Openai API key", 4, 'report_problem');
      }
      setTimeout(() => {
        this.checkStatus(kb).then((status_code: number) => {
          kb.status = status_code;
        })
      }, 1000);
    }, (error) => {
      this.logger.error("error start scraping response: ", error);
      if (error && error[1].error) {
        console.log('error[1].error statusText ', error[1].error.statusText)
      }
      // this.notify.showWidgetStyleUpdateNotification("Invalid Openai API key", 4, 'report_problem');
    }, () => {
      this.logger.log("start scraping *COMPLETE*");
    })
  }

  checkAllStatuses() {

    // SCANDALOSO - DA ELIMINARE IL PRIMA POSSIBILE
    // INDAGARE CON PUGLIA AI
    // Anche perchè ogni tanto risponde con tutti status 0 anche con 500ms di delay
    let promises = [];
    for (let i = 0; i < this.kbSettings.kbs.length; i++) {
      const delay = 500 * i;
      let kb = this.kbSettings.kbs[i];

      setTimeout(() => {
        promises.push(this.checkStatus(kb).then((status_code: number) => {
          kb.status = status_code;
          i = i + 1;
        }).catch((err) => {
          this.logger.error("kb " + kb.url + " error: " + err);
        }))
      }, delay);
    }

    Promise.all(promises).then((response) => {
      this.logger.log("Promise All *COMPLETED* ", response);
    })

  }

  checkStatus(kb) {
    let data = {
      "full_url": kb.url
    }
    return new Promise((resolve, reject) => {
      this.openaiService.checkScrapingStatus(data).subscribe((response: any) => {
        console.log()
        resolve(response.status_code);
      }, (error) => {
        this.logger.error(error);
        reject(null)
      })
    })
  }

  submitQuestion() {
    let data = {
      question: this.question,
      kbid: this.kbid_selected.url,
      gptkey: this.kbSettings.gptkey
    }

    this.searching = true;
    this.show_answer = false;
    this.error_answer = false;
    this.answer = null;
    this.source_url = null;

    this.openaiService.askGpt(data).subscribe((response: any) => {
      if (response.success == false) {
        this.error_answer = true;
      } else {
        this.answer = response.answer;
        this.source_url = response.source_url;
      }

      this.show_answer = true;
      this.searching = false;
      setTimeout(() => {
        let element = document.getElementById("answer");
        element.classList.add('answer-active');
      }, (200));
    }, (error) => {
      this.logger.error("ERROR ask gpt: ", error);
      this.searching = false;
    }, () => {
      this.logger.info("ask gpt *COMPLETE*")
      this.searching = false;
    })
  }

  showHideSecret(target) {
    this.gptkeyVisible = !this.gptkeyVisible;
    // let el = <HTMLInputElement>document.getElementById(target);
    // if (el.type === "password") {
    //   this.gptkeyVisible = true;
    //   el.type = "text";
    // } else {
    //   this.gptkeyVisible = false;
    //   el.type = "password"
    // }
  }



  openPreviewKnowledgeBaseModal(kb) {
    this.kbid_selected = kb;
    this.previewKnowledgeBaseModal = 'block';

  }

  openDeleteKnowledgeBaseModal(kb) {
    this.kbid_selected = kb;
    this.deleteKnowledgeBaseModal = 'block';
  }

  openSecretsModal() {
    this.secretsModal = 'block';
    if (this.kbSettings.gptkey) {
      let el = <HTMLInputElement>document.getElementById('gptkey-key');
      el.type = "password"
      this.gptkeyVisible = false;
    } else {
      this.gptkeyVisible = true;
    }
  }

  closeAddKnowledgeBaseModal() {
    this.addKnowledgeBaseModal = 'none';
    this.newKb = { name: '', url: '' }
  }

  closePreviewKnowledgeBaseModal() {
    this.previewKnowledgeBaseModal = 'none';
    this.question = "";
    this.answer = "";
    this.source_url = null;
    this.searching = false;
    this.error_answer = false;
    this.show_answer = false;
    let element = document.getElementById('enter-button')
    element.style.display = 'none';
  }

  closeDeleteKnowledgeBaseModal() {
    this.deleteKnowledgeBaseModal = 'none';
  }

  closeSecretsModal() {
    this.secretsModal = 'none';
  }

}