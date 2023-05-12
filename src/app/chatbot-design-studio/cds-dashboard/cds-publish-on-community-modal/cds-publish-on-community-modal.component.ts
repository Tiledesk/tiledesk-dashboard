import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NotifyService } from 'app/core/notify.service';
import { Chatbot } from 'app/models/faq_kb-model';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';
import { UploadImageService } from 'app/services/upload-image.service';
@Component({
  selector: 'appdashboard-cds-publish-on-community-modal',
  templateUrl: './cds-publish-on-community-modal.component.html',
  styleUrls: ['./cds-publish-on-community-modal.component.scss']
})
export class CdsPublishOnCommunityModalComponent implements OnInit {

  @ViewChild('Selecter', { static: false }) ngselect: NgSelectComponent;
  @ViewChild(NgSelectComponent, { static: false }) ngSelect: NgSelectComponent
  tagsList: Array<any> = []
  tag: any;
  tagcolor: any;
  tagsArray: Array<any>
  selectedChatbot: Chatbot
  projectId: string;
  botProfileImageExist: boolean;
  botImageHasBeenUploaded = false;
  id_faq_kb: string;
  faqKb_name: string;
  faqKb_description: string;
  storageBucket: string;
  showSpinnerInUploadImageBtn = false;
  botProfileImageurl: string;
  timeStamp: any;
  selectedIndex = 1;
  @ViewChild('cdsfileInputBotProfileImage', { static: false }) cdsfileInputBotProfileImage: any;
  @ViewChild('editbotbtn', { static: false }) private elementRef: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CdsPublishOnCommunityModalComponent>,
    private faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    private sanitizer: DomSanitizer,
    private notify: NotifyService,
  ) {
    this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] data ', data)
    this.selectedChatbot = data.chatbot;
    this.projectId = data.projectId;
    this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] selectedChatbot ', this.selectedChatbot)
    this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] projectId ', this.projectId)
    if (this.selectedChatbot) {
      this.id_faq_kb = this.selectedChatbot._id;
      this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] - id_faq_kb ', this.id_faq_kb)
      this.faqKb_name = this.selectedChatbot.name;
      this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] - faqKb_name ', this.faqKb_name)

      this.faqKb_description = this.selectedChatbot.description;
      this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] - faqKb_description ', this.faqKb_description);
      
      this.tagsList = this.selectedChatbot.tags
      this.checkBotImageExist()
    }
  }

  ngOnInit(): void {
    this.checkBotImageUploadIsComplete();
  }

  // --------------------------------------------------
  // Basic 
  // --------------------------------------------------

  checkBotImageExist() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.checkBotImageExistOnFirebase();
    } else {
      this.checkBotImageExistOnNative();
    }
  }

  checkBotImageExistOnFirebase() {
    this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] checkBotImageExistOnFirebase ')
    this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] STORAGE-BUCKET firebase_conf ', this.appConfigService.getConfig().firebase)

    const firebase_conf = this.appConfigService.getConfig().firebase;
    if (firebase_conf) {
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] STORAGE-BUCKET  ', this.storageBucket)
    }

    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/' + this.storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';

    const self = this;
  
    this.verifyImageURL(imageUrl, function (imageExists) {

      if (imageExists === true) {
        self.botProfileImageExist = imageExists

        self.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] BOT PROFILE IMAGE - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
        self.setImageProfileUrl(self.storageBucket);
      } else {
        self.botProfileImageExist = imageExists

        self.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] BOT PROFILE IMAGE - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
      }
    })
  }
  checkBotImageExistOnNative() {
    const baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
    const imageUrl = baseUrl + 'images?path=uploads%2Fusers%2F' + this.id_faq_kb + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    const self = this;
    this.botProfileImageExist = false
    this.verifyImageURL(imageUrl, function (imageExists) {

      if (imageExists === true) {
        self.botProfileImageExist = imageExists

        self.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] BOT PROFILE IMAGE - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')

        self.setImageProfileUrl_Native(baseUrl)

      } else {
        self.botProfileImageExist = imageExists

        self.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] BOT PROFILE IMAGE - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')
      }
    })
  }

  setImageProfileUrl(storageBucket) {
    this.botProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';

    this.timeStamp = (new Date()).getTime();
  }

  setImageProfileUrl_Native(storage) {
    this.botProfileImageurl = storage + 'images?path=uploads%2Fusers%2F' + this.id_faq_kb + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    //this.logger.log('PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  getBotProfileImage(): SafeUrl {
    if (this.timeStamp) {
      // this.logger.log('getBotProfileImage this.botProfileImageurl', this.botProfileImageurl)
      return this.sanitizer.bypassSecurityTrustUrl(this.botProfileImageurl + '&' + this.timeStamp);
    }
    return this.sanitizer.bypassSecurityTrustUrl(this.botProfileImageurl)
  }

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
    this.cdsfileInputBotProfileImage.nativeElement.value = '';
  }

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
    this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] checkBotImageUploadIsComplete')
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.uploadImageService.botImageWasUploaded.subscribe((imageuploaded) => {
        this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] BOT PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', imageuploaded, '(usecase Firebase)');
        this.botImageHasBeenUploaded = imageuploaded;

        if (this.storageBucket && this.botImageHasBeenUploaded === true) {

          this.showSpinnerInUploadImageBtn = false;

          this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] BOT PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE - BUILD botProfileImageurl ');

          this.setImageProfileUrl(this.storageBucket)
        }
      });
    } else {
      // Native
      this.uploadImageNativeService.botImageWasUploaded_Native.subscribe((imageuploaded) => {
        this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] BOT PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', imageuploaded, '(usecase Native)');

        this.botImageHasBeenUploaded = imageuploaded;

        this.showSpinnerInUploadImageBtn = false;

        // here "setImageProfileUrl" is missing because in the "upload" method there is the subscription to the downoload
        // url published by the BehaviourSubject in the service
      })
    }
  }

  editBot() {
    // RESOLVE THE BUG 'edit button remains focused after clicking'
    this.elementRef.nativeElement.blur();
    // this.logger.log('[CDS-CHATBOT-DTLS] FAQ KB NAME TO UPDATE ', this.faqKb_name);
    // this.selectedChatbot.name = this.faqKb_name
    // this.selectedChatbot.description = this.faqKb_description;
    this.updateChatbot(this.selectedChatbot)
  }

  // --------------------------------------------------------------------------------
  // Tags 
  // --------------------------------------------------------------------------------
  createNewTag = (newTag: string) => {
    this.logger.log("Create New TAG Clicked -> newTag: " + newTag)
    var index = this.tagsList.findIndex(t => t.tag === newTag);
    if (index === -1) {
      this.logger.log("Create New TAG Clicked - Tag NOT exist")
      this.tagsList.push(newTag)
      this.logger.log("Create New TAG Clicked - chatbot tag tagsList : ", this.tagsList)

      let self = this;
      this.logger.log(' this.ngSelect', this.ngSelect)
      if (this.ngSelect) {
        this.ngSelect.close()
        this.ngSelect.blur()
      }

      self.selectedChatbot.tags = this.tagsList
      self.updateChatbot(self.selectedChatbot)

    } else {
      this.logger.log("Create New TAG Clicked - Tag already exist ")

    }
  }

  removeTag(tag: string) {
    // if (this.DISABLE_ADD_NOTE_AND_TAGS === false) {
    this.logger.log('[WS-REQUESTS-MSGS] - REMOVE TAG - tag TO REMOVE: ', tag);
    var index = this.tagsList.indexOf(tag);
    if (index !== -1) {
      this.tagsList.splice(index, 1);
    }
    this.selectedChatbot.tags = this.tagsList
    this.updateChatbot(this.selectedChatbot)
    this.logger.log('[WS-REQUESTS-MSGS] -  REMOVE TAG - TAGS ARRAY AFTER SPLICE: ', this.tagsList);

  }


  // --------------------------------------------------------------------------------
  // Publish to commmunity 
  // --------------------------------------------------------------------------------
  publishOnCommunity() {
    this.selectedChatbot.name = this.faqKb_name
    this.selectedChatbot.description = this.faqKb_description;
    this.selectedChatbot.public = true;
    // console.log('publishOnCommunity:: ', this.selectedChatbot);
    this.faqKbService.updateChatbot(this.selectedChatbot).subscribe((data) => {
      this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] publishOnCommunity - RES ', data)
    }, (error) => {

      this.logger.error('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] publishOnCommunity ERROR ', error);
    }, () => {

      this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] publishOnCommunity * COMPLETE * ');
      this.notify.showWidgetStyleUpdateNotification('Successfully deployed', 2, 'done');
      this.dialogRef.close();

    });
  }

  updateChatbot(selectedChatbot) {
    this.selectedChatbot.name = this.faqKb_name
    this.selectedChatbot.description = this.faqKb_description;
    this.faqKbService.updateChatbot(selectedChatbot)
      .subscribe((chatbot: any) => {
        this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] - UPDATED CHATBOT - RES ', chatbot);

      }, (error) => {
        this.logger.error('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] - UPDATED CHATBOT - ERROR  ', error);
        // self.notify.showWidgetStyleUpdateNotification(this.create_label_error, 4, 'report_problem');
      }, () => {
        this.logger.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] - UPDATED CHATBOT * COMPLETE *');

      });
  }

  selectTab(index: number): void {
    // console.log('selectTab index', index)
    this.selectedIndex = index;
  }


}
