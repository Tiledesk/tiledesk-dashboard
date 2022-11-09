import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { slideInOutAnimation } from './../../_animations/index';
import { UsersService } from '../../services/users.service';
import { AppConfigService } from '../../services/app-config.service';
import { GroupService } from '../../services/group.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../core/notify.service';
import { LoggerService } from '../../services/logger/logger.service';

@Component({
  selector: 'appdashboard-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss'],
  animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})
export class CreateGroupComponent implements OnInit {

  @Output() valueChange = new EventEmitter();
  @Output() groupcreated = new EventEmitter();

  @Input() newInnerWidth
  @Input() deptName_toUpdate


  showSpinner = true;
  projectUsersList: any;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  storageBucket: string;
  baseUrl: string;
  groupMembersArray: Array<any> = []
  sidebar_height: any;
  group_name: string;
  new_group_id: string;
  create_group_and_add_members_btn_disabled = true;
  group_created_success_msg: string;
  group_created_error_msg: string;
  group_name_already_exist: boolean = false
  constructor(
    private usersService: UsersService,
    private groupsService: GroupService,
    public appConfigService: AppConfigService,
    private notify: NotifyService,
    private translate: TranslateService,
    private logger: LoggerService
  ) {

    // this.sidebar_height = this.newInnerWidth +'px'

  }


  ngOnInit() {
    if (this.deptName_toUpdate !== undefined) {
      this.group_name = this.deptName_toUpdate + ' ' + 'group'
    }
    this.getProfileImageStorage();
    this.getAllUsersOfCurrentProject();
    this.translateCreateGroupMsgs()
    // this.getScollPosition()
    this.getGroupsByProjectId()
  }

  getGroupsByProjectId() {
    // this.HAS_COMPLETED_GET_GROUPS = false
    this.groupsService.getGroupsByProjectId().subscribe((groups: any) => {
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - GET GROUPS RES ', groups);

      groups.forEach(group => {
        if (this.deptName_toUpdate + ' ' + 'group' === group.name) {
          this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - GET GROUPS - this group name already exist ', this.deptName_toUpdate + ' ' + 'group');
          this.group_name_already_exist = true
        }
      });

    }, (error) => {
      this.logger.error('[DEPT-EDIT-ADD - CREATE-GROUP] - GET GROUPS - ERROR ', error);

    }, () => {
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - GET GROUPS * COMPLETE');

    });
  }


  translateCreateGroupMsgs() {
    this.translate.get('CreatedGroupSuccessMsg')
      .subscribe((text: string) => {
        this.group_created_success_msg = text;
        // this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] + + + CreatedGroupSuccessMsg', text)
      });

    this.translate.get('CreatedGroupErrorMsg')
      .subscribe((text: string) => {

        this.group_created_error_msg = text;
        // this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] + + + CreatedGroupErrorMsg', text)
      });
  }

  ngAfterViewInit() { }


  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - IMAGE STORAGE', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }


  closeCreateGroupRightSideBar() {
    this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - CALLING CLOSE ')
    this.valueChange.emit(false);
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      if (projectUsers) {
        this.projectUsersList = projectUsers;
      }

    }, error => {
      this.showSpinner = false;

      this.logger.error('[DEPT-EDIT-ADD - CREATE-GROUP] - PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
      this.showSpinner = false;
    });
  }


  addMembersToArray(userid) {
    this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - change - userid', userid);

    let index = this.groupMembersArray.findIndex(x => x === userid);
    this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] USERID INDEX ', index);

    if (index === -1) {
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] here yes 1 push item');
      this.groupMembersArray.push(userid);
    } else {
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] here yes 2 splice item');
      this.groupMembersArray.splice(index, 1);
    }

    this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - ARRAY OF SELECTED USERS ', this.groupMembersArray);


    // DISABLE THE CREATE GROUP AND THEN ADD MEMBERS BUTTON
    if (this.groupMembersArray) {

      if (this.groupMembersArray.length === 0) {
        this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP]  - ARRAY OF SELECTED USERS lenght ', this.groupMembersArray.length);
        this.create_group_and_add_members_btn_disabled = true;

      } else {
        this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP]  - ARRAY OF SELECTED USERS lenght ', this.groupMembersArray.length);
        this.create_group_and_add_members_btn_disabled = false;
      }
    }
  }


  onChangeGroupName(event) {
    this.group_name = event;
    this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - onChangeGroupName ', this.group_name);
  }


  createGroupAndAddMembers() {
    // CREATE THE GROUP
    this.groupsService.createGroup(this.group_name)
      .subscribe((group) => {
        this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP]  - RES ', group);

        if (group) {
          this.group_name = group['name'];
          this.new_group_id = group['_id']

          this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP]  - new_group_id ', this.new_group_id);
        }

      }, (error) => {
        this.logger.error('[DEPT-EDIT-ADD - CREATE-GROUP]  - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.group_created_error_msg, 4, 'report_problem');

      }, () => {
        this.logger.log('CREATE GROUP SIDEBAR  * COMPLETE *');

        this.updatedGroupWithSelectedMembers();

      });
  }

  updatedGroupWithSelectedMembers() {
    this.groupsService.updateGroup(this.new_group_id, this.groupMembersArray).subscribe((group) => {

      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - UPDATED GROUP WITH THE USER SELECTED', group);

      // this.COUNT_OF_MEMBERS_ADDED = group.members.length;
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - # OF MEMBERS ADDED ', group['members'].length);

    }, (error) => {
      this.logger.error('[DEPT-EDIT-ADD - CREATE-GROUP] - UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
      this.notify.showWidgetStyleUpdateNotification(this.group_created_error_msg, 4, 'report_problem');
    }, () => {
      this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP]  - UPDATED GROUP WITH THE USER SELECTED * COMPLETE *');

      this.notify.showWidgetStyleUpdateNotification(this.group_created_success_msg, 2, 'done');

      this.closeCreateGroupRightSideBarAndEmitGroupCreated()
    });
  }

  closeCreateGroupRightSideBarAndEmitGroupCreated() {
    this.logger.log('[DEPT-EDIT-ADD - CREATE-GROUP] - CALLING CLOSE ')
    this.valueChange.emit(false);
    this.groupcreated.emit(this.new_group_id);
  }



}
