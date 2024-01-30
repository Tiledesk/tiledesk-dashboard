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

@Component({
  selector: 'appdashboard-knowledge-bases',
  templateUrl: './knowledge-bases.component.html',
  styleUrls: ['./knowledge-bases.component.scss']
})
export class KnowledgeBasesComponent implements OnInit, OnDestroy {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean;
  typeKnowledgeBaseModal: string;
  addKnowledgeBaseModal = 'none';
  previewKnowledgeBaseModal = 'none';
  deleteKnowledgeBaseModal = 'none';
  baseModalDelete: boolean = false;
  baseModalPreview: boolean = false;
  secretsModal = 'none';
  missingGptkeyModal = 'none';
  showSpinner: boolean = true;
  buttonDisabled: boolean = true;
  addButtonDisabled: boolean = false;
  gptkeyVisible: boolean = false;

  //analytics
  CURRENT_USER: any;
  project: Project;
  project_name: string;
  id_project: string;
  profile_name: string;
  callingPage: string;

  kbFormUrl: FormGroup;
  kbFormContent: FormGroup;
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
    type: '',
    name: '',
    url: '',
    content: ''
  }


  // PREVIEW
  // question: string = "";
  // answer: string = "";
  // source_url: any;
  // searching: boolean = false;
  // error_answer: boolean = false;
  // show_answer: boolean = false;
  kbid_selected: any;

  interval_id;

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private kbService: KnowledgeBaseService,
    private projectService: ProjectService,
    public route: ActivatedRoute,
    private notify: NotifyService
  ) { }

  ngOnInit(): void {
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    //this.getKnowledgeBases();
    this.getKnowledgeBaseSettings();
    this.kbFormUrl = this.createConditionGroupUrl();
    this.kbFormContent = this.createConditionGroupContent();
    this.trackPage();
    this.getLoggedUser();
    this.getCurrentProject()
    this.getRouteParams()
  }

  ngOnDestroy(): void {
    clearInterval(this.interval_id);
  }

  getRouteParams() {
    this.route.params.subscribe((params) => {
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


  // ---------------- SERVICE FUNCTIONS --------------- // 
  /**
   * getKnowledgeBaseSettings
   */
  getKnowledgeBaseSettings() {
    this.kbService.getKbSettings().subscribe((kbSettings: KbSettings) => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings: ", kbSettings);
      this.kbSettings = kbSettings;
      this.addButtonDisabled = false;
      // if (this.kbSettings.kbs.length < kbSettings.maxKbsNumber) {
      //   this.addButtonDisabled = false;
      // } else {
      //   this.addButtonDisabled = true;
      // }
      this.checkAllStatuses();
      this.startPooling();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR get kbSettings: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings *COMPLETE*");
      this.showSpinner = false;
    })
  }

  /** 
   * saveKnowledgeBase 
   */
  saveKnowledgeBase(body) {
    // let body = {
    //   id: null,
    //   name: "",
    //   source: "",
    //   type: "",
    //   content: "",
    //   gptkey: this.kbSettings.gptkey,
    //   namespace: this.kbService.project_id 
    // }
    // if(type==='url'){
    //   body.name = this.newKb.name;
    //   body.source = this.newKb.url;
    //   body.type = "url";
    // }
    // else if(type==='text'){
    //   body.name = this.newKb.name;
    //   body.content = this.newKb.content;
    //   body.type = "text";
    // }
    console.log("body:",body);

    this.kbService.addNewKb(this.kbSettings._id, body).subscribe((kb: any) => {
      // console.log('[KNOWLEDGE BASES COMP] this.kbSettings addNewKb ', this.kbSettings)
      this.getKnowledgeBaseSettings();
      //let kb = savedSettings.kbs.find(kb => kb.url === this.newKb.url);
      let namespace_list = [this.kbSettings.id_project];
      if (!this.kbSettings.gptkey) {
        this.closeAddKnowledgeBaseModal();
        this.checkStatus(namespace_list, kb._id);
        setTimeout(() => {
          this.openMissingGptkeyModal();
        }, 600)
      } else {
        this.closeAddKnowledgeBaseModal();
        this.checkStatus(namespace_list, kb._id).then((response) => {
          if (response['status_code'] === 0) {
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
      this.trackUserActioOnKB('Added Knowledge Base', gptkey)
    })
  }

  /**
   * deleteKnowledgeBase
   * @param id 
   */
  deleteKnowledgeBase(id) {
    this.logger.log("[KNOWLEDGE BASES COMP] kb to delete id: ", id);
    this.kbService.deleteKb(this.kbSettings._id, id).subscribe((response) => {
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
  // ---------------- END SERVICE FUNCTIONS --------------- // 


  // ---------------- OPEN AI FUNCTIONS --------------- //
  /**
   * checkStatus
   * @param kb 
   * @returns 
   */
  checkStatus(namespace_list=[], id=null) {
    let data = {
      "namespace_list": [],
      "namespace": "",
      "id": ""
    }
    if(namespace_list.length>0){
      data.namespace_list = namespace_list;
    }
    if(id){
      data.id = id;
      data.namespace = namespace_list[0];
    }
    return new Promise((resolve, reject) => {
      this.openaiService.checkScrapingStatus(data).subscribe((response: any) => {
        // check by single kb
        if(response.status_code){
          resolve(response);
        } 
        // check by namespace
        else {
          // trasformo in array
          // let listOfKb = Object.values(response);
          resolve(response);
        }
      }, (error) => {
        this.logger.error(error);
        reject(null)
      })
    })
  }

  /**
   * runIndexing
   * @param kb 
   */
  runIndexing(kb) {
    // let data = {
    //   full_url: kb.url,
    //   gptkey: this.kbSettings.gptkey
    // }
    console.log('runIndexing:: ', kb);
    let data = {
      "id": kb._id,
      "source": kb.source,
      "type": kb.type,
      "content": kb.content,
      "namespace": kb.namespace
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
    }, () => {
      this.logger.log("start scraping *COMPLETE*");
    })
  }


  /**
   * submitQuestion
   */
  // submitQuestion(data) {
  //   let data = {
  //     question: this.question,
  //     kbid: this.kbid_selected.url,
  //     gptkey: this.kbSettings.gptkey
  //   }
  //   this.searching = true;
  //   this.show_answer = false;
  //   this.answer = null;
  //   this.source_url = null;
  //   this.openaiService.askGpt(data).subscribe((response: any) => {
  //     console.log("ask gpt preview response: ", response);
  //     if (response.success == false) {
  //       this.error_answer = true;
  //     } else {
  //       this.answer = response.answer;
  //       this.source_url = response.source_url;
  //     }
  //     this.show_answer = true;
  //     this.searching = false;
  //     setTimeout(() => {
  //       let element = document.getElementById("answer");
  //       element.classList.add('answer-active');
  //     }, (200));
  //   }, (error) => {
  //     this.logger.error("ERROR ask gpt: ", error);
  //     this.error_answer = true;
  //     this.show_answer = true;
  //     this.searching = false;
  //   }, () => {
  //     this.logger.log("ask gpt *COMPLETE*")
  //     this.searching = false;
  //   })
  // }

  // ---------------- END OPEN AI FUNCTIONS --------------- //

  createConditionGroupUrl(): FormGroup {
    const namePattern = /^[^&<>]{3,}$/;
    return this.formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      name: ['', [Validators.required, Validators.pattern(namePattern)]]
    })
  }

  createConditionGroupContent(): FormGroup {
    const contentPattern = /^[^&<>]{3,}$/;
    const namePattern = /^[^&<>]{3,}$/;
    return this.formBuilder.group({
      content: ['', [Validators.required, Validators.pattern(contentPattern)]],
      name: ['', [Validators.required, Validators.pattern(namePattern)]]
    })
  }

  onChangeInput(event, type): void {
    if(type === 'url'){
      if (this.kbFormUrl.valid) {
        this.buttonDisabled = false;
      } else {
        this.buttonDisabled = true;
      }
    } else if(type === 'text'){
      if (this.kbFormContent.valid) {
        this.buttonDisabled = false;
      } else {
        this.buttonDisabled = true;
      }
    }
  }

  // onInputPreviewChange() {
  //   let element = document.getElementById('enter-button')
  //   if (this.question !== "") {
  //     element.style.display = 'inline-block';
  //   } else {
  //     element.style.display = 'none';
  //   }
  // }

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

  // saveKnowledgeBaseSettings() {
  //   this.kbService.saveKbSettings(this.kbSettings).subscribe(((savedSettings) => {
  //     // console.log('[KNOWLEDGE BASES COMP] save kb this.kbSettings > gptkey: ', this.kbSettings.gptkey)
  //     // console.log('[KNOWLEDGE BASES COMP] save kb savedSettings: ', savedSettings)
  //     this.getKnowledgeBaseSettings();
  //     this.closeSecretsModal();
  //   }), (error) => {
  //     this.logger.error("[KNOWLEDGE BASES COMP] ERROR save kb settings: ", error);
  //   }, () => {
  //     this.logger.log("[KNOWLEDGE BASES COMP] save kb settings *COMPLETE*");
  //     let gptkey = "empty"
  //     if (this.kbSettings.gptkey !== "") {
  //       gptkey = 'filled'
  //     }
  //     // console.log("[KNOWLEDGE BASES COMP] gptkey ", gptkey)
  //     this.trackUserActioOnKB('Save Knowledge Base GPT-Key', gptkey)
  //   })
  // }


  /**
   * 
   */
  checkAllStatuses() {
    let namespace_list = [this.kbSettings.id_project];
    // console.log("---> checkAllStatuses:   ", namespace_list);
    this.checkStatus(namespace_list, null).then((response: any) => {
      const arrayOfKb = Object.entries(response).map(([key, value]) => ({ key, value: value }));
      arrayOfKb.forEach((element) => {
        console.log(`Chiave: ${element.key}, kb status: ${element.value['status_code']}`);
        let kb = this.kbSettings.kbs.find(obj => obj._id === element.key);
        if(kb){
          kb.status = element.value['status_code'];
        }
        console.log("---> oggettoDaModificare:   ", kb, element);
      });
      console.log("---> checkAllStatuses:   ", this.kbSettings.kbs);
    })
  }


  // checkAllStatuses() {
  //   // SCANDALOSO - DA ELIMINARE IL PRIMA POSSIBILE
  //   // INDAGARE CON PUGLIA AI
  //   // Anche perchè ogni tanto risponde con tutti status 0 anche con 500ms di delay
  //   let promises = [];
  //   for (let i = 0; i < this.kbSettings.kbs.length; i++) {
  //     const delay = 500 * i;
  //     let kb = this.kbSettings.kbs[i];
  //     setTimeout(() => {
  //       promises.push(this.checkStatus(kb).then((status_code: number) => {
  //         kb.status = status_code;
  //         i = i + 1;
  //       }).catch((err) => {
  //         this.logger.error("kb " + kb.url + " error: " + err);
  //       }))
  //     }, delay);
  //   }
  //   Promise.all(promises).then((response) => {
  //     this.logger.log("Promise All *COMPLETED* ", response);
  //   })
  // }


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

  openAddKnowledgeBaseModal(type?) {
    this.typeKnowledgeBaseModal = type;
    this.addKnowledgeBaseModal = 'block';
  }

  // openPreviewKnowledgeBaseModal(kb) {
  //   this.kbid_selected = kb;
  //   this.previewKnowledgeBaseModal = 'block';
  //   this.baseModalPreview = true;
  // }

  // openDeleteKnowledgeBaseModal(kb) {
  //   this.kbid_selected = kb;
  //   this.deleteKnowledgeBaseModal = 'block';
  //   this.baseModalDelete = true;
  // }


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
    // this.newKb = { name: '', url: '' }
  }



 

  closeSecretsModal() {
    this.secretsModal = 'none';
  }

  closeMissingGptkeyModal() {
    this.missingGptkeyModal = 'none';
  }


  closeDeleteKnowledgeBaseModal() {
    this.deleteKnowledgeBaseModal = 'none';
    this.baseModalDelete = false;
  }

  contactSalesForChatGptKey() {
    this.closeSecretsModal()
    window.open(`mailto:support@tiledesk.com?subject=I don't have a GPT-Key`);
  }


  // ************** DELETE **************** //
  onDeleteKnowledgeBase(id){
    this.deleteKnowledgeBase(id);
    this.baseModalDelete = false;
  }

  onOpenBaseModalDelete(kb){
    this.kbid_selected = kb;
    this.baseModalDelete = true;
  }
  // ************** PREVIEW **************** //

  onOpenBaseModalPreview(){
    console.log("onOpenBaseModalPreview:: ")
    //this.kbid_selected = kb;
    this.baseModalPreview = true;
  }

  onPreviewKnowledgeBase(){

  }

  // closePreviewKnowledgeBaseModal() {
  //   this.previewKnowledgeBaseModal = 'none';
  //   this.baseModalPreview = false;
  //   // this.question = "";
  //   // this.answer = "";
  //   // this.source_url = null;
  //   // this.searching = false;
  //   // this.error_answer = false;
  //   // this.show_answer = false;
  //   let element = document.getElementById('enter-button')
  //   element.style.display = 'none';
  // }



  // ************** CLOSE ALL MODAL **************** //
  onCloseBaseModal(){
    this.baseModalDelete = false;
    this.baseModalPreview = false;
  }




}
