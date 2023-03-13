import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Chatbot } from 'app/models/faq_kb-model';
import { AppConfigService } from 'app/services/app-config.service';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';
import { UploadImageService } from 'app/services/upload-image.service';
import { LoggerService } from '../../services/logger/logger.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { AuthService } from 'app/core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from 'app/services/department.service';
import { avatarPlaceholder, getColorBck } from 'app/utils/util';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/notify.service';
import { Project } from 'app/models/project-model';
import { FaqService } from 'app/services/faq.service';
import { BotsBaseComponent } from 'app/bots/bots-base/bots-base.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
const swal = require('sweetalert');

@Component({
  selector: 'cds-chatbot-details',
  templateUrl: './cds-chatbot-details.component.html',
  styleUrls: ['./cds-chatbot-details.component.scss']
})
export class CdsChatbotDetailsComponent extends BotsBaseComponent implements OnInit, OnChanges {
  @Input() selectedChatbot: Chatbot;
  HAS_SELECTED_BOT_DETAILS: boolean = true;
  HAS_SELECTED_BOT_IMPORTEXORT: boolean = false;

  botProfileImageExist: boolean;
  botImageHasBeenUploaded = false;
  id_faq_kb: string;
  storageBucket: string;
  showSpinnerInUploadImageBtn = false;
  botProfileImageurl: SafeUrl;
  timeStamp: any;
  all_depts: any;
  isVisibleDEP: boolean;
  public_Key: string;
  COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH: number;
  DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY = [];
  botType: string;
  depts_length: number;
  depts_without_bot_array = [];
  COUNT_OF_VISIBLE_DEPT: number;
  botHasBeenAssociatedWithDept: string;
  DEPTS_HAVE_BOT_BUT_NOT_THIS: boolean
  dept_id: string;
  done_msg: string;
  selected_dept_id: string;
  selected_dept_name: string;
  modalChoosefileDisabled: boolean;

  faqKb_name: string;
  faqkb_language: string;
  faqKbUrlToUpdate: string;
  faqKb_id: string;
  faqKb_created_at: any;
  faqKb_description: string;
  faq_lenght: number;
  showSpinner = true;
  showSpinnerInUpdateBotCard = true;
  displayInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  displayImportModal = 'none';
  csvColumnsDelimiter = ';'
  parse_done: boolean;
  parse_err: boolean;
  updateBotError: string;
  uploadedFile: any;

  updateBotSuccess: string;
  notValidJson: string;
  errorDeletingAnswerMsg: string;
  answerSuccessfullyDeleted: string;
  thereHasBeenAnErrorProcessing: string;
  project: Project;
  webhook_is_enabled: any;
  webhookUrl: string;
  language: string;
  @ViewChild('fileInputBotProfileImage', { static: false }) fileInputBotProfileImage: any;
  @ViewChild('editbotbtn', { static: false }) private elementRef: ElementRef;
  botDefaultSelectedLangCode: string
  botDefaultSelectedLang: any

  faq_kb_remoteKey: string;
  botTypeForInput: string;
  details: any
  displayDeleteFaqModal = 'none';
  displayImportJSONModal = 'none'
  constructor(
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private departmentService: DepartmentService,
    private translate: TranslateService,
    private notify: NotifyService,
    private faqService: FaqService,
    private sanitizer: DomSanitizer
  ) { super(); }

  ngOnInit(): void {
    this.auth.checkRoleForCurrentProject();
    // this.getParamsBotIdAndThenInit();
    this.getOSCODE();
    this.getTranslations();
    this.getCurrentProject();
    this.checkBotImageUploadIsComplete();
    this.getDeptsByProjectId();
  }

  ngOnChanges() {
    this.logger.log('[CDS-CHATBOT-DTLS] (OnChanges) selectedChatbot ', this.selectedChatbot)
    this.destructureSelectedChatbot(this.selectedChatbot)
  }

