import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../core/notify.service';
import { TagsService } from '../services/tags.service';
import { LocalDbService } from '../services/users-local-db.service';
import { UsersService } from '../services/users.service';
import { AppConfigService } from '../services/app-config.service';
import { AuthService } from '../core/auth.service';
import { LoggerService } from '../services/logger/logger.service';
@Component({
  selector: 'appdashboard-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit, AfterViewInit {

  tagsList: Array<any>;
  tagname: string;
  tag_name: string; // is that passed to the delete modal
  tagid: string;
  create_label_success: string;
  create_label_error: string;
  update_label_success: string;
  update_label_error: string;

  showSpinner = true;
  tag_selected_color = '#43B1F2';
  tag_new_selected_color: string;
  displayModalDeleteTag = 'none';
  displayModalEditTag = 'none';

  isOpenEditTagColorDropdown = false;
  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  hasError = false;
 
  tagColor = [
    { name: 'red', hex: '#FF5C55' },
    { name: 'orange', hex: '#F89D34' },
    { name: 'yellow', hex: '#F3C835' },
    { name: 'green', hex: '#66C549' },
    { name: 'blue', hex: '#43B1F2' },
    { name: 'violet', hex: '#CB80DD' },
  ];
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  isChromeVerGreaterThan100: boolean;
  constructor(
    public translate: TranslateService,
    private notify: NotifyService,
    private tagsService: TagsService,
    private usersLocalDbService: LocalDbService,
    public appConfigService: AppConfigService,
    private usersService: UsersService,
    private auth: AuthService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.getTag();
    this.translateNotificationMsgs();
    this.getImageStorage();
    this.listenSidebarIsOpened();
    this.getBrowserVersion() 
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   } 

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[TAGS] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }
  ngAfterViewInit() { }

  getImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[TAGS] IMAGE STORAGE ', this.storageBucket, 'usecase native')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;

      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[TAGS] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  translateNotificationMsgs() {
    this.translate.get('Tags.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('[TAGS]  translateNotificationMsgs text', translation)
        this.create_label_success = translation.CreateLabelSuccess;
        this.create_label_error = translation.CreateLabelError;
        this.update_label_success = translation.UpdateLabelSuccess;
        this.update_label_error = translation.UpdateLabelError

      }, err => {
        this.logger.error('[TAGS] TRANSLATE GET NOTIFICATION MSGS - ERROR ',err);
      }, () => {
        this.logger.log('[TAGS] TRANSLATE GET NOTIFICATION MSGS * COMPLETE *');
      });
  }


  getTag() {
    this.tagsService.getTags().subscribe((tags: any) => {
      this.logger.log('TAGS] - GET TAGS - RES ', tags);

      if (tags) {
        this.tagsList = tags;

        this.tagsList.forEach(tag => {

          // -----------------------------------------------------
          // Get the user by id ('createdBy' matches the user id)
          // -----------------------------------------------------
          const user = this.usersLocalDbService.getMemberFromStorage(tag.createdBy);
          this.logger.log('[TAGS] - GET TAGS - getMemberFromStorage - createdBy ', user);
          if (user !== null) {
            tag.createdBy_user = user;
          } else {
            // -----------------------------------------------------
            // From remote if not exist in the local storage
            // -----------------------------------------------------
            this.getMemberFromRemote(tag, tag.createdBy);
          }
        });
      }
    }, (error) => {
      this.logger.error('[TAGS] - GET TAGS - ERROR ', error);
      this.showSpinner = false
    }, () => {
      this.logger.log('[TAGS] - GET TAGS * COMPLETE *');
      this.showSpinner = false
    });
  }


  getMemberFromRemote(tag: any, userid: string) {
    this.usersService.getProjectUserById(userid)
      .subscribe((projectuser) => {
        this.logger.log('[TAGS] - getMemberFromRemote ID ', projectuser);

        tag.createdBy_user = projectuser[0].id_user;

      }, (error) => {
        this.logger.error('[TAGS] - getMemberFromRemote - ERROR ', error);
      }, () => {
        this.logger.log('[TAGS] - getMemberFromRemote * COMPLETE *');
      });
  }


  tagSelectedColor(hex: any) {
    // console.log('[TAGS] - TAG SELECTED COLOR ', hex);
    this.tag_selected_color = hex;
  }


  createTag() {
    // console.log('[TAGS] - CREATE TAG - TAG-NAME: ', this.tagname, ' TAG-COLOR: ', this.tag_selected_color)
    const createTagBtn = <HTMLElement>document.querySelector('.create-tag-btn');

    createTagBtn.blur();

    if (this.tagname && this.tagname.length > 0) {
      this.hasError = false;

      this.tagsService.createTag(this.tagname, this.tag_selected_color)
        .subscribe((tag: any) => {
          this.logger.log('[TAGS] - CREATE TAG - RES ', tag);

        }, (error) => {
          this.logger.error('[TAGS] - CREATE TAG - ERROR  ', error);
          this.notify.showWidgetStyleUpdateNotification(this.create_label_error, 4, 'report_problem');
        }, () => {
          this.logger.log('[TAGS] - CREATE TAG * COMPLETE *');
          this.notify.showWidgetStyleUpdateNotification(this.create_label_success, 2, 'done');

          this.tagname = '';
          this.tag_selected_color = '#43B1F2';

          this.getTag();
        });

    } else {

      this.hasError = true;
    }

  }

  onChangeTagname($event) {
    this.logger.log('[TAGS] - ON-CHANGE-TAG-NAME ', $event);

    if ($event.length > 0) {
      this.hasError = false;
    }
  }

  presentModalDeleteTag(tag_id: string, tag_name: string) {
    this.displayModalDeleteTag = 'block';
    this.tagid = tag_id;
    this.tag_name = tag_name;
    this.logger.log('[TAGS] - presentModalDeleteTag - tagid  ', this.tagid, ' tagname ', this.tagname);
  }

  closeModalDeleteTag() {
    this.displayModalDeleteTag = 'none';
  }

  onTagDeleted() {
    this.getTag();
  }

  // !! NOT USED
  openEditColorDropdown() {
    this.isOpenEditTagColorDropdown = !this.isOpenEditTagColorDropdown
    this.logger.log('[TAGS] - openEditColorDropdown - isOpenEditTagColorDropdown  ', this.isOpenEditTagColorDropdown);
  }

  tagNewColorSelected(hex: string, tagid, tagname) {
    this.logger.log('[TAGS] - editTag - tagid  ', tagid, ' tag name: ', tagname);
    this.tag_new_selected_color = hex;
    this.logger.log('[TAGS] - tagNewColorSelected - tag_new_selected_color  ', this.tag_new_selected_color);
  }

  editTag(tagname: string, hex: string, tagid: string, index: number) {
    this.logger.log('[TAGS] - editTag - new color ', hex, ' tagid: ', tagid, ' tag name: ', tagname, ' index ', index);

    this.tagsService.updateTag(tagname, hex, tagid)
      .subscribe((tag: any) => {
        this.logger.log('[TAGS] - EDIT TAG - RES ', tag);

      }, (error) => {
        this.logger.error('[TAGS] - EDIT TAG - ERROR  ', error);
        this.notify.showWidgetStyleUpdateNotification(this.update_label_error, 4, 'report_problem');
      }, () => {
        this.logger.log('[TAGS] - EDIT TAG * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.update_label_success, 2, 'done');

        this.getTag();
      });
  }

}
