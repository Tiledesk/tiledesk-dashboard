import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../core/notify.service';
import { TagsService } from '../services/tags.service';
import { LocalDbService } from '../services/users-local-db.service';
import { UsersService } from '../services/users.service';
import { AppConfigService } from '../services/app-config.service';
import { AuthService } from '../core/auth.service';

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

  constructor(
    public translate: TranslateService,
    private notify: NotifyService,
    private tagsService: TagsService,
    private usersLocalDbService: LocalDbService,
    public appConfigService: AppConfigService,
    private usersService: UsersService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getTag();
    this.translateNotificationMsgs();
    this.getImageStorage();
  }

  ngAfterViewInit() {

    // var i;

    // if (this.tagsList) {
    //   for (i = 0; i < this.tagsList.length; i++) {
    //     const dropDownEle = <HTMLElement>document.querySelector(`.drop_down_${i}`);
    //     console.log('TAGS.COMP - GET TAGS - dropDownEle ', dropDownEle);
    //   }
    // }
  }

  getImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      console.log('TAGS IMAGE STORAGE ', this.storageBucket, 'usecase native')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;

      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      console.log('TAGS IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  translateNotificationMsgs() {
    this.translate.get('Tags.NotificationMsgs')
      .subscribe((translation: any) => {
        console.log('TAGS  translateNotificationMsgs text', translation)
        this.create_label_success = translation.CreateLabelSuccess;
        this.create_label_error = translation.CreateLabelError;
        this.update_label_success = translation.UpdateLabelSuccess;
        this.update_label_error = translation.UpdateLabelError

      });
  }


  getTag() {
    this.tagsService.getTags().subscribe((tags: any) => {
      console.log('TAGS.COMP - GET TAGS - RES ', tags);

      if (tags) {
        this.tagsList = tags;

        this.tagsList.forEach(tag => {

          // -----------------------------------------------------
          // Get the user by id ('createdBy' matches the user id)
          // -----------------------------------------------------
          const user = this.usersLocalDbService.getMemberFromStorage(tag.createdBy);
          console.log('TAGS.COMP - GET TAGS - getMemberFromStorage - createdBy ', user);
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
      console.log('TAGS.COMP - GET TAGS - ERROR  ', error);
      this.showSpinner = false
    }, () => {
      console.log('TAGS.COMP - GET TAGS * COMPLETE *');
      this.showSpinner = false
    });
  }


  getMemberFromRemote(tag: any, userid: string) {

    this.usersService.getProjectUserById(userid)
      .subscribe((projectuser) => {
        console.log('TAGS.COMP  - getMemberFromRemote ID ', projectuser);

        tag.createdBy_user = projectuser[0].id_user
        // this.usersLocalDbService.saveMembersInStorage(this.user['_id'], this.user);

      }, (error) => {
        console.log('TAGS.COMP  - getMemberFromRemote - ERROR ', error);
      }, () => {
        console.log('TAGS.COMP  - getMemberFromRemote * COMPLETE *');
      });
  }


  tagSelectedColor(hex: any) {
    console.log('TAGS.COMP - TAG SELECTED COLOR ', hex);
    this.tag_selected_color = hex;
  }


  createTag() {
    console.log('TAGS.COMP - CREATE TAG - TAG-NAME: ', this.tagname, ' TAG-COLOR: ', this.tag_selected_color)
    const createTagBtn = <HTMLElement>document.querySelector('.create-tag-btn');

    createTagBtn.blur();

    if (this.tagname && this.tagname.length > 0) {
      this.hasError = false;

      this.tagsService.createTag(this.tagname, this.tag_selected_color)
        .subscribe((tag: any) => {
          console.log('TAGS.COMP - CREATE TAG - RES ', tag);

        }, (error) => {
          console.log('TAGS.COMP - CREATE TAG - ERROR  ', error);
          this.notify.showWidgetStyleUpdateNotification(this.create_label_error, 4, 'report_problem');
        }, () => {
          console.log('TAGS.COMP - CREATE TAG * COMPLETE *');
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
    console.log('TAGS.COMP - ON-CHANGE-TAG-NAME ', $event);

    if ($event.length > 0) {
      this.hasError = false;
    }
  }

  presentModalDeleteTag(tag_id: string, tag_name: string) {
    this.displayModalDeleteTag = 'block';
    this.tagid = tag_id;
    this.tag_name = tag_name;
    console.log('TAGS.COMP - presentModalDeleteTag - tagid  ', this.tagid, ' tagname ', this.tagname);
  }

  closeModalDeleteTag() {
    this.displayModalDeleteTag = 'none';
  }

  // presentModalEditTag(tag_id: string) {
  //   this.displayModalEditTag = 'block';
  //   this.tagid = tag_id;
  //   console.log('TAGS.COMP - presentModalEditTag - tagid: ', this.tagid);
  // }

  // closeModalEditTag (){
  //   this.displayModalEditTag = 'block';
  // }

  onTagDeleted() {
    this.getTag();
  }

  // !! NOT USED
  openEditColorDropdown() {
    this.isOpenEditTagColorDropdown = !this.isOpenEditTagColorDropdown
    console.log('TAGS.COMP - openEditColorDropdown - isOpenEditTagColorDropdown  ', this.isOpenEditTagColorDropdown);
  }

  tagNewColorSelected(hex: string, tagid, tagname) {
    console.log('TAGS.COMP - editTag - tagid  ', tagid, ' tag name: ', tagname);
    this.tag_new_selected_color = hex;
    console.log('TAGS.COMP - tagNewColorSelected - tag_new_selected_color  ', this.tag_new_selected_color);
  }

  editTag(tagname: string, hex: string, tagid: string, index: number) {
    console.log('TAGS.COMP - editTag - new color ', hex, ' tagid: ', tagid, ' tag name: ', tagname, ' index ', index);

    this.tagsService.updateTag(tagname, hex, tagid)
      .subscribe((tag: any) => {
        console.log('TAGS.COMP - EDIT TAG - RES ', tag);

      }, (error) => {
        console.log('TAGS.COMP - EDIT TAG - ERROR  ', error);
        this.notify.showWidgetStyleUpdateNotification(this.update_label_error, 4, 'report_problem');
      }, () => {
        console.log('TAGS.COMP - EDIT TAG * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.update_label_success, 2, 'done');


        this.getTag();
      });
  }




}
