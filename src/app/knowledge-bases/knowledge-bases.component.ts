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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KB_DEFAULT_PARAMS } from 'app/utils/util';

//import { Router } from '@angular/router';

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
  // SHOW_TABLE: boolean = false;
  CURRENT_USER: any;
  project: Project;
  project_name: string;
  id_project: string;
  profile_name: string;
  callingPage: string;
  errorMessage: string;

  kbFormUrl: FormGroup;
  kbFormContent: FormGroup;

  // kbs: any;
  kbsList: Array<any>;
  kbsListCount: number = 0;
  refreshKbsList: boolean = true;
  numberPage: number = 0;


  kbid_selected: any;
  interval_id;
  ARE_NEW_KB: boolean

  // messages
  msgSuccesUpdateKb: string; // 'KB modificato con successo';
  msgSuccesAddKb: string; // = 'KB aggiunto con successo';
  msgSuccesDeleteKb: string; // = 'KB eliminato con successo';
  msgErrorDeleteKb: string; // = 'Non è stato possibile eliminare il kb';
  msgErrorIndexingKb: string; // = 'Indicizzazione non riuscita';
  msgSuccesIndexingKb: string; // = 'Indicizzazione terminata con successo';
  msgErrorAddUpdateKb: string; // = 'Non è stato possibile aggiungere o modificare il kb';


  allTemplatesCount: number;
  allCommunityTemplatesCount: number;
  customerSatisfactionTemplatesCount: number;
  increaseSalesTemplatesCount: number;
  customerSatisfactionBotsCount: number;
  myChatbotOtherCount: number;
  increaseSalesBotsCount: number;
  listSitesOfSitemap: any = [];

  private unsubscribe$: Subject<any> = new Subject<any>();
  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private kbService: KnowledgeBaseService,
    private projectService: ProjectService,
    public route: ActivatedRoute,
    //private router: Router,
    private notify: NotifyService,
    private translate: TranslateService,
    private faqKbService: FaqKbService,
  ) { }

  ngOnInit(): void {
    this.kbsList = [];
    this.getBrowserVersion();
    this.getTranslations();
    this.listenSidebarIsOpened();
    let paramsDefault = "?limit="+KB_DEFAULT_PARAMS.LIMIT+"&page="+KB_DEFAULT_PARAMS.NUMBER_PAGE+"&sortField="+KB_DEFAULT_PARAMS.SORT_FIELD+"&direction="+KB_DEFAULT_PARAMS.DIRECTION;
    this.getListOfKb(paramsDefault);
    this.kbFormUrl = this.createConditionGroupUrl();
    this.kbFormContent = this.createConditionGroupContent();
    this.trackPage();
    this.getLoggedUser();
    this.getCurrentProject();
    this.getRouteParams();
    this.listenToKbVersion();
    this.getTemplates();
    this.getCommunityTemplates()
    this.getFaqKbByProjectId();
  }



  ngOnDestroy(): void {
    clearInterval(this.interval_id);
  }

  listenToKbVersion() {
    this.kbService.newKb
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((newKb) => {
        this.logger.log('[SETTINGS-SIDEBAR] - are new KB ', newKb)
        this.ARE_NEW_KB = newKb;
      })
  }

  getTemplates() {
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        const templates = res
        //  this.logger.log('[BOTS-LIST] - GET ALL TEMPLATES', templates);
        this.allTemplatesCount = templates.length;
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);

        // ---------------------------------------------------------------------
        // Customer Satisfaction templates
        // ---------------------------------------------------------------------
        const customerSatisfactionTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('KNOWLEDGE-BASES-COMP] - Customer Satisfaction TEMPLATES', customerSatisfactionTemplates);
        if (customerSatisfactionTemplates) {
          this.customerSatisfactionTemplatesCount = customerSatisfactionTemplates.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
        }

        // ---------------------------------------------------------------------
        // Customer Increase Sales
        // ---------------------------------------------------------------------
        const increaseSalesTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        //  this.logger.log('[BOTS-LIST] - Increase Sales TEMPLATES', increaseSalesTemplates);
        if (increaseSalesTemplates) {
          this.increaseSalesTemplatesCount = increaseSalesTemplates.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Increase Sales COUNT', this.increaseSalesTemplatesCount);
        }
      }

    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] GET TEMPLATES ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] GET TEMPLATES COMPLETE');
      // this.showSpinner = false;
      // this.generateTagsBackground(this.templates)
    });
  }

  getCommunityTemplates() {

    this.faqKbService.getCommunityTemplates().subscribe((res: any) => {
      if (res) {
        const communityTemplates = res
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET COMMUNITY TEMPLATES', communityTemplates);
        this.allCommunityTemplatesCount = communityTemplates.length;
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET COMMUNITY TEMPLATES COUNT', this.allCommunityTemplatesCount);
      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP]  GET COMMUNITY TEMPLATES ERROR ', error);

    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP]  GET COMMUNITY TEMPLATES COMPLETE');

    });
  }

  getFaqKbByProjectId() {
    this.showSpinner = true
    // this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET BOTS BY PROJECT ID', faqKb);
      if (faqKb) {

        // this.faqkbList = faqKb;
        // this.chatBotCount = faqKb.length;
       

        this.myChatbotOtherCount = faqKb.length

        // ---------------------------------------------------------------------
        // Bot forked from Customer Satisfaction templates
        // ---------------------------------------------------------------------
        let customerSatisfactionBots = faqKb.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('[KNOWLEDGE-BASES-COMP] - Customer Satisfaction BOTS', customerSatisfactionBots);
        if (customerSatisfactionBots) {
          this.customerSatisfactionBotsCount = customerSatisfactionBots.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
        }


        // ---------------------------------------------------------------------
        // Bot forked from Customer Increase Sales
        // ---------------------------------------------------------------------
         let increaseSalesBots = faqKb.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        this.logger.log('[KNOWLEDGE-BASES-COMP] - Increase Sales BOTS ', increaseSalesBots);
        if (increaseSalesBots) {
          this.increaseSalesBotsCount = increaseSalesBots.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Increase Sales BOTS COUNT', this.increaseSalesTemplatesCount);
        }

        // this.route = this.router.url
        // if (this.route.indexOf('/bots/my-chatbots/all') !== -1) {
        //   this.faqkbList = this.faqkbList
        //   this.logger.log('[BOTS-LIST] ROUTE my-chatbots/all');
        // } else if (this.route.indexOf('/bots/my-chatbots/customer-satisfaction') !== -1) {
        //   this.faqkbList = this.customerSatisfactionBots
        //   this.logger.log('[BOTS-LIST] ROUTE my-chatbots/customer-satisfaction faqkbList ', this.faqkbList);
        // } else if (this.route.indexOf('/bots/my-chatbots/increase-sales') !== -1) {
        //   this.faqkbList = this.increaseSalesBots
        //   this.logger.log('[BOTS-LIST] ROUTE my-chatbots/increase-sales faqkbList ', this.faqkbList);
        // }



       
      }

      /* this.showSpinner = false moved in getAllFaqByFaqKbId:
       * in this callback stop the spinner only if there isn't faq-kb and
       * if there is an error */
      // this.showSpinner = false;
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] GET BOTS ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] GET BOTS COMPLETE');
      // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
      this.showSpinner = false;
      // this.getAllFaqByFaqKbId();
    });

  }

  

  // loadKbSettings(){
  //   this.kbService.getKbSettings().subscribe((kb: any) => {
  //     if(kb.kbs && kb.kbs.length>0){
  //       this.logger.log('REDIRECT getKbSettings'+kb.kbs);
  //       this.router.navigate(['project/' + this.id_project + '/knowledge-bases-pre']);
  //     }
  //   }, (error) => {
  //     this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR get kbSettings: ", error);
  //   }, () => {
  //     this.logger.log("[KNOWLEDGE-BASES-COMP] get kbSettings *COMPLETE*");
  //   })
  // }


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
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - LOGGED USER ', user)
      if (user) {
        this.CURRENT_USER = user
      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
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
      this.logger.log('[KNOWLEDGE-BASES-COMP] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }
  // UTILS FUNCTION - End
  // --------------------


  // ---------------- SERVICE FUNCTIONS --------------- // 
  
  /**
   * getListOfKb
   */
  // getListOfKb() {
  //   this.logger.log("[KNOWLEDGE-BASES-COMP] getListOfKb ");
  //   this.kbService.getListOfKb().subscribe((kbList:[KB]) => {
  //     this.logger.log("[KNOWLEDGE-BASES-COMP] get kbList: ", kbList);
  //     this.kbsList = kbList;
  //     this.checkAllStatuses();
  //   }, (error) => {
  //     this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR get kbSettings: ", error);
  //   }, () => {
  //     this.logger.log("[KNOWLEDGE-BASES-COMP] get kbSettings *COMPLETE*");
  //     this.showSpinner = false;
  //   })
  // }

  onLoadPage(searchParams){
    // console.log('onLoadNextPage:',searchParams);
    let params = "?limit="+KB_DEFAULT_PARAMS.LIMIT
    //if(searchParams?.page){
      let limitPage = Math.floor(this.kbsListCount/KB_DEFAULT_PARAMS.LIMIT);
      this.numberPage++;
      if(this.numberPage>limitPage)this.numberPage = limitPage;
      params +="&page="+this.numberPage;
    // } else {
    //   +"&page=0";
    // }
    if(searchParams?.status){
      params +="&status="+searchParams.status;
    }
    if(searchParams?.search){
      params +="&search="+searchParams.search;
    }
    if(searchParams?.sortField){
      params +="&sortField="+searchParams.sortField;
    } else {
      params +="&sortField="+KB_DEFAULT_PARAMS.SORT_FIELD;
    }
    if(searchParams?.direction){
      params +="&direction="+searchParams.direction;
    } else {
      params +="&direction="+KB_DEFAULT_PARAMS.DIRECTION;
    }
    this.getListOfKb(params);
  }

  onLoadByFilter(searchParams){
    // console.log('onLoadByFilter:',searchParams);
    // searchParams.page = 0;
    this.numberPage = -1;
    this.kbsList = [];
    this.onLoadPage(searchParams);
  }


  getListOfKb(params?) {
    this.logger.log("[KNOWLEDGE BASES COMP] getListOfKb ");
    this.kbService.getListOfKb(params).subscribe((resp:any) => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbList: ", resp);
      //this.kbs = resp;
      this.kbsListCount = resp.count;
      resp.kbs.forEach(kb => {
        // this.kbsList.push(kb);
        const index = this.kbsList.findIndex(objA => objA._id === kb._id);
        if (index !== -1) {
          this.kbsList[index] = kb;
        } else {
          this.kbsList.push(kb);
        }
        //--> this.updateStatusOfKb(kb._id, 3);
      });
    
      // if(this.kbsList.length>0){
      //   this.SHOW_TABLE = true;
      //   this.checkAllStatuses();
      // } else {
      //   this.SHOW_TABLE = false;
      // }
      //this.showSpinner = false;
      //
      this.refreshKbsList = !this.refreshKbsList;
      
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR get kbSettings: ", error);
      //this.showSpinner = false;
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings *COMPLETE*");
      //this.showSpinner = false;
    })
  }

  // /**
  //  * getKnowledgeBaseSettings
  //  */
  // getKnowledgeBaseSettings() {
  //   this.kbService.getKbSettings().subscribe((kbSettings: KbSettings) => {
  //     this.logger.log("[KNOWLEDGE-BASES-COMP] get kbSettings: ", kbSettings);
  //     // this.kbSettings = kbSettings;
  //     this.kbsList = kbSettings.kbs;
  //   }, (error) => {
  //     this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR get kbSettings: ", error);
  //   }, () => {
  //     this.logger.log("[KNOWLEDGE-BASES-COMP] get kbSettings *COMPLETE*");
  //     this.showSpinner = false;
  //   })
  // }

  onSendSitemap(body){
    // this.onCloseBaseModal();
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addSitemap(body).subscribe((resp: any) => {
      this.logger.log("onSendSitemap:", resp);
      // let error = resp.error;
      // let url = resp.url;
      this.listSitesOfSitemap = resp.sites;
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR send sitemap: ", err);
      this.onOpenErrorModal(error);
    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] send sitemap *COMPLETED*");
    })
  }

  /**
   * onAddKb
   */
  onAddKb(body) {
    // this.logger.log("body:",body);
    this.onCloseBaseModal();
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addKb(body).subscribe((resp: any) => {
      this.logger.log("onAddKb:", resp);
      let kb = resp.value;
      if(resp.lastErrorObject && resp.lastErrorObject.updatedExisting === true){
        //console.log("updatedExisting true:");
        const index = this.kbsList.findIndex(item => item._id === kb._id);
        if (index !== -1) {
          this.kbsList[index] = kb;
          this.notify.showWidgetStyleUpdateNotification(this.msgSuccesUpdateKb, 3, 'warning');
        }
      } else {
        //this.kbsList.push(kb);
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesAddKb, 2, 'done');
        // this.kbsListCount++;
        this.kbsList.unshift(kb);
        this.kbsListCount = this.kbsListCount+1;
        this.refreshKbsList = !this.refreshKbsList;
        // let searchParams = {
        //   "sortField": KB_DEFAULT_PARAMS.SORT_FIELD,
        //   "direction": KB_DEFAULT_PARAMS.DIRECTION,
        //   "status": '',
        //   "search": '',
        // }
        // this.onLoadByFilter(searchParams);
      }
      this.updateStatusOfKb(kb._id, -1);
      // this.updateStatusOfKb(kb._id, 0);
      // this.onLoadByFilter(searchParams);
      // that.onRunIndexing(kb);
      // setTimeout(() => {
      //   this.checkStatusWithRetry(kb);
      // }, 2000);
      //that.onCloseBaseModal();
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR add new kb: ", err);
      this.onOpenErrorModal(error);
    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] add new kb *COMPLETED*");
      //this.trackUserActioOnKB('Added Knowledge Base', gptkey)
    })
  }



  onAddMultiKb(body) {
    this.onCloseBaseModal();
    // console.log("onAddMultiKb");
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addMultiKb(body).subscribe((kbs: any) => {
      this.logger.log("onAddMultiKb:", kbs);
      this.notify.showWidgetStyleUpdateNotification(this.msgSuccesAddKb, 2, 'done');
      
      let paramsDefault = "?limit="+KB_DEFAULT_PARAMS.LIMIT+"&page="+KB_DEFAULT_PARAMS.NUMBER_PAGE+"&sortField="+KB_DEFAULT_PARAMS.SORT_FIELD+"&direction="+KB_DEFAULT_PARAMS.DIRECTION;
      this.getListOfKb(paramsDefault);
      // kbs.forEach(kb => {
      //   //this.kbsList.unshift(kb);
      //   // if(kb.status == -1 || kb.status == 0 || kb.status == 2) {
      //   //   setTimeout(() => {
      //   //     this.checkStatusWithRetry(kb);
      //   //   }, 2000);
      //   // }
      //   // this.updateStatusOfKb(kb._id, 3);
      //   //this.updateStatusOfKb(kb._id, -1);
      // });
      this.kbsListCount = this.kbsListCount+kbs.length;
      this.refreshKbsList = !this.refreshKbsList;
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR add new kb: ", err);
      this.onOpenErrorModal(error);
    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] add new kb *COMPLETED*");
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
    // this.logger.log("[KNOWLEDGE-BASES-COMP] kb to delete id: ", data);
    this.onCloseBaseModal();
    let error = this.msgErrorDeleteKb; //"Non è stato possibile eliminare il kb";
    this.kbService.deleteKb(data).subscribe((response:any) => {
      //this.logger.log('onDeleteKb:: ', response);
      kb.deleting = false;
      if(!response || (response.success && response.success === false)){
        // this.updateStatusOfKb(kb._id, 0);
        this.onOpenErrorModal(error);
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesDeleteKb, 2, 'done');
        // let error = response.error?response.error:"Errore generico";
        // this.onOpenErrorModal(error);
        this.removeKb(kb._id);
        this.kbsListCount = this.kbsListCount-1;
        this.refreshKbsList = !this.refreshKbsList;
        // let searchParams = {
        //   "sortField": KB_DEFAULT_PARAMS.SORT_FIELD,
        //   "direction": KB_DEFAULT_PARAMS.DIRECTION,
        //   "status": '',
        //   "search": '',
        // }
        // this.onLoadByFilter(searchParams);
      }
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR delete kb: ", err);
      kb.deleting = false;
      //this.kbid_selected.deleting = false;
      this.onOpenErrorModal(error);
    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] delete kb *COMPLETE*");
      //this.trackUserActioOnKB('Deleted Knowledge Base', gptkey)
    })
  }


  /** */
  onUpdateKb(kb) {
    this.logger.log('onUpdateKb: ', kb);
    this.onCloseBaseModal();
    let error = "update fallito"
    let dataDelete = {
      "id": kb._id,
      "namespace": kb.id_project
    }
    let dataAdd = {
      'name': kb.name,
      'source': kb.source,
      'content': '',
      'type': 'url'
    };
    if(kb.type === 'text'){
      dataAdd.source = kb.name;
      dataAdd.content = kb.content,
      dataAdd.type = 'text'
    }
    this.logger.log('dataAdd: ', dataAdd);
    kb.deleting = true;
    this.kbService.deleteKb(dataDelete).subscribe((response:any) => {
      kb.deleting = false;
      if(!response || (response.success && response.success === false)){
        this.onOpenErrorModal(error);
      } else {
        this.kbService.addKb(dataAdd).subscribe((resp: any) => {
          let kbNew = resp.value;
          if(resp.lastErrorObject && resp.lastErrorObject.updatedExisting === true){
            const index = this.kbsList.findIndex(item => item._id === kbNew._id);
            if (index !== -1) {
              this.kbsList[index] = kbNew;
              this.notify.showWidgetStyleUpdateNotification(this.msgSuccesUpdateKb, 3, 'warning');
            }
          } else {
            // this.kbsList.push(kb);
            // this.kbsList.unshift(kbNew);
            this.notify.showWidgetStyleUpdateNotification(this.msgSuccesAddKb, 2, 'done');
          }

          const index = this.kbsList.findIndex(item => item.id === kb._id);
          if (index > -1) {
            this.kbsList[index] = kbNew;
          } 
          // this.removeKb(kb._id);
          //-->this.updateStatusOfKb(kbNew._id, 0);
          this.refreshKbsList = !this.refreshKbsList;
          // setTimeout(() => {
          //   this.checkStatusWithRetry(kbNew);
          // }, 2000);
        }, (err) => {
          this.logger.error("[KNOWLEDGE BASES COMP] ERROR add new kb: ", err);
          this.onOpenErrorModal(error);
        }, () => {
          this.logger.log("[KNOWLEDGE BASES COMP] add new kb *COMPLETED*");
        })
      }
    }, (err) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR delete kb: ", err);
      kb.deleting = false;
      this.onOpenErrorModal(error);
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] delete kb *COMPLETE*");
      kb.deleting = false;
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
    var status_msg = "Indexing completed successfully!";
    var status_code = 2;
    var status_label = "done"
    this.openaiService.checkScrapingStatus(data).subscribe((response: any) => {

      // this.logger.log('Risposta ricevuta:', response);
      // if(response.status_code && response.status_code == -1){
      //   // this.logger.log('risorsa non indicizzata');
      //   // this.onRunIndexing(kb);
      //   this.checkStatusWithRetry(kb);
      // }  


      let resource_status: Number;
      if (response.status) {
        resource_status = response.status;
      } else {
        resource_status = response.status_code
      }

      if (response.status == -1) {
        status_msg = "Indexing not yet started";
        status_code = 3;
        status_label = "warning";
      } else if (response.status == 100 || response.status == 200) {
        status_msg = "Indexing in progress";
        status_code = 3;
        status_label = "warning";
      } else if (response.status = 300)  {
        // default message already seat
      } else if (response.status == 400) {
        status_code = 4;
        status_label = "dangerous";
        status_msg = "The resource could not be indexed";
      } else {
        this.logger.log("Unrecognized status")
      }
      
      /**
       *    OLD STATUSES - START 
       */
      if(response.status_code == -1 || response.status_code == 0 || response.status_code == 2){
        // this.logger.log('riprova tra 10 secondi...');
        // this.updateStatusOfKb(kb._id, response.status_code);
        // timer(20000).subscribe(() => {
        //   this.checkStatusWithRetry(kb);
        // });
        
        status_msg = "Indexing in progress: "+response.status_code;
        status_code = 3;
        status_label = "warning";
      } else  if(response.status_code == 4 ){ // status == 3 || status == 4
        // this.logger.log('Risposta corretta:', response.status_code);
        status_code = 4;
        status_label = "dangerous";
        status_msg = "The resource could not be indexed "+response.status_code;
      } else {
        //status_msg = "Indicizzazione in corso stato: "+response.status_code;
      }
      /**   
       *    OLD STATUSES - END 
       */   

      this.updateStatusOfKb(kb._id, resource_status);
      this.notify.showWidgetStyleUpdateNotification(status_msg, status_code, status_label);
    },
    error => {
      this.logger.error('Error: ', error);
      //-->this.updateStatusOfKb(kb._id, -2);
      status_code = 4;
      status_label = "dangerous";
      status_msg = "Error: "+error.message;
      this.notify.showWidgetStyleUpdateNotification(status_msg, status_code, status_label);
    });
  }

  /**
   * updateStatusOfKb
   */
  private updateStatusOfKb(kb_id, status_code){
    let kb = this.kbsList.find(item => item._id === kb_id);
    if(kb)kb.status = status_code;
    // this.logger.log('AGGIORNO updateStatusOfKb:', kb_id, status_code, kb);
  }

  private removeKb(kb_id){
    //this.kbs = this.kbs.filter(item => item._id !== kb_id);
    this.kbsList = this.kbsList.filter(item => item._id !== kb_id);
    // this.logger.log('AGGIORNO kbsList:', this.kbsList);
    this.refreshKbsList = !this.refreshKbsList;
    // console.log('AGGIORNO kbsList:', this.kbsList);
  }


  /**
   * onCheckStatus
   */
  onCheckStatus(kb){
    this.checkStatusWithRetry(kb);
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
    this.updateStatusOfKb(kb._id, 100);
    this.openaiService.startScraping(data).subscribe((response: any) => {
      this.logger.log("start scraping response: ", response);
      if (response.error) {
        this.notify.showWidgetStyleUpdateNotification(this.msgErrorIndexingKb, 4, 'report_problem');
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesIndexingKb, 2, 'done');
        // this.checkStatusWithRetry(kb);
      }
    }, (error) => {
      this.logger.error("error start scraping response: ", error);
    }, () => {
      this.logger.log("start scraping *COMPLETE*");
    })
  }


  onReloadKbs(params){
    this.getListOfKb(params);
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
    this.logger.log('[KNOWLEDGE BASES COMP] checkAllStatuses: ', this.kbsList);
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
    // this.baseModalDelete = false;
  }

  onOpenBaseModalDelete(kb){
    this.kbid_selected = kb;
    this.kbid_selected.deleting = true;
    this.baseModalDelete = true;
  }
  // ************** PREVIEW **************** //

  onOpenBaseModalDetail(kb){
    this.kbid_selected = kb;
    this.logger.log('onOpenBaseModalDetail:: ', this.kbid_selected);
    this.baseModalDetail=true;
  }

  onOpenBaseModalPreview(){
    // this.logger.log("onOpenBaseModalPreview:: ")
    //this.kbid_selected = kb;
    this.baseModalPreview = true;
  }



  onOpenErrorModal(response){
    this.errorMessage = response;
    this.baseModalError = true;
  }


  // ************** CLOSE ALL MODAL **************** //
  onCloseBaseModal(){
    this.listSitesOfSitemap = [];
    this.baseModalDelete = false;
    this.baseModalPreview = false;
    this.baseModalError = false;
    this.baseModalDetail = false;
    this.typeKnowledgeBaseModal = '';
  }




}
