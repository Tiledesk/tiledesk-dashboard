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
import { Router } from '@angular/router';
import { BrandService } from 'app/services/brand.service';

@Component({
  selector: 'appdashboard-knowledge-bases-previous',
  templateUrl: './knowledge-bases-previous.component.html',
  styleUrls: ['./knowledge-bases-previous.component.scss']
})

export class KnowledgeBasesPreviousComponent implements OnInit, OnDestroy {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean;

  addKnowledgeBaseModal = 'none';
  previewKnowledgeBaseModal = 'none';
  deleteKnowledgeBaseModal = 'none';
  secretsModal = 'none';
  missingGptkeyModal = 'none';
  showSpinner: boolean = true;
  buttonDisabled: boolean = true;
  addButtonDisabled: boolean = false;
  gptkeyVisible: boolean = false;
  companyNameParams: any;
  company_name: string;
  contactUsEmail: string;

  //analytics
  CURRENT_USER: any;
  project: Project;
  project_name: string;
  id_project: string;
  profile_name: string;
  callingPage: string;

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

  interval_id;
  displayContactUs: boolean;

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private kbService: KnowledgeBaseService,
    private projectService: ProjectService,
    public route: ActivatedRoute,
    private notify: NotifyService,
    private router: Router,
    public brandService: BrandService
  ) { 

    const brand = brandService.getBrand();
    this.company_name = brand['BRAND_NAME'];
    this.companyNameParams = { 'BRAND_NAME': this.company_name }
    this.contactUsEmail = brand['CONTACT_US_EMAIL'];
    this.displayContactUs=  brand['display_contact_us_email'];
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
    this.getRouteParams()
  }

  getRouteParams() {
    this.route.params.subscribe((params) => {
      // this.projectId = params.projectid
      this.logger.log('[KNOWLEDGE BASES COMP] - GET ROUTE PARAMS ', params);
      if (params.calledby && params.calledby === 'h') {
        this.callingPage = 'Home'
        this.logger.log('[KNOWLEDGE BASES COMP] - GET ROUTE PARAMS callingPage ', this.callingPage);
      } else if (!params.calledby) {
        this.callingPage = 'Knowledge Bases'
        this.logger.log('[KNOWLEDGE BASES COMP] - GET ROUTE PARAMS callingPage ', this.callingPage);
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
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[KNOWLEDGE BASES COMP] - LOGGED USER ', user)
      if (user) {
        this.CURRENT_USER = user

      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      this.logger.log('[KNOWLEDGE BASES COMP] - GET CURRENT PROJECT ', this.project)
      if (this.project) {
        this.project_name = project.name;
        this.id_project = project._id;
        this.getProjectById(this.id_project)
        this.logger.log('[KNOWLEDGE BASES COMP] - GET CURRENT PROJECT - PROJECT-NAME ', this.project_name, ' PROJECT-ID ', this.id_project)
      }
    });
  }

  getProjectById(projectId) {
    this.projectService.getProjectById(projectId).subscribe((project: any) => {
      this.logger.log('[KNOWLEDGE BASES COMP] - GET PROJECT BY ID - PROJECT: ', project);

      this.profile_name = project.profile.name
      this.logger.log('[KNOWLEDGE BASES COMP] - GET PROJECT BY ID - profile_name: ', this.profile_name);

    }, error => {
      this.logger.error('[KNOWLEDGE BASES COMP] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[KNOWLEDGE BASES COMP] - GET PROJECT BY ID * COMPLETE * ');

    });
  }

  startPooling() {
    this.interval_id = setInterval(() => {
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
      this.logger.log('[KNOWLEDGE BASES COMP] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }
  // UTILS FUNCTION - End
  // --------------------


  getKnowledgeBaseSettings() {
    this.kbService.getKbSettingsPrev().subscribe((kbSettings: KbSettings) => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings: ", kbSettings);
      this.kbSettings = kbSettings;
      if (this.kbSettings.kbs.length == 0){
        this.router.navigate(['project/' + this.id_project + '/knowledge-bases']);
        // this.router.navigate(['project/' + this.id_project + '/bots/my-chatbots/all']);
      }
      if (this.kbSettings.kbs.length < kbSettings.maxKbsNumber) {
        this.addButtonDisabled = false;
      } else {
        this.addButtonDisabled = true;
      }
      this.checkAllStatuses();
      //this.startPooling();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR get kbSettings: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings *COMPLETE*");
      this.showSpinner = false;
    })
  }

  createConditionGroup(): FormGroup {
    return this.formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
    })
  }

  onChangeInput(event): void {
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

  saveKnowledgeBase() {

    // let first_index = this.newKb.url.indexOf('://') + 3;
    // let second_index = this.newKb.url.indexOf('www.') + 4;
    // let split_index;
    // if (second_index > first_index) {
    //   split_index = second_index;
    // } else {
    //   split_index = first_index;
    // }
    // this.newKb.name = this.newKb.url.substring(split_index);
    let first_index = this.newKb.url.indexOf('://');
    let second_index = this.newKb.url.indexOf('www.');

    let split_index;
    if (first_index !== -1 || second_index !== -1) {
      if (second_index > first_index) {
        split_index = second_index + 4;
      } else {
        split_index = first_index + 3;
      }
      this.newKb.name = this.newKb.url.substring(split_index);
    } else {
      this.newKb.name = this.newKb.url;
    }

    this.kbService.addNewKbPrev(this.kbSettings._id, this.newKb).subscribe((savedSettings: KbSettings) => {
      // console.log('[KNOWLEDGE BASES COMP] this.kbSettings addNewKb ', this.kbSettings)
      this.getKnowledgeBaseSettings();
      let kb = savedSettings.kbs.find(kb => kb.url === this.newKb.url);

      if (!this.kbSettings.gptkey) {
        this.closeAddKnowledgeBaseModal();
        this.checkStatus(kb);
        setTimeout(() => {
          this.openMissingGptkeyModal();
        }, 600)

      } else {
        this.closeAddKnowledgeBaseModal();
        this.checkStatus(kb).then((status_code) => {
          if (status_code === 0) {
            this.runIndexing(kb);
          }
        })
      }
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR add new kb: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] add new kb *COMPLETED*");
      let gptkey = "empty"
      if (this.kbSettings.gptkey !== "") {
        gptkey = 'filled'
      }
      // console.log("[KNOWLEDGE BASES COMP] gptkey ", gptkey)
      this.trackUserActioOnKB('Added Knowledge Base', gptkey)
    })
  }

  trackUserActioOnKB(event: any, gptkey: string) {
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
            'page': this.callingPage,
            'gptkey': gptkey

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
    this.kbService.saveKbSettingsPrev(this.kbSettings).subscribe(((savedSettings) => {
      // console.log('[KNOWLEDGE BASES COMP] save kb this.kbSettings > gptkey: ', this.kbSettings.gptkey)
      // console.log('[KNOWLEDGE BASES COMP] save kb savedSettings: ', savedSettings)
      this.getKnowledgeBaseSettings();
      this.closeSecretsModal();
    }), (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR save kb settings: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] save kb settings *COMPLETE*");
      let gptkey = "empty"
      if (this.kbSettings.gptkey !== "") {
        gptkey = 'filled'
      }
      // console.log("[KNOWLEDGE BASES COMP] gptkey ", gptkey)
      this.trackUserActioOnKB('Save Knowledge Base GPT-Key', gptkey)
    })
  }

  deleteKnowledgeBase(id) {
    this.kbService.deleteKbPrev(this.kbSettings._id, id).subscribe((response) => {
      // console.log('[KNOWLEDGE BASES COMP] this.kbSettings delete > ', this.kbSettings.gptkey)
      this.getKnowledgeBaseSettings();
      this.closeDeleteKnowledgeBaseModal();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR delete kb: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] delete kb *COMPLETE*");
      let gptkey = "empty"
      if (this.kbSettings.gptkey !== "") {
        gptkey = 'filled'
      }
      // console.log("[KNOWLEDGE BASES COMP] gptkey ", gptkey)
      this.trackUserActioOnKB('Deleted Knowledge Base', gptkey)
    })
  }

  runIndexing(kb) {
    let data = {
      full_url: kb.url,
      gptkey: this.kbSettings.gptkey
    }
    this.openaiService.startScrapingPrev(data).subscribe((response: any) => {
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
      this.openaiService.checkScrapingStatusPrev(data).subscribe((response: any) => {
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

    this.answer = null;
    this.source_url = null;

    this.openaiService.askGptPrev(data).subscribe((response: any) => {
      this.logger.log("ask gpt preview response: ", response);
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
      this.error_answer = true;
      this.show_answer = true;
      this.searching = false;
    }, () => {
      this.logger.log("ask gpt *COMPLETE*")
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

  openAddKnowledgeBaseModal() {
    this.addKnowledgeBaseModal = 'block';
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
    this.missingGptkeyModal = 'none';
    setTimeout(() => {
      this.secretsModal = 'block';
      if (this.kbSettings.gptkey) {
        let el = <HTMLInputElement>document.getElementById('gptkey-key');
        el.type = "password"
        this.gptkeyVisible = false;
      } else {
        this.gptkeyVisible = true;
      }
    }, 600);
  }

  openMissingGptkeyModal() {
    this.missingGptkeyModal = 'block';
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

  closeMissingGptkeyModal() {
    this.missingGptkeyModal = 'none';
  }

  ngOnDestroy(): void {
    clearInterval(this.interval_id);
  }
  
  contactUsForChatGptKey() {
    this.closeSecretsModal()
    window.open(`mailto:${this.contactUsEmail}?subject=I don't have a GPT-Key`);
  }


}
