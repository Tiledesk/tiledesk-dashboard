import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { FaqKbService } from 'app/services/faq-kb.service';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
// import { TemplateDetailComponent } from '../templates/template-detail/template-detail.component';
import { FaqService } from 'app/services/faq.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { NotifyService } from '../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { goToCDSVersion } from 'app/utils/util';
@Component({
  selector: 'appdashboard-create-chatbot',
  templateUrl: './create-chatbot.component.html',
  styleUrls: ['./create-chatbot.component.scss']
})
export class CreateChatbotComponent implements OnInit {
  startChatBotArray: any = []
  showSpinner = false;
  isChromeVerGreaterThan100: boolean;
  project: Project;
  HAS_SELECTED_CREATE_BOT: boolean = true;
  id_faq_kb: string;
  importedChatbotid: string;
  thereHasBeenAnErrorProcessing: string;
  create: boolean = true;

  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  constructor(
    private faqKbService: FaqKbService,
    private auth: AuthService,
    private router: Router,
    public location: Location,
    public dialog: MatDialog,
    private faqService: FaqService,
    private botLocalDbService: BotLocalDbService,
    private notify: NotifyService,
    private translate: TranslateService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.getCommunityTemplatesAndFilterForStartChatbot()
    this.getCurrentProject();
    this.getBrowserVersion();
    this.getTranslations()
    this.getProfileImageStorage();
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[BOTS-TEMPLATES] IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('[BOTS-TEMPLATES] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  getTranslations() {
    this.translate.get('ThereHasBeenAnErrorProcessing')
      .subscribe((translation: any) => {
        this.thereHasBeenAnErrorProcessing = translation;
      });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project
      }
      // console.log('[BOT-CREATE 00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }



  getCommunityTemplatesAndFilterForStartChatbot() {
    this.showSpinner = true;
    this.faqKbService.getCommunityTemplates().subscribe((res: any) => {

      if (res) {
        const communityTemplates = res
        this.logger.log('[CREATE-CHATBOT] communityTemplates', communityTemplates);
        
        this.startChatBotArray = communityTemplates.filter((el) => {
          return el.mainCategory === "System" && el.tags && el.tags.includes('start-chatbot')
        });
        let stripHere = 115;
        this.startChatBotArray.forEach(startChatBot => {
          this.logger.log('[CREATE-CHATBOT] startChatBot', startChatBot);
          if (startChatBot['description']) {
            startChatBot['shortDescription'] = startChatBot['description'].substring(0, stripHere) + '...';
          }
        });

        this.logger.log('[CREATE-CHATBOT] startChatBotArray', this.startChatBotArray);

        this.generateTagsBackground(this.startChatBotArray)
      }

    }, (error) => {
      this.logger.error('[CREATE-CHATBOT] GET COMMUNITY TEMPLATES ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[CREATE-CHATBOT] GET COMMUNITY TEMPLATES COMPLETE');

      this.showSpinner = false;
    });

  }

  // openDialog(template) {
  //   const dialogRef = this.dialog.open(TemplateDetailComponent, {
  //     data: {
  //       template: template,
  //       projectId: this.project._id
  //     },
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     // console.log(`Dialog result: ${result}`);
  //   });
  // }

  generateTagsBackground(templates) {
    templates.forEach(template => {
      // console.log('generateTagsBackground template', template)
      let chatbotTags = []
      if (template && template.certifiedTags) {
        chatbotTags = template.certifiedTags
        this.doBackground(chatbotTags)
      } else if (template && template.tags) {
        chatbotTags = template.tags
        this.doBackground(chatbotTags)
      }
    });
  }

  doBackground(chatbotTags) {
    chatbotTags.forEach(tag => {
      if (tag.color) {
        // console.log('generateTagsBackground tag', tag)
        let tagbckgnd = ''
        if (tag.color === "#a16300" || tag.color === "#A16300") {
          tagbckgnd = 'rgba(255,221,167,1)'
        } else if (tag.color === "#00699E" || tag.color === "#00699e") {
          tagbckgnd = 'rgba(208,239,255, 1)'
        } else if (tag.color === "#25833e" || tag.color === "#25833E") {
          tagbckgnd = 'rgba(204,241,213, 1)'
        } else if (tag.color === "#0049bd" || tag.color === "#0049BD") {
          tagbckgnd = 'rgba(220,233,255, 1)'
        } else if (tag.color !== "#a16300" && tag.color !== "#A16300" && tag.color !== "#00699E" && tag.color !== "#00699e" && tag.color !== "#25833e" && tag.color !== "#25833E" && tag.color !== "#0049bd" && tag.color !== "#0049BD") {

          tagbckgnd = this.hexToRgba(tag.color)
          // console.log('generateTagsBackground tagbckgnd ', tagbckgnd)
        }

        // let b = {background : tagbckgnd}

        tag.background = tagbckgnd
      } else {
        this.logger.log('[CREATE-CHATBOT] communityTemplates NO TAG COLOR');
      }
      // template.certifiedTags.find(t => t.color === t.background).background = tagbckgnd;

      // if (tag.color === tag.background) {
      //   // template.certifiedTags.push({ 'background': `${tagbckgnd}` })
      //   template.certifiedTags['background']=  tagbckgnd
      // }
    });
  }

  hexToRgba(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.3)';
    }
    throw new Error('Bad Hex');

  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;

    })
  }


  goBackToFaqKbList() {
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.router.navigate(['project/' + this.project._id + '/bots']);
  }

  goToCommunity() {
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.router.navigate(['project/' + this.project._id + '/bots/templates/community']);
  }

  

  goBack() {
    this.location.back();
  }


  toggleTabCreateImport(tabcreate) {
    this.logger.log("[CREATE-CHATBOT] toggleTabCreateImport tabcreate", tabcreate);
    this.HAS_SELECTED_CREATE_BOT = tabcreate
    //  console.log("[BOT-CREATE] toggleTabCreateImport HAS_SELECTED_CREATE_BOT",  this.HAS_SELECTED_CREATE_BOT );
  }


  // --------------------------------------------------------------------------
  // @ Import chatbot from json 
  // --------------------------------------------------------------------------
  fileChangeUploadChatbotFromJSON(event) {

    this.logger.log('[TILEBOT] - fileChangeUploadChatbotFromJSON $event ', event);
    // let fileJsonToUpload = ''
    // // console.log('[TILEBOT] - fileChangeUploadChatbotFromJSON $event  target', event.target);
    // const selectedFile = event.target.files[0];
    // const fileReader = new FileReader();
    // fileReader.readAsText(selectedFile, "UTF-8");
    // fileReader.onload = () => {
    //   fileJsonToUpload = JSON.parse(fileReader.result as string)
    //   console.log.log('fileJsonToUpload CHATBOT', fileJsonToUpload);
    // }
    // fileReader.onerror = (error) => {
    //   console.log.log(error);
    // }
    const fileList: FileList = event.target.files;
    const file: File = fileList[0];
    const formData: FormData = new FormData();
    formData.set('id_faq_kb', this.id_faq_kb);
    formData.append('uploadFile', file, file.name);
    this.logger.log('FORM DATA ', formData)

    this.faqService.importChatbotFromJSONFromScratch(formData).subscribe((faqkb: any) => {
      this.logger.log('[TILEBOT] - IMPORT CHATBOT FROM JSON - ', faqkb)
      if (faqkb) {
        this.importedChatbotid = faqkb._id
        this.logger.log('[TILEBOT] - IMPORT CHATBOT FROM JSON - importedChatbotid ', this.importedChatbotid)
        this.botLocalDbService.saveBotsInStorage(this.importedChatbotid, faqkb);

        // this.router.navigate(['project/' + this.project._id + '/cds/', this.importedChatbotid, 'intent', '0']);
        goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
        // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', this.importedChatbotid, 'tilebot']);
      }

    }, (error) => {
      this.logger.error('[TILEBOT] -  IMPORT CHATBOT FROM JSON- ERROR', error);

      this.notify.showWidgetStyleUpdateNotification(this.thereHasBeenAnErrorProcessing, 4, 'report_problem');
    }, () => {
      this.logger.log('[TILEBOT] - IMPORT CHATBOT FROM JSON - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("Chatbot was uploaded succesfully", 2, 'done')
    });
  }

}
