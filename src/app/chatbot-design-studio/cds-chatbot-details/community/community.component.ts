import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CdsPublishOnCommunityModalComponent } from 'app/chatbot-design-studio/cds-dashboard/cds-publish-on-community-modal/cds-publish-on-community-modal.component';
import { CERTIFIED_TAGS } from 'app/chatbot-design-studio/utils';
import { NotifyService } from 'app/core/notify.service';
import { Chatbot } from 'app/models/faq_kb-model';
import { Project } from 'app/models/project-model';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
const swal = require('sweetalert');

@Component({
  selector: 'cds-detail-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss']
})
export class CDSDetailCommunityComponent implements OnInit {

  @ViewChild(NgSelectComponent, { static: false }) ngSelect: NgSelectComponent

  @Input() selectedChatbot: Chatbot
  @Input() project: Project;
  @Input() translationsMap: Map<string, string> = new Map();


  tagsList: Array<any> = []
  tags: Array<any> = []
  tag: any;

  certifiedTag: { name: string, color: string }
  certifiedTags = CERTIFIED_TAGS

  certifiedTagNotSelected: boolean;
  titleIsEmpty: boolean;
  shortDescriptionIsEmpty: boolean;

  constructor(
    private logger: LoggerService,
    public dialog: MatDialog,
    private faqKbService: FaqKbService,
    private notify: NotifyService,
  ) { }

