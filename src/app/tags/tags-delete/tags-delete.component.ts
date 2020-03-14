import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TagsService } from '../../services/tags.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../core/notify.service';

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
    private tagsService: TagsService

  ) { }

  ngOnInit() {

    console.log('TAGS-DELETE.COMP - ngOnInit - tagid  ', this.tagid, ' tagname ', this.tag_name);
    this.translateNotificationMsgs()
  }

  translateNotificationMsgs() {
    this.translate.get('Tags.NotificationMsgs')
      .subscribe((translation: any) => {
        console.log('TAGS  translateNotificationMsgs text', translation)
        this.delete_label_success = translation.DeleteLabelSuccess;
        this.delete_label_error = translation.DeleteLabelError;
      });
  }

  closeModalDeleteTag() {
    console.log('TAGS-DELETE.COMP - CLOSE MODAL DELETE TAG');
    this.closeModal.emit();
  }

  deleteTag() {
    console.log('TAGS-DELETE.COMP - deleteTag - tagid  ', this.tagid);
    this.tagsService.deleteTag(this.tagid).subscribe((res: any) => {
      console.log('TAGS-DELETE.COMP - DELETE TAG - RES ', res);

    }, (error) => {
      console.log('TAGS-DELETE.COMP - DELETE TAG - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification(this.delete_label_error, 4, 'report_problem');

    }, () => {
      console.log('TAGS-DELETE.COMP - DELETE TAG * COMPLETE *');
      this.notify.showWidgetStyleUpdateNotification(this.delete_label_success, 2, 'done');
      this.hasDeletedTag.emit();
      this.closeModal.emit();

    });

  }
}
