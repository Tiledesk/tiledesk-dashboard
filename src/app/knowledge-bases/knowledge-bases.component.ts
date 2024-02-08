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
import { timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

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
  baseModalError: boolean = false;
  baseModalDetail: boolean = false;

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
  errorMessage: string;

  kbFormUrl: FormGroup;
  kbFormContent: FormGroup;
  kbsList = [];
  refreshKbsList: boolean = true;

  // PREVIEW
  // question: string = "";
  // answer: string = "";
  // source_url: any;
  // searching: boolean = false;
  // error_answer: boolean = false;
  // show_answer: boolean = false;
  kbid_selected: any;
  interval_id;


  // messages
  msgSuccesUpdateKb: string; // 'KB modificato con successo';
  msgSuccesAddKb: string; // = 'KB aggiunto con successo';
  msgSuccesDeleteKb: string; // = 'KB eliminato con successo';
  msgErrorDeleteKb: string; // = 'Non è stato possibile eliminare il kb';
  msgErrorIndexingKb: string; // = 'Indicizzazione non riuscita';
  msgSuccesIndexingKb: string; // = 'Indicizzazione terminata con successo';
  msgErrorAddUpdateKb: string; // = 'Non è stato possibile aggiungere o modificare il kb';

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private kbService: KnowledgeBaseService,
    private projectService: ProjectService,
    public route: ActivatedRoute,
    private router: Router,
    private notify: NotifyService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadKbSettings();
    this.getBrowserVersion();
    this.getTranslations();
    this.listenSidebarIsOpened();
    // this.getListOfKb();
    // this.kbFormUrl = this.createConditionGroupUrl();
    // this.kbFormContent = this.createConditionGroupContent();
    // this.trackPage();
    // this.getLoggedUser();
    // this.getCurrentProject();
    // this.getRouteParams();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval_id);
  }

  loadKbSettings(){
    this.kbService.getKbSettings().subscribe((kb: any) => {
      if(kb.kbs && kb.kbs.length>0){
        console.log('REDIRECT getKbSettings'+kb.kbs);
        this.router.navigate(['project/' + this.id_project + '/knowledge-bases-pre']);
      }
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR get kbSettings: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings *COMPLETE*");
    })
  }


  getTranslations() {
    this.translate.get('KbPage')
      .subscribe((KbPage: any) => {
        this.msgSuccesUpdateKb = KbPage['msgSuccesUpdateKb'];
        this.msgSuccesAddKb = KbPage['msgSuccesAddKb'];
        this.msgSuccesDeleteKb = KbPage['msgSuccesDeleteKb'];
        this.msgErrorDeleteKb = KbPage['msgErrorDeleteKb'];
        this.msgErrorIndexingKb = KbPage['msgErrorIndexingKb'];
        this.msgSuccesIndexingKb = KbPage['msgSuccesIndexingKb'];
        this.msgErrorAddUpdateKb = KbPage['msgErrorAddUpdateKb'];
      });
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

  // startPooling() {
  //   this.interval_id = setInterval(() => {
  //     this.checkAllStatuses();
  //   }, 30000);
  // }

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
   * getListOfKb
   */
  getListOfKb() {
    this.logger.log("[KNOWLEDGE BASES COMP] getListOfKb ");
    this.kbService.getListOfKb().subscribe((kbList:[KB]) => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbList: ", kbList);
      this.kbsList = kbList;
      this.checkAllStatuses();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR get kbSettings: ", error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings *COMPLETE*");
      this.showSpinner = false;
    })
  }

  // /**
  //  * getKnowledgeBaseSettings
  //  */
  // getKnowledgeBaseSettings() {
  //   this.kbService.getKbSettings().subscribe((kbSettings: KbSettings) => {
  //     this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings: ", kbSettings);
  //     // this.kbSettings = kbSettings;
  //     this.kbsList = kbSettings.kbs;
  //   }, (error) => {
  //     this.logger.error("[KNOWLEDGE BASES COMP] ERROR get kbSettings: ", error);
  //   }, () => {
  //     this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings *COMPLETE*");
  //     this.showSpinner = false;
  //   })
  // }

  /**
   * onAddKb
   */
  onAddKb(body) {
    // console.log("body:",body);
    this.onCloseBaseModal();
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addKb(body).subscribe((resp: any) => {
      let kb = resp.value;
      console.log("onAddKb:", kb);
      if(kb.lastErrorObject && kb.lastErrorObject.updatedExisting === true){
        const index = this.kbsList.findIndex(item => item._id === kb._id);
        if (index !== -1) {
          this.kbsList[index] = kb;
          this.notify.showWidgetStyleUpdateNotification(this.msgSuccesUpdateKb, 2, 'done');
        }
      } else {
        this.kbsList.push(kb);
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesAddKb, 2, 'done');
      }
      this.updateStatusOfKb(kb._id, 0);
      this.refreshKbsList = !this.refreshKbsList;
      // console.log("kbsList:",that.kbsList);
      // that.onRunIndexing(kb);
      setTimeout(() => {
        this.checkStatusWithRetry(kb);
      }, 2000);
      //that.onCloseBaseModal();
    }, (err) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR add new kb: ", err);
      this.onOpenErrorModal(error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] add new kb *COMPLETED*");
      //this.trackUserActioOnKB('Added Knowledge Base', gptkey)
    })
  }

  /**
   * onDeleteKb
   */
  onDeleteKb(kb) {
    let data = {
      "id": kb._id,
      "namespace": kb.id_project
    }
    // console.log("[KNOWLEDGE BASES COMP] kb to delete id: ", data);
    this.onCloseBaseModal();
    let error = this.msgErrorDeleteKb; //"Non è stato possibile eliminare il kb";
    this.kbService.deleteKb(data).subscribe((response:any) => {
      console.log('onDeleteKb:: ', response);
      if(!response || (response.success && response.success === false)){
        this.updateStatusOfKb(kb._id, 0);
        this.onOpenErrorModal(error);
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesDeleteKb, 2, 'done');
        // let error = response.error?response.error:"Errore generico";
        // this.onOpenErrorModal(error);
        this.removeKb(kb._id);
      }
    }, (err) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR delete kb: ", err);
      this.onOpenErrorModal(error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] delete kb *COMPLETE*");
      //this.trackUserActioOnKB('Deleted Knowledge Base', gptkey)
    })
  }
  // ---------------- END SERVICE FUNCTIONS --------------- // 


  // ---------------- OPEN AI FUNCTIONS --------------- //

  checkStatusWithRetry(kb) {
    let data = {
      "namespace_list": [],
      "namespace": this.id_project,
      "id": kb._id
    }
    this.openaiService.checkScrapingStatus(data).subscribe((response: any) => {
      // console.log('Risposta ricevuta:', response);
      if(response.status_code && response.status_code == -1){
        // console.log('risorsa non indicizzata');
        // this.onRunIndexing(kb);
        // this.checkStatusWithRetry(kb);
      } else if(response.status_code == -1 || response.status_code == 0 || response.status_code == 2){
        // console.log('riprova tra 10 secondi...');
        this.updateStatusOfKb(kb._id, response.status_code);
        timer(10000).subscribe(() => {
          this.checkStatusWithRetry(kb);
        });
      } else { // status == 3 || status == 4
        // console.log('Risposta corretta:', response.status_code);
        this.updateStatusOfKb(kb._id, response.status_code);
      }
    },
    error => {
      console.error('Error: ', error);
      this.updateStatusOfKb(kb._id, -2);
    });
  }

  /**
   * updateStatusOfKb
   */
  private updateStatusOfKb(kb_id, status_code){
    let kb = this.kbsList.find(item => item._id === kb_id);
    if(kb)kb.status = status_code;
    // console.log('AGGIORNO updateStatusOfKb:', kb_id, status_code, kb);
  }

  private removeKb(kb_id){
    this.kbsList = this.kbsList.filter(item => item._id !== kb_id);
    // console.log('AGGIORNO kbsList:', this.kbsList);
  }


  /**
   * runIndexing
   */
  onRunIndexing(kb) {
    let data = {
      "id": kb._id,
      "source": kb.source,
      "type": kb.type,
      "content": kb.content?kb.content:'',
      "namespace": this.id_project 
    }
    this.updateStatusOfKb(kb._id, 0);
    this.openaiService.startScraping(data).subscribe((response: any) => {
      this.logger.log("start scraping response: ", response);
      if (response.error) {
        this.notify.showWidgetStyleUpdateNotification(this.msgErrorIndexingKb, 4, 'report_problem');
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesIndexingKb, 2, 'done');
        this.checkStatusWithRetry(kb);
      }
    }, (error) => {
      this.logger.error("error start scraping response: ", error);
    }, () => {
      this.logger.log("start scraping *COMPLETE*");
    })
  }

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

  /**
   * 
   */
  checkAllStatuses() {
    this.kbsList.forEach(kb => {
      //if(kb.status == -1){
      //   this.onRunIndexing(kb);
      //} else 
      if(kb.status == -1 || kb.status == 0 || kb.status == 2) {
        this.checkStatusWithRetry(kb);
      }
    });
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
      // if (this.kbSettings.gptkey) {
      //   let el = <HTMLInputElement>document.getElementById('gptkey-key');
      //   el.type = "password"
      //   this.gptkeyVisible = false;
      // } else {
      //   this.gptkeyVisible = true;
      // }
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
  onDeleteKnowledgeBase(kb){
    this.onDeleteKb(kb);
    //this.baseModalDelete = false;
  }

  onOpenBaseModalDelete(kb){
    this.kbid_selected = kb;
    this.baseModalDelete = true;
  }
  // ************** PREVIEW **************** //

  onOpenBaseModalDetail(kb){
    this.kbid_selected = kb;
    console.log('onOpenBaseModalDetail:: ', this.kbid_selected);
    this.baseModalDetail=true;
  }

  onOpenBaseModalPreview(){
    // console.log("onOpenBaseModalPreview:: ")
    //this.kbid_selected = kb;
    this.baseModalPreview = true;
  }



  onOpenErrorModal(response){
    this.errorMessage = response;
    this.baseModalError = true;
  }



  // ************** CLOSE ALL MODAL **************** //
  onCloseBaseModal(){
    this.baseModalDelete = false;
    this.baseModalPreview = false;
    this.baseModalError = false;
    this.baseModalDetail = false;
    this.typeKnowledgeBaseModal = '';
  }




}
