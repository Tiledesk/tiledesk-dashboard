import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TagsService } from '../../services/tags.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../core/notify.service';
import { LoggerService } from '../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-tags-delete',
  templateUrl: './tags-delete.component.html',
  styleUrls: ['./tags-delete.component.scss']
})
export class TagsDeleteComponent implements OnInit {

  displayModalDeleteTag = 'block'
  @Input() tagid: string;
  @Input() tag_name: string;

  @Output() closeModal = new EventEmitter();
  @Output() hasDeletedTag = new EventEmitter();

  delete_label_success: string;
  delete_label_error: string;

  constructor(
    public translate: TranslateService,
    private notify: NotifyService,
    private tagsService: TagsService,
    private logger: LoggerService
  ) { }

  ngOnInit() {

   this.logger.log('[TAGS][TAGS-DELETE] - ngOnInit - tagid  ', this.tagid, ' tagname ', this.tag_name);
    this.translateNotificationMsgs()
  }

  translateNotificationMsgs() {
    this.translate.get('Tags.NotificationMsgs')
      .subscribe((translation: any) => {
        //this.logger.log('[TAGS][TAGS-DELETE]  translateNotificationMsgs text', translation)
        this.delete_label_success = translation.DeleteLabelSuccess;
        this.delete_label_error = translation.DeleteLabelError;
      }, err => {
        this.logger.error('[TAGS][TAGS-DELETE] TRANSLATE GET NOTIFICATION MSGS - ERROR ',err);
      }, () => {
        this.logger.log('[TAGS][TAGS-DELETE] TRANSLATE GET NOTIFICATION MSGS * COMPLETE *');
      });
  }

  closeModalDeleteTag() {
   this.logger.log('[TAGS][TAGS-DELETE] - CLOSE MODAL DELETE TAG');
    this.closeModal.emit();
  }

  deleteTag() {
   this.logger.log('[TAGS][TAGS-DELETE] - deleteTag - tagid  ', this.tagid);
    this.tagsService.deleteTag(this.tagid).subscribe((res: any) => {
     this.logger.log('[TAGS][TAGS-DELETE] - DELETE TAG - RES ', res);

    }, (error) => {
      this.logger.error('[TAGS][TAGS-DELETE] - DELETE TAG - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification(this.delete_label_error, 4, 'report_problem');

    }, () => {
     this.logger.log('[TAGS][TAGS-DELETE] - DELETE TAG * COMPLETE *');
      this.notify.showWidgetStyleUpdateNotification(this.delete_label_success, 2, 'done');
      this.hasDeletedTag.emit();
      this.closeModal.emit();

    });

  }
}