  destructureSelectedChatbot(selectedChatbot: Chatbot) {
    this.faqKb_id = selectedChatbot._id;
    this.logger.log('[CDS-CHATBOT-DTLS] - BOT ID', this.faqKb_id)
    console.log('[CDS-CHATBOT-DTLS] - BOT ID', this.faqKb_id)
    this.id_faq_kb = selectedChatbot._id;
    if (this.faqKb_id) {
      this.checkBotImageExist()
    }

    this.faqKb_name = selectedChatbot.name;
    this.logger.log('[CDS-CHATBOT-DTLS] - BOT NAME', this.faqKb_name);

    this.botTypeForInput = selectedChatbot.type
    this.logger.log('[CDS-CHATBOT-DTLS] - BOT TYPE ', this.botTypeForInput);

    this.faqKb_created_at = selectedChatbot.createdAt;
    this.logger.log('[CDS-CHATBOT-DTLS] - BOT CREATED AT ', this.faqKb_created_at);

    this.faqKb_description = selectedChatbot.description;
    this.logger.log('[CDS-CHATBOT-DTLS] - BOT DESCRIPTION ', this.faqKb_description);

    this.webhook_is_enabled = selectedChatbot.webhook_enabled
    this.logger.log('[CDS-CHATBOT-DTLS] - BOT webhook_is_enabled ', this.webhook_is_enabled);

    this.webhookUrl = selectedChatbot.webhook_url
    this.logger.log('[CDS-CHATBOT-DTLS] - BOT webhookUrl ', this.webhookUrl);

    this.logger.log('[CDS-CHATBOT-DTLS] - BOT LANGUAGE ', selectedChatbot.language);

    if (selectedChatbot && selectedChatbot.language) {
      this.faqkb_language = selectedChatbot.language;
      this.botDefaultSelectedLang = this.botDefaultLanguages[this.getIndexOfbotDefaultLanguages(selectedChatbot.language)].name
      this.logger.log('[CDS-CHATBOT-DTLS] BOT DEAFAULT SELECTED LANGUAGE ', this.botDefaultSelectedLang);
    }
  }

