import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { Location } from '@angular/common';
import { LoggerService } from 'app/services/logger/logger.service';
import { Project } from 'app/models/project-model';
import { FaqKbService } from '../../services/faq-kb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from 'app/services/department.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { NotifyService } from 'app/core/notify.service';
@Component({
  selector: 'appdashboard-rasa-bot',
  templateUrl: './rasa-bot.component.html',
  styleUrls: ['./rasa-bot.component.scss']
})
export class RasaBotComponent implements OnInit {
  isChromeVerGreaterThan100: boolean;
  public faqKbName: string;
  public rasaServerUrl: string;
  public rasaBotDescription: string;
  displayInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;



  PRESENTS_MODAL_ATTACH_BOT_TO_DEPT: boolean = false;
  displayModalAttacchBotToDept: string;
  dept_id: string;
  HAS_CLICKED_HOOK_BOOT_TO_DEPT: boolean = false;
  HAS_COMPLETED_HOOK_BOOT_TO_DEPT: boolean = false;
  HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS: boolean = false;
  HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR: boolean = false;

  DISPLAY_SELECT_DEPTS_WITHOUT_BOT: boolean;
  selected_bot_id: string;
  selected_bot_name: string;
  depts_without_bot_array = [];
  project: Project;
  botType: string;
  depts_length: number;

  // goToEditBot = true;
  showSpinner: any;
  tparams: any; // to check if are used 


  newBot_name: string;
  newBot_Id: string;

  CREATE_BOT_ERROR: boolean;
  translateparamBotName: any;
  constructor(
    private auth: AuthService,
    public location: Location,
    private logger: LoggerService,
    private faqKbService: FaqKbService,
    private router: Router,
    private route: ActivatedRoute,
    private departmentService: DepartmentService,
    private botLocalDbService: BotLocalDbService,
    private notify: NotifyService,
  ) { }