  ngOnInit(): void {
    console.log('[CDS-DETAIL-COMMUNITY] onInit-->', this.selectedChatbot)
    if (this.selectedChatbot && this.selectedChatbot.tags) {
      this.tagsList = this.selectedChatbot.tags
    }
    if (this.selectedChatbot && this.selectedChatbot.certifiedTags && this.selectedChatbot.certifiedTags.length > 0) {
      this.certifiedTag = this.selectedChatbot.certifiedTags[0]
    }
    console.log('[CDS-DETAIL-COMMUNITY] onInit-->', this.certifiedTag)
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
      // self.updateChatbot(self.selectedChatbot)

    } else {
      this.logger.log("Create New TAG Clicked - Tag already exist ")

    }
  }

  removeTag(tag: string) {
    // if (this.DISABLE_ADD_NOTE_AND_TAGS === false) {
    this.logger.log('[CDS-DETAIL-COMMUNITY] - REMOVE TAG - tag TO REMOVE: ', tag);
    var index = this.tagsList.indexOf(tag);
    if (index !== -1) {
      this.tagsList.splice(index, 1);
    }
    this.selectedChatbot.tags = this.tagsList
    // this.updateChatbot(this.selectedChatbot)
    this.logger.log('[CDS-DETAIL-COMMUNITY] -  REMOVE TAG - TAGS ARRAY AFTER SPLICE: ', this.tagsList);

  }


  publishOnCommunity() {
    this.logger.log('openDialog')
    const dialogRef = this.dialog.open(CdsPublishOnCommunityModalComponent, {
      data: {
        chatbot: this.selectedChatbot,
        projectId: this.project._id
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.logger.log(`Dialog result: ${result}`);
    });
  }

  _publishOnCommunity() {
    swal({
      title: "Publish the chatbot",
      text: 'You are about to publish the chatbot in the community',
      icon: "info",
      buttons: ["Cancel", 'Publish'],
      dangerMode: false,
    })
      .then((WillPublish) => {
        if (WillPublish) {
          this.logger.log('[CDS DSBRD] publishOnCommunity swal WillPublish', WillPublish)
          this.selectedChatbot.public = true
          this.faqKbService.updateChatbot(this.selectedChatbot).subscribe((data) => {
            this.logger.log('[CDS DSBRD] publishOnCommunity - RES ', data)
          }, (error) => {
            swal('An error has occurred', {
              icon: "error",
            });
            this.logger.error('[CDS DSBRD] publishOnCommunity ERROR ', error);
          }, () => {
            this.logger.log('[CDS DSBRD] publishOnCommunity * COMPLETE *');
            swal("Done!", "The Chatbot has been published in the community", {
              icon: "success",
            }).then((okpressed) => {

            });
          });
        } else {
          this.logger.log('[CDS DSBRD] publishOnCommunity (else)')
        }
      });
  }


  removeFromCommunity() {

    swal({
      title: "Are you sure",
      text: 'You are about to remove the chatbot from the community',
      icon: "warning",
      buttons: ["Cancel", 'Remove'],
      dangerMode: false,
    })
      .then((WillRemove) => {
        if (WillRemove) {
          this.logger.log('[CDS DSBRD] removeFromCommunity swal WillRemove', WillRemove)
          this.selectedChatbot.public = false
          this.faqKbService.updateChatbot(this.selectedChatbot).subscribe((data) => {
            this.logger.log('[CDS DSBRD] removeFromCommunity - RES ', data)
          }, (error) => {
            swal('An error has occurred', {
              icon: "error",
            });
            this.logger.error('[CDS DSBRD] removeFromCommunity ERROR ', error);
          }, () => {
            this.logger.log('[CDS DSBRD] removeFromCommunity * COMPLETE *');
            swal("Done!", "The Chatbot has been removed from the community", {
              icon: "success",
            }).then((okpressed) => {

            });
          });
        } else {
          this.logger.log('[CDS DSBRD] removeFromCommunity (else)')
        }
      });

  }

  addMainCategory(category) {
    console.log('[CDS-DETAIL-COMMUNITY] addMainCategory -->', category)
    if (category) {
      this.selectedChatbot.certifiedTags = [category]
      this.certifiedTagNotSelected = false
    }
  }

  onChangeTitle(event) {
    console.log('[CDS-DETAIL-COMMUNITY] onChangeTitle > event', event)
    if (event.length > 0) {
      this.titleIsEmpty = false
    } else {
      this.titleIsEmpty = true
      this.selectedChatbot.title = undefined
    }
  }

  onChangeShortDescription(event) {
    console.log('[CDS-DETAIL-COMMUNITY] onChangeShortDescription > event', event)
    if (event.length > 0) {
      this.shortDescriptionIsEmpty = false
    } else {
      this.shortDescriptionIsEmpty = true
      this.selectedChatbot.short_description = undefined
    }
  }


  update() {
    if (!this.certifiedTag) {
      this.certifiedTagNotSelected = true
    }

    if (!this.selectedChatbot.title) {
      this.titleIsEmpty = true
    }

    if (!this.selectedChatbot.short_description ){
      this.shortDescriptionIsEmpty = true
    }
    
    if (!this.certifiedTag || !this.selectedChatbot.title || !this.selectedChatbot.short_description) {
      return
    }

   

    console.log('[CDS-DETAIL-COMMUNITY] updateDataOnCommunity chatbot -->', this.selectedChatbot)
    this.faqKbService.updateChatbot(this.selectedChatbot).subscribe((chatbot) => {
      console.log('responseeeeeee--> ', chatbot)
    }, (error) => {
      this.logger.error('[CDS-CHATBOT-DTLS] EDIT BOT -  ERROR ', error);


      // =========== NOTIFY ERROR ===========
      this.notify.showWidgetStyleUpdateNotification(this.translationsMap.get('UpdateBotError'), 4, 'report_problem');

    }, () => {
      this.logger.log('[CDS-CHATBOT-DTLS] EDIT BOT - * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      this.notify.showWidgetStyleUpdateNotification(this.translationsMap.get('UpdateBotSuccess'), 2, 'done');
      this.selectedChatbot.name
    })
  }


  goToCommunityChatbotDetail(bot_id: string) {
    let urlCommunity = 'https://tiledesk.com/community/search/getchatbotinfo/chatbotId/' + bot_id + '-' + this.selectedChatbot.title.replace(/[^a-zA-Z0-9]/g, '-')
    window.open(urlCommunity, '_blank')

  }


}