  checkBotImageExist() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.checkBotImageExistOnFirebase();
    } else {
      this.checkBotImageExistOnNative();
    }
  }

  // getParamsBotIdAndThenInit() {
  //   this.id_faq_kb = this.route.snapshot.params['faqkbid'];
  //   this.logger.log('[NATIVE-BOT] id_faq_kb ', this.id_faq_kb);

  //   if (this.id_faq_kb) {
      
  //   }
  // }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
      this.logger.log('[CDS-CHATBOT-DTLS] project from AUTH service subscription  ', this.project)
    });
  }


  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      this.logger.log('[CDS-CHATBOT-DTLS] - DEPT GET DEPTS ', departments);
      this.logger.log('[CDS-CHATBOT-DTLS] - DEPT BOT ID ', this.id_faq_kb);

      if (departments) {
        this.all_depts = departments;

        let count = 0;
        let countOfVisibleDepts = 0;

        departments.forEach((dept: any) => {
          this.logger.log('[CDS-CHATBOT-DTLS] - DEPT', dept);

          if (dept.hasBot === true) {
            if (this.id_faq_kb === dept.id_bot) {
              this.logger.log('[CDS-CHATBOT-DTLS] - DEPT DEPT WITH CURRENT BOT ', dept);

              count = count + 1;


              // -------------------------------------------------------------------
              // Dept's avatar
              // -------------------------------------------------------------------
              let newInitials = '';
              let newFillColour = '';


              if (dept.name) {
                newInitials = avatarPlaceholder(dept.name);
                if (dept.default !== true) {
                  newFillColour = getColorBck(dept.name);
                } else if (dept.default === true && departments.length === 1) {
                  newFillColour = '#6264A7'
                } else if (dept.default === true && departments.length > 1) {
                  newFillColour = 'rgba(98, 100, 167, 0.6) '
                }
              } else {
                newInitials = 'N/A.';
                newFillColour = '#eeeeee';
              }

              dept['dept_name_initial'] = newInitials;
              dept['dept_name_fillcolour'] = newFillColour;

              // // -------------------------------------------------------------------
              // // Dept's description
              // // -------------------------------------------------------------------
              // if (dept.description) {
              //   let stripHere = 20;
              //   dept['truncated_desc'] = dept.description.substring(0, stripHere) + '...';
              // }
              const index = this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.findIndex((d) => d._id === dept._id);

              if (index === -1) {
                this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.push(dept)
              }
              // this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.indexOf(dept) === -1 ? this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.push(dept) : this.logger.log("This item already exists");

              // this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.push(dept)
            }
          } else if (dept.hasBot === false) {
            // this.depts_length = departments.length
            this.logger.log('[CDS-CHATBOT-DTLS] --->  DEPT botType ', this.botType);

            if (this.botType !== 'identity') {
              const index = this.depts_without_bot_array.findIndex((d) => d._id === dept._id);

              if (index === -1) {
                this.depts_without_bot_array.push(dept)
              }

              if (dept.default === false && dept.status === 1) {
                countOfVisibleDepts = countOfVisibleDepts + 1;
              }

            }
          }
        });

        this.logger.log('[CDS-CHATBOT-DTLS] ---> Current bot is found in DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY);

        const hasFoundBotIn = this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.filter((obj: any) => {
          return obj.id_bot === this.id_faq_kb;
        });

        if (hasFoundBotIn.length > 0) {
          this.DEPTS_HAVE_BOT_BUT_NOT_THIS = false
          this.logger.log('[CDS-CHATBOT-DTLS] ---> Current bot is found in DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_HAVE_BOT_BUT_NOT_THIS);
        } else {
          this.DEPTS_HAVE_BOT_BUT_NOT_THIS = true
          this.logger.log('[CDS-CHATBOT-DTLS] ---> Current bot is NOT found in DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_HAVE_BOT_BUT_NOT_THIS);
        }

        this.logger.log('[CDS-CHATBOT-DTLS] - DEPT - DEPTS WITHOUT BOT', this.depts_without_bot_array);

        this.COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH = count;
        this.logger.log('[CDS-CHATBOT-DTLS] - DEPT - COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH', this.COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH);

        this.COUNT_OF_VISIBLE_DEPT = countOfVisibleDepts;
        this.logger.log('[CDS-CHATBOT-DTLS] - DEPT - COUNT_OF_VISIBLE_DEPT', this.COUNT_OF_VISIBLE_DEPT);
      }
    }, error => {

      this.logger.error('[CDS-CHATBOT-DTLS] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[CDS-CHATBOT-DTLS] - DEPT - GET DEPTS - COMPLETE')

    });
  }

  onSelectDept() {
    this.logger.log('[CDS-CHATBOT-DTLS] --->  onSelectDept dept_id', this.dept_id);
    this.logger.log('[CDS-CHATBOT-DTLS] --->  onSelectDept selected_dept_id', this.selected_dept_id);
    this.logger.log('[CDS-CHATBOT-DTLS] --->  onSelectDept id_faq_kb', this.id_faq_kb);
    this.dept_id = this.selected_dept_id


    const hasFound = this.depts_without_bot_array.filter((obj: any) => {
      return obj.id === this.selected_dept_id;
    });
    this.logger.log('[CDS-CHATBOT-DTLS] --->  onSelectBotId dept found', hasFound);

    if (hasFound.length > 0) {
      this.selected_dept_name = hasFound[0]['name']
    }
    // this.hookBotToDept()
  }




  toggleTab(displaysecodtab) {

    this.logger.log('[CDS-CHATBOT-DTLS] displaydetails', displaysecodtab)
    if (displaysecodtab) {
      this.HAS_SELECTED_BOT_DETAILS = false;
      this.HAS_SELECTED_BOT_IMPORTEXORT = true;
    } else {
      this.HAS_SELECTED_BOT_DETAILS = true;
      this.HAS_SELECTED_BOT_IMPORTEXORT = false;
    }

    this.logger.log('[CDS-CHATBOT-DTLS] toggle Tab Detail / Import Export HAS_SELECTED_BOT_DETAILS', this.HAS_SELECTED_BOT_DETAILS)
    this.logger.log('[CDS-CHATBOT-DTLS] toggle Tab Detail / Import Export HAS_SELECTED_BOT_IMPORTEXORT', this.HAS_SELECTED_BOT_IMPORTEXORT)
  }

  // ---------------------------------------------------
  // Delete bot photo
  // ---------------------------------------------------
  deleteBotProfileImage() {
    // const file = event.target.files[0]
    this.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) deleteBotProfileImage')

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.deleteBotProfileImage(this.id_faq_kb);
    } else {
      this.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) deleteUserProfileImage with native service')
      this.uploadImageNativeService.deletePhotoProfile_Native(this.id_faq_kb, 'bot')
    }
    this.botProfileImageExist = false;
    this.botImageHasBeenUploaded = false;

    const delete_bot_image_btn = <HTMLElement>document.querySelector('.delete_bot_image_btn');
    delete_bot_image_btn.blur();
  }

  checkBotImageExistOnFirebase() {
    this.logger.log('[CDS-CHATBOT-DTLS] checkBotImageExistOnFirebase (FAQ-COMP) ')
    this.logger.log('[CDS-CHATBOT-DTLS] STORAGE-BUCKET (FAQ-COMP) firebase_conf ', this.appConfigService.getConfig().firebase)

    const firebase_conf = this.appConfigService.getConfig().firebase;
    if (firebase_conf) {
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[CDS-CHATBOT-DTLS] STORAGE-BUCKET (FAQ-COMP) ', this.storageBucket)
    }

    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/' + this.storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';

    const self = this;
    this.verifyImageURL(imageUrl, function (imageExists) {

      if (imageExists === true) {
        self.botProfileImageExist = imageExists

        self.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
        self.setImageProfileUrl(self.storageBucket);
      } else {
        self.botProfileImageExist = imageExists

        self.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
      }
    })
  }

  checkBotImageExistOnNative() {
    // const baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
    const baseUrl = this.appConfigService.getConfig().baseImageUrl;
    const imageUrl = baseUrl + 'images?path=uploads%2Fusers%2F' + this.id_faq_kb + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    const self = this;
    console.log('[CDS-CHATBOT-DTLS] HERE YES')
    this.verifyImageURL(imageUrl, function (imageExists) {

      if (imageExists === true) {
        self.botProfileImageExist = imageExists

        self.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')
        console.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')

        self.setImageProfileUrl_Native(baseUrl)

      } else {
        self.botProfileImageExist = imageExists

        self.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')
        console.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')
      }
    })
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

  checkBotImageUploadIsComplete() {
    this.logger.log('[CDS-CHATBOT-DTLS] checkBotImageUploadIsComplete')
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.uploadImageService.botImageWasUploaded.subscribe((imageuploaded) => {
        this.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', imageuploaded, '(usecase Firebase)');
        this.botImageHasBeenUploaded = imageuploaded;

        if (this.storageBucket && this.botImageHasBeenUploaded === true) {

          this.showSpinnerInUploadImageBtn = false;

          this.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) - IMAGE UPLOADING IS COMPLETE - BUILD botProfileImageurl ');

          this.setImageProfileUrl(this.storageBucket)
        }
      });
    } else {
      // Native
      this.uploadImageNativeService.botImageWasUploaded_Native.subscribe((imageuploaded) => {
        this.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', imageuploaded, '(usecase Native)');

        this.botImageHasBeenUploaded = imageuploaded;

        this.showSpinnerInUploadImageBtn = false;

        // here "setImageProfileUrl" is missing because in the "upload" method there is the subscription to the downoload
        // url published by the BehaviourSubject in the service
      })
    }
  }

  setImageProfileUrl(storageBucket) {
    this.botProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';

    this.timeStamp = (new Date()).getTime();
  }

  setImageProfileUrl_Native(storage) {
    let _botProfileImageurl = storage + 'images?path=uploads%2Fusers%2F' + this.id_faq_kb + '%2Fimages%2Fthumbnails_200_200-photo.jpg' + new Date().getTime();;
    this.botProfileImageurl = this.sanitizer.bypassSecurityTrustUrl(_botProfileImageurl)
    // this.timeStamp = new Date().getTime();
  }

  // getBotProfileImage(): SafeUrl {
  //   if (this.timeStamp) {
  //     return this.sanitizer.bypassSecurityTrustUrl(this.botProfileImageurl + '&' + this.timeStamp);
  //   }
  //   return this.sanitizer.bypassSecurityTrustUrl(this.botProfileImageurl)
  // }

  editBot() {
    // RESOLVE THE BUG 'edit button remains focused after clicking'
    this.elementRef.nativeElement.blur();

    // this.logger.log('[CDS-CHATBOT-DTLS] FAQ KB NAME TO UPDATE ', this.faqKb_name);


    this.faqKbService.updateFaqKb(this.id_faq_kb, this.faqKb_name, this.faqKbUrlToUpdate, this.botType, this.faqKb_description, this.webhook_is_enabled, this.webhookUrl, this.language)
      .subscribe((faqKb) => {
        this.logger.log('[CDS-CHATBOT-DTLS] EDIT BOT - FAQ KB UPDATED ', faqKb);
        if (faqKb) {
          this.selectedChatbot.name = faqKb['name']
          this.faqKb_description = faqKb['description']
          this.selectedChatbot.description = faqKb['description']
        }
      }, (error) => {
        this.logger.error('[CDS-CHATBOT-DTLS] EDIT BOT -  ERROR ', error);


        // =========== NOTIFY ERROR ===========
        this.notify.showWidgetStyleUpdateNotification(this.updateBotError, 4, 'report_problem');

      }, () => {
        this.logger.log('[CDS-CHATBOT-DTLS] EDIT BOT - * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        this.notify.showWidgetStyleUpdateNotification(this.updateBotSuccess, 2, 'done');
        this.selectedChatbot.name
      });
  }

  goToRoutingAndDepts() {
    this.router.navigate(['project/' + this.project._id + '/departments']);
  }

  goToEditAddPage_EDIT_DEPT(deptid, deptdefaut) {
    this.router.navigate(['project/' + this.project._id + '/department/edit', deptid]);
  }






  hookBotToDept() {
    this.departmentService.updateExistingDeptWithSelectedBot(this.dept_id, this.id_faq_kb).subscribe((res) => {
      this.logger.log('[CDS-CHATBOT-DTLS] - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
    }, (error) => {
      this.logger.error('[CDS-CHATBOT-DTLS] - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);
    }, () => {
      this.logger.log('[CDS-CHATBOT-DTLS] - UPDATE EXISTING DEPT WITH SELECED BOT * COMPLETE *');
      this.translateAndPresentModalBotAssociatedWithDepartment();
    });
  }

  translateAndPresentModalBotAssociatedWithDepartment() {
    let parametres = { bot_name: this.faqKb_name, dept_name: this.selected_dept_name };

    this.translate.get("BotHasBeenAssociatedWithDepartment", parametres).subscribe((res: string) => {
      this.botHasBeenAssociatedWithDept = res
    });

    swal({
      title: this.done_msg + "!",
      text: this.botHasBeenAssociatedWithDept,
      icon: "success",
      button: "OK",
      dangerMode: false,
    })
      .then((WillUpdated) => {
        this.getDeptsByProjectId()
        this.depts_without_bot_array = []
      })
  }

  // ---------------------------------------------------
  // Upload bot photo
  // ---------------------------------------------------
  upload(event) {
    this.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE  upload')
    this.showSpinnerInUploadImageBtn = true;
    const file = event.target.files[0]

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.uploadBotAvatar(file, this.id_faq_kb);

    } else {

      // Native upload
      this.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE  upload with native service')

      this.uploadImageNativeService.uploadBotPhotoProfile_Native(file, this.id_faq_kb).subscribe((downoloadurl) => {
        this.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE upload with native service - RES downoloadurl', downoloadurl);

        this.botProfileImageurl = downoloadurl

        this.timeStamp = (new Date()).getTime();
      }, (error) => {

        this.logger.error('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE upload with native service - ERR ', error);
      })

    }
    this.fileInputBotProfileImage.nativeElement.value = '';
  }




 // -------------------------------------------------------------------------------------- 
  // Export chatbot to JSON
  // -------------------------------------------------------------------------------------- 
  exportChatbotToJSON() {
    // const exportFaqToJsonBtnEl = <HTMLElement>document.querySelector('.export-chatbot-to-json-btn');
    // exportFaqToJsonBtnEl.blur();
    this.faqService.exportChatbotToJSON(this.id_faq_kb).subscribe((faq: any) => {
      // this.logger.log('[TILEBOT] - EXPORT CHATBOT TO JSON - FAQS', faq)
      // this.logger.log('[TILEBOT] - EXPORT FAQ TO JSON - FAQS INTENTS', faq.intents)
      if (faq) {
        this.downloadObjectAsJson(faq, faq.name);
      }
    }, (error) => {
      this.logger.error('[TILEBOT] - EXPORT BOT TO JSON - ERROR', error);
    }, () => {
      this.logger.log('[TILEBOT] - EXPORT BOT TO JSON - COMPLETE');
    });
  }


  // -------------------------------------------------------------------------------------- 
  // Export intents to JSON
  // -------------------------------------------------------------------------------------- 
  exportIntentsToJSON() {
    const exportFaqToJsonBtnEl = <HTMLElement>document.querySelector('.export-intents-to-json-btn');
    exportFaqToJsonBtnEl.blur();
    this.faqService.exportIntentsToJSON(this.id_faq_kb).subscribe((faq: any) => {
      // this.logger.log('[TILEBOT] - EXPORT BOT TO JSON - FAQS', faq)
      // this.logger.log('[TILEBOT] - EXPORT FAQ TO JSON - FAQS INTENTS', faq.intents)
      if (faq) {
        this.downloadObjectAsJson(faq, this.faqKb_name + ' intents');
      }
    }, (error) => {
      this.logger.error('[TILEBOT] - EXPORT BOT TO JSON - ERROR', error);
    }, () => {
      this.logger.log('[TILEBOT] - EXPORT BOT TO JSON - COMPLETE');

    });
  }

  downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

   // --------------------------------------------------------------------------
  // @ Import chatbot from json ! NOT USED
  // --------------------------------------------------------------------------
  fileChangeUploadChatbotFromJSON(event) {

    this.logger.log('[TILEBOT] - fileChangeUploadChatbotFromJSON $event ', event);
    let fileJsonToUpload = ''
    // this.logger.log('[TILEBOT] - fileChangeUploadChatbotFromJSON $event  target', event.target);
    const selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(selectedFile, "UTF-8");
    fileReader.onload = () => {
      fileJsonToUpload = JSON.parse(fileReader.result as string)
      this.logger.log('fileJsonToUpload CHATBOT', fileJsonToUpload);
    }
    fileReader.onerror = (error) => {
      this.logger.log(error);
    }

    this.faqService.importChatbotFromJSON(this.id_faq_kb, fileJsonToUpload).subscribe((res: any) => {
      this.logger.log('[TILEBOT] - IMPORT CHATBOT FROM JSON - ', res)

    }, (error) => {
      this.logger.error('[TILEBOT] -  IMPORT CHATBOT FROM JSON- ERROR', error);

      this.notify.showWidgetStyleUpdateNotification("thereHasBeenAnErrorProcessing", 4, 'report_problem');
    }, () => {
      this.logger.log('[TILEBOT] - IMPORT CHATBOT FROM JSON - COMPLETE');
    });
  }


    // --------------------------------------------------------------------------
  // @ Import Itents from JSON
  // --------------------------------------------------------------------------
  presentModalImportIntentsFromJson() {
    this.displayImportJSONModal = "block"
  }

  onCloseImportJSONModal() {
    this.displayImportJSONModal = "none"
  }

  fileChangeUploadIntentsFromJSON(event, action) {
    // this.logger.log('[TILEBOT] - fileChangeUploadJSON event ', event);
    // this.logger.log('[TILEBOT] - fileChangeUploadJSON action ', action);
    const fileList: FileList = event.target.files;
    const file: File = fileList[0];
    const formData: FormData = new FormData();
    formData.set('id_faq_kb', this.id_faq_kb);
    formData.append('uploadFile', file, file.name);
    this.logger.log('FORM DATA ', formData)

    this.faqService.importIntentsFromJSON(this.id_faq_kb, formData ,action).subscribe((res: any) => {
      this.logger.log('[TILEBOT] - IMPORT INTENTS FROM JSON - ', res)

    }, (error) => {
      this.logger.error('[TILEBOT] -  IMPORT INTENTS FROM JSON- ERROR', error);

      this.notify.showWidgetStyleUpdateNotification("thereHasBeenAnErrorProcessing", 4, 'report_problem');
    }, () => {
      this.logger.log('[TILEBOT] - IMPORT INTENTS FROM JSON - * COMPLETE *');
      this.notify.showWidgetStyleUpdateNotification("File was uploaded succesfully", 2, 'done');

      this.onCloseImportJSONModal();
      
    });
  }



  exportFaqsToCsv() {
    this.faqService.exsportFaqsToCsv(this.id_faq_kb).subscribe((faq: any) => {
      this.logger.log('[CDS-CHATBOT-DTLS] - EXPORT FAQ TO CSV - FAQS', faq)

      if (faq) {
        this.downloadFile(faq, 'faqs.csv');
      }
    }, (error) => {
      this.logger.error('[CDS-CHATBOT-DTLS] - EXPORT FAQ TO CSV - ERROR', error);
    }, () => {
      this.logger.log('[CDS-CHATBOT-DTLS] - EXPORT FAQ TO CSV - COMPLETE');
    });
  }

  downloadFile(data, filename) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    this.logger.log('[CDS-CHATBOT-DTLS] isSafariBrowser ', isSafariBrowser)
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');

      /**
       * *** FOR SAFARI TO UNCOMMENT AND TEST ***
       */
      // https://stackoverflow.com/questions/29799696/saving-csv-file-using-blob-in-safari/46641236
      // const link = document.createElement('a');
      // link.id = 'csvDwnLink';

      // document.body.appendChild(link);
      // window.URL = window.URL;
      // const csv = '\ufeff' + data,
      //   csvData = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csv),
      //   filename = 'filename.csv';
      // $('#csvDwnLink').attr({ 'download': filename, 'href': csvData });
      // $('#csvDwnLink')[0].click();
      // document.body.removeChild(link);
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename);
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  downloadExampleCsv() {
    // const examplecsv = 'Question; Answer; intent_id (must be unique); intent_display_name; webhook_enabled (must be false)'
    const examplecsv = 'Where is standard shipping available?;Standard shipping is only available to the contiguous US, excluding Alaska, Hawaii, and all US territories. If you are shipping to any of these excluded regions, you are ineligible for standard shipping\nHow is software delivered?;Unless otherwise stated, Software shall be delivered digitally. Instructions for download orders will be sent via email\nWhen will my backorder ship?;Although we try to maintain inventory of all products in the warehouse, occasionally an item will be backordered. Normally, the product will become available in a week. You will receive an email notification as soon as the product ships. As a reminder, your credit card will not be charged until your order has been shipped. If you use a third-party payment or billing provider (e.g., PayPal), you may be charged before your order ships pursuant to their terms and conditions\nCan I change my shipping address?;Unfortunately, you cannot change your shipping address after your order has been submitted. The order is immediately sent to the fulfilment agency and can no longer be changed by our system. If your package is not successfully delivered, it will be returned to the warehouse and a credit will be made to your account\nCan I change my shipping method?;Unfortunately, you cannot change your shipment method after your order has been submitted. The order is immediately sent to the fulfilment agency and can no longer be changed by our system\nShipping notification;Shipment confirmation emails with tracking numbers are sent the business day after your order ships\nDelivery costs;Delivery costs are calculated and displayed after you have entered your shipping information on the checkout page\nDo you ship to P.O. Boxes?;Due to shipping restrictions, we cannot deliver to P.O. Boxes\nWhen is your shipping cut off time?;Orders placed for in-stock items before 10am PST (Pacific Standard Time), Monday through Friday will usually ship within one business day. We do not offer Saturday, Sunday, or holiday shipping or deliveries. Please note that we may have to verify your billing information. Any incomplete or incorrect information may result in processing delays or cancellations\n'
    this.downloadFile(examplecsv, 'example.csv');
  }

  openImportModal() {
    this.displayImportModal = 'block';
  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.displayDeleteFaqModal = 'none';
    this.displayInfoModal = 'none';
    this.displayImportModal = 'none';
  }

  onCloseInfoModalHandledError() {
    this.logger.log('[CDS-CHATBOT-DTLS] onCloseInfoModalHandledError')
    this.displayInfoModal = 'none';
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    // this.ngOnInit();
  }

  onCloseInfoModalHandledSuccess() {
    this.displayInfoModal = 'none';
  }


  countDelimiterDigit(event) {
    this.logger.log('[CDS-CHATBOT-DTLS] # OF DIGIT ', this.csvColumnsDelimiter.length)
    if (this.csvColumnsDelimiter.length !== 1) {
      (<HTMLInputElement>document.getElementById('file')).disabled = true;
      this.modalChoosefileDisabled = true;
    } else {
      (<HTMLInputElement>document.getElementById('file')).disabled = false;
      this.modalChoosefileDisabled = false;
    }
  }

  // UPLOAD FAQ FROM CSV
  fileChangeUploadCSV(event) {
    this.displayImportModal = 'none';
    this.displayInfoModal = 'block';

    this.SHOW_CIRCULAR_SPINNER = true;

    this.logger.log('[CDS-CHATBOT-DTLS] CSV COLUMNS DELIMITER ', this.csvColumnsDelimiter)
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.set('id_faq_kb', this.id_faq_kb);
      formData.set('delimiter', this.csvColumnsDelimiter);
      formData.append('uploadFile', file, file.name);
      this.logger.log('FORM DATA ', formData)

      this.faqService.uploadFaqCsv(formData)
        .subscribe(data => {
          this.logger.log('[CDS-CHATBOT-DTLS] UPLOAD CSV DATA ', data);
          if (data['success'] === true) {
            this.parse_done = true;
            this.parse_err = false;
          } else if (data['success'] === false) {
            this.parse_done = false;
            this.parse_err = true;
          }
        }, (error) => {
          this.logger.error('[CDS-CHATBOT-DTLS] UPLOAD CSV - ERROR ', error);
          this.SHOW_CIRCULAR_SPINNER = false;
        }, () => {
          this.logger.log('[CDS-CHATBOT-DTLS] UPLOAD CSV * COMPLETE *');
          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
          }, 300);
        });

    }
  }

  // ------------------------------------------
  // @ Common methods
  // ------------------------------------------
  getTranslations() {
    this.translate.get('UpdateBotError')
      .subscribe((text: string) => {
        this.updateBotError = text;
      });

    this.translate.get('UpdateBotSuccess')
      .subscribe((text: string) => {
        this.updateBotSuccess = text;
      });

    this.translate.get('Not a valid JSON file.')
      .subscribe((text: string) => {
        this.notValidJson = text;
      });

    this.translate.get('FaqPage.AnErrorOccurredWhilDeletingTheAnswer')
      .subscribe((text: string) => {
        this.errorDeletingAnswerMsg = text;
      });

    this.translate.get('FaqPage.AnswerSuccessfullyDeleted')
      .subscribe((text: string) => {
        this.answerSuccessfullyDeleted = text;
      });

    this.translate.get('Done')
      .subscribe((text: string) => {
        this.done_msg = text;
      });


    this.translate.get('ThereHasBeenAnErrorProcessing')
      .subscribe((translation: any) => {
        this.thereHasBeenAnErrorProcessing = translation;
      });

  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = this.public_Key.split("-");

    keys.forEach(key => {

      if (key.includes("DEP")) {
        let dep = key.split(":");
        if (dep[1] === "F") {
          this.isVisibleDEP = false;
          //this.logger.log('PUBLIC-KEY (Faqcomponent) - isVisibleDEP', this.isVisibleDEP);
        } else {
          this.isVisibleDEP = true;
          //this.logger.log('PUBLIC-KEY (Faqcomponent) - isVisibleDEP', this.isVisibleDEP);
        }
      }
      // if (key.includes("PAY")) {
      //  this.logger.log('[CDS-CHATBOT-DTLS] PUBLIC-KEY - key', key);
      //   let pay = key.split(":");
      //   //this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
      //   if (pay[1] === "F") {
      //     this.payIsVisible = false;
      //    this.logger.log('[CDS-CHATBOT-DTLS] - pay isVisible', this.payIsVisible);
      //   } else {
      //     this.payIsVisible = true;
      //    this.logger.log('[CDS-CHATBOT-DTLS] - pay isVisible', this.payIsVisible);
      //   }
      // }
      // if (key.includes("ANA")) {

      //   let ana = key.split(":");

      //   if (ana[1] === "F") {
      //     this.isVisibleAnalytics = false;
      //   } else {
      //     this.isVisibleAnalytics = true;
      //   }
      // }

    });

    if (!this.public_Key.includes("DEP")) {
      this.isVisibleDEP = false;
    }

    // if (!this.public_Key.includes("ANA")) {
    //   this.isVisibleAnalytics = false;
    // }

    // if (!this.public_Key.includes("PAY")) {
    //   this.payIsVisible = false;
    //   //this.logger.log('[CDS-CHATBOT-DTLS] - pay isVisible', this.payIsVisible);
    // }
  }

}