  ngOnInit() {
    this.getBrowserVersion();
    this.getCurrentProject()
  }


  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      this.logger.log("[BOT-CREATE-RASA] isChromeVerGreaterThan100 ", this.isChromeVerGreaterThan100);
    })
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project
        this.getDeptsByProjectId()
      }
    });
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      this.logger.log('[BOT-CREATE-RASA] --->  DEPTS RES ', departments);

      if (departments) {
        this.depts_length = departments.length
        this.logger.log('[BOT-CREATE-RASA] --->  DEPTS LENGHT ', this.depts_length);

        if (this.depts_length === 1) {
          this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = false
          this.dept_id = departments[0]['_id']

          this.logger.log('[BOT-CREATE-RASA] --->  DEFAULT DEPT HAS BOT ', departments[0].hasBot);
          if (departments[0].hasBot === true) {

            this.logger.log('[BOT-CREATE-RASA] --->  DEFAULT DEPT HAS BOT ');
            this.logger.log('[BOT-CREATE-RASA] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          } else {

            this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
            this.logger.log('[BOT-CREATE-RASA] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          }

        }


        if (this.depts_length > 1) {
          this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = true;
          departments.forEach(dept => {

            if (dept.hasBot === true) {
              this.logger.log('[BOT-CREATE-RASA] --->  DEPT HAS BOT ');
              this.logger.log('[BOT-CREATE-RASA] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
            } else {

              this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
              this.logger.log('[BOT-CREATE-RASA] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
              this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
            }
          });

          this.logger.log('[BOT-CREATE-RASA] --->  DEPT ARRAY OF DEPT WITHOUT BOT ', this.depts_without_bot_array);
        }

      }
    }, error => {
      this.logger.error('[BOT-CREATE --->  DEPTS RES - ERROR', error);
    }, () => {
      this.logger.log('[BOT-CREATE --->  DEPTS RES - COMPLETE')

    });
  }

  onSelectBotId() {
    this.logger.log('[BOT-CREATE-RASA] --->  onSelectBotId ', this.selected_bot_id);
    this.dept_id = this.selected_bot_id
    const hasFound = this.depts_without_bot_array.filter((obj: any) => {
      return obj.id === this.selected_bot_id;
    });
    this.logger.log('[BOT-CREATE-RASA] private logger: LoggerService --->  onSelectBotId dept found', hasFound);

    if (hasFound.length > 0) {
      this.selected_bot_name = hasFound[0]['name']
    }
  }


  // https://tiledesk-rasa-connector-pre.herokuapp.com/botcredendials/62a8edb27a531100357689a0/bots/62aa0bc286a2e50035116fde

  // CREATE 
  createRasaBot() {
    this.displayInfoModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;

    this.logger.log('[BOT-CREATE-RASA] HAS CLICKED CREATE NEW FAQ-KB');
    this.logger.log('[BOT-CREATE-RASA] Create Bot - NAME ', this.faqKbName);
    this.logger.log('[BOT-CREATE-RASA] Create Bot - SERVER URL ', this.rasaServerUrl);
    this.logger.log('[BOT-CREATE-RASA] Create Bot - PROJ ID ', this.project._id);

    this.logger.log('[BOT-CREATE-RASA] Create Bot - Bot DESCRIPTION ', this.rasaBotDescription);




    // ------------------------------------------------------------------------------------------------------------------------------
    // Create bot - note for the creation of a dialogflow bot see the bottom uploaddialogflowBotCredential() called in the complete() 
    // ------------------------------------------------------------------------------------------------------------------------------
    this.faqKbService.createRasaBot(this.faqKbName, 'rasa', this.rasaBotDescription)
      .subscribe((faqKb) => {
        this.logger.log('[BOT-CREATE-RASA] CREATE FAQKB - RES ', faqKb);

        if (faqKb) {
          this.newBot_name = faqKb['name'];
          this.newBot_Id = faqKb['_id'];
          this.translateparamBotName = { bot_name: this.newBot_name }

          // SAVE THE BOT IN LOCAL STORAGE
          this.botLocalDbService.saveBotsInStorage(this.newBot_Id, faqKb);
        }

      }, (error) => {
        this.logger.error('[BOT-CREATE-RASA] CREATE FAQKB - POST REQUEST ERROR ', error);
        this.SHOW_CIRCULAR_SPINNER = false;
        this.CREATE_BOT_ERROR = true;
      },
        () => {
          this.logger.log('[BOT-CREATE-RASA] CREATE FAQKB - POST REQUEST * COMPLETE *');
          this.connectRasaBotToRasaServer(this.newBot_Id, this.rasaServerUrl.trim())
        });
  }

  connectRasaBotToRasaServer(bot_Id, rasaServerUrl) {
    this.faqKbService.connectBotToRasaServer(bot_Id, rasaServerUrl).subscribe((res) => {
      this.logger.log('[BOT-CREATE-RASA] CREATE  - connectRasaServer - RES ', res);

    }, (error) => {
      // this.logger.log('[BOT-CREATE-RASA] CREATE  - connectRasaServer - ERROR ', error);
      if (error) {
   
        this.logger.error('[BOT-CREATE-RASA] CREATE  -  ERROR ', error.error.msg)
    
        this.CREATE_BOT_ERROR = true;
        this.SHOW_CIRCULAR_SPINNER = false;
      }
    }, () => {
      this.CREATE_BOT_ERROR = false;
      this.SHOW_CIRCULAR_SPINNER = false;
      this.logger.log('[BOT-CREATE-RASA] CREATE FAQKB - connectRasaServer * COMPLETE *');
    });
  }

  goTo_EditBot() {
    this.logger.log(' goTo_EditBot -  PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT)
    if (this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT === false) {
      this.router.navigate(['project/' + this.project._id + '/bots/' + this.newBot_Id + "/rasa"]);
    } else {
      this.present_modal_attacch_bot_to_dept()
    }
  }

  present_modal_attacch_bot_to_dept() {
    this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false
    this.displayModalAttacchBotToDept = 'block'
    this.onCloseModal();
  }

  onCloseModalAttacchBotToDept() {
    this.router.navigate(['project/' + this.project._id + '/bots/' + this.newBot_Id + "/rasa"]);
  }


  hookBotToDept() {
    this.HAS_CLICKED_HOOK_BOOT_TO_DEPT = true;
    this.departmentService.updateExistingDeptWithSelectedBot(this.dept_id, this.newBot_Id).subscribe((res) => {
      this.logger.log('[BOT-CREATE-RASA] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
    }, (error) => {
      this.logger.error('[BOT-CREATE-RASA] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);

      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true


      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR = true;

      this.logger.log('[BOT-CREATE-RASA] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    }, () => {
      this.logger.log('[BOT-CREATE-RASA] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');

      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS = true;
      this.logger.log('[BOT-CREATE-RASA] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    });
  }


  onCloseModal() {
    this.displayInfoModal = 'none';

    this.CREATE_BOT_ERROR = null;
  }


  goBackToFaqKbList() {
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.router.navigate(['project/' + this.project._id + '/bots']);
  }

  goBack() {
    this.location.back();
  }

  openRasaIntegrationTutorial() {
    const url = 'https://gethelp.tiledesk.com/articles/rasa-ai-integration/';
    window.open(url, '_blank');
  }


}
