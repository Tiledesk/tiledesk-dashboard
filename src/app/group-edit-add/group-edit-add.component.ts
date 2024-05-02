import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../services/users.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../services/app-config.service';
import { Location } from '@angular/common';
import { LoggerService } from '../services/logger/logger.service';
@Component({
  selector: 'app-group-edit-add',
  templateUrl: './group-edit-add.component.html',
  styleUrls: ['./group-edit-add.component.scss']
})
export class GroupEditAddComponent implements OnInit {
  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = true;
  groupName: string;
  groupNameToUpdate: string;
  groupCreatedAt: string;
  project_id: string;
  group_id: string;
  // displayInfoModal = 'none'
  SHOW_CIRCULAR_SPINNER = false;

  projectUsersList: any;
  display_users_list_modal = 'none';
  showSpinnerInModal: boolean;
  group_members: any;
  users_selected = [];
  id_group: string;
  displayCreateGroupModal = 'none';
  CREATE_GROUP_ERROR: boolean;

  displayDeleteModal = 'none';
  id_user_to_delete: string;

  goToEditGroup = true
  group_name: string;
  id_new_group: string;

  has_completed_getGroupById = false;
  displayAddingMembersModal = 'none';
  ADD_MEMBER_TO_GROUP_ERROR = false;
  COUNT_OF_MEMBERS_ADDED: number;

  browser_lang: string;

  // users_list_modal_height = '150px'
  users_list_modal_height: any
  windowActualHeight: any
  newInnerHeight: any

  updateGroupSuccessNoticationMsg: string;
  updateGroupErrorNoticationMsg: string;
  removeGroupMemberSuccessNoticationMsg: string;
  removeGroupMemberErrorNoticationMsg: string;

  count: number;
  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  isChromeVerGreaterThan100: boolean;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  constructor(
    private router: Router,
    private auth: AuthService,
    // private groupService: GroupService,
    private route: ActivatedRoute,
    private groupsService: GroupService,
    private usersService: UsersService,
    private notify: NotifyService,
    private translate: TranslateService,
    public location: Location,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();

    this.translateUpdateGroupSuccessNoticationMsg();
    this.translateUpdateGroupErrorNoticationMsg();
    this.translateRemoveGroupMemberSuccessNoticationMsg();
    this.translateRemoveGroupMemberErrorNoticationMsg();
    this.onInitUsersListModalHeight();
    this.detectBrowserLang();
    this.detectsCreateEditInTheUrl();

    this.getCurrentProject();
    this.getProfileImageStorage();
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[GROUP-EDIT-ADD] SETTNGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
   } 

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[GROUP-EDIT-ADD] IMAGE STORAGE ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[GROUP-EDIT-ADD] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  // TRANSLATION
  translateUpdateGroupSuccessNoticationMsg() {
    this.translate.get('UpdateGroupSuccessNoticationMsg')
      .subscribe((text: string) => {
        this.updateGroupSuccessNoticationMsg = text;
        // this.logger.log('[GROUP-EDIT-ADD] + + + Update Group Success Notication Msg', text)
      });
  }
  // TRANSLATION
  translateUpdateGroupErrorNoticationMsg() {
    this.translate.get('UpdateGroupErrorNoticationMsg')
      .subscribe((text: string) => {
        this.updateGroupErrorNoticationMsg = text;
        // this.logger.log('[GROUP-EDIT-ADD] + + + Update Group Error Notication Msg', text)
      });
  }

  // TRANSLATION
  translateRemoveGroupMemberSuccessNoticationMsg() {
    this.translate.get('RemoveGroupMemberSuccessNoticationMsg')
      .subscribe((text: string) => {
        this.removeGroupMemberSuccessNoticationMsg = text;
        // this.logger.log('[GROUP-EDIT-ADD] + + + Remove Group Success Notication Msg', text)
      });
  }

  // TRANSLATION
  translateRemoveGroupMemberErrorNoticationMsg() {
    this.translate.get('RemoveGroupMemberErrorNoticationMsg')
      .subscribe((text: string) => {
        this.removeGroupMemberErrorNoticationMsg = text;
        // this.logger.log('[GROUP-EDIT-ADD]+ + + Remove Group Error Notication Msg', text)
      });
  }


  onInitUsersListModalHeight() {
    this.windowActualHeight = window.innerHeight;
    this.logger.log('[GROUP-EDIT-ADD] - ACTUAL HEIGHT ', this.windowActualHeight);

    this.users_list_modal_height = this.windowActualHeight - 350
    this.logger.log('[GROUP-EDIT-ADD] - ON INIT USER LIST MODAL HEIGHT ', this.users_list_modal_height);

    return { 'height': this.users_list_modal_height += 'px' };
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.newInnerWidth = event.target.innerWidth;
    this.newInnerHeight = event.target.innerHeight;
    this.users_list_modal_height = this.newInnerHeight - 350

    this.logger.log('[GROUP-EDIT-ADD] - NEW INNER HEIGHT ', this.newInnerHeight);
    this.logger.log('[GROUP-EDIT-ADD] - ON RESIZE USER LIST MODAL HEIGHT ', this.users_list_modal_height);

    return { 'height': this.users_list_modal_height += 'px' };

  }

  detectBrowserLang() {
    this.browser_lang = this.translate.getBrowserLang();
    this.logger.log('[GROUP-EDIT-ADD] - BROWSER LANGUAGE ', this.browser_lang);
  }

  detectsCreateEditInTheUrl() {
    if (this.router.url.indexOf('/create') !== -1) {
      this.logger.log('[GROUP-EDIT-ADD] - HAS CLICKED CREATE ');

      this.CREATE_VIEW = true;
      this.showSpinner = false;

    } else {
      this.logger.log('[GROUP-EDIT-ADD] - HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      // this.showSpinner = false;

      // GET THE ID OF GROUP PASSED BY GROUP-LIST PAGE
      this.getGroupId();
    }
  }
  getGroupId() {
    this.group_id = this.route.snapshot.params['groupid'];
    this.logger.log('[GROUP-EDIT-ADD] - GROUP-LIST PAGE HAS PASSED group_id ', this.group_id);

    if (this.group_id) {
      this.getGroupById();
    }

    // this.getAllUsersOfCurrentProject();
  }

  /**
   * GET GROUP BY ID (FOR EDIT VIEW)
   */
  getGroupById() {
    this.groupsService.getGroupById(this.group_id).subscribe((group: any) => {
      this.logger.log('[GROUP-EDIT-ADD] - GROUP GET BY ID', group);

      // this.logger.log('MONGO DB FAQ-KB NAME', this.faqKbNameToUpdate);
      if (group) {
        this.groupNameToUpdate = group.name;
        this.group_members = group.members;
        this.id_group = group._id;
        this.groupCreatedAt = group.createdAt

        this.users_selected = this.group_members;
        this.logger.log('[GROUP-EDIT-ADD] -GROUP MEMBERS ', this.group_members)
      }
      // this.showSpinner = false;

    }, (error) => {
      this.showSpinner = false;
      this.logger.error('[GROUP-EDIT-ADD] - GROUP GET BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[GROUP-EDIT-ADD] - GROUP GET BY ID * COMPLETE *');
      this.has_completed_getGroupById = true;
      this.logger.log('[GROUP-EDIT-ADD] - HAS COMPLETED getGroupById ', this.has_completed_getGroupById)

      this.getAllUsersOfCurrentProject();
    });
  }

  // is used to display name lastname role in the members list table
  // if the id of the user in the project_user object is equal match with one of id contains 
  // in the array 'this.group_members' the user_project property 'is_group_member' is set to true
  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[GROUP-EDIT-ADD] - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      this.showSpinner = false;
      this.showSpinnerInModal = false;
      this.projectUsersList = projectUsers;

      if (this.projectUsersList) {
        // CHECK IF THE USER-ID IS BETWEEN THE MEMBER OF THE GROUP
        this.count = 0;
        this.projectUsersList.forEach(projectUser => {

          for (const p of this.projectUsersList) {
            // this.logger.log('vv', projectUser._id)
            if (this.group_members) {

              this.group_members.forEach(group_member => {

                if (p.id_user._id === group_member) {
                  if (projectUser._id === p._id) {
                    p.is_group_member = true;

                    this.logger.log('[GROUP-EDIT-ADD] GROUP MEMBER ', group_member)
                    this.logger.log('[GROUP-EDIT-ADD] IS MEMBER OF THE GROUP THE USER ', p.id_user._id, ' - ', p.is_group_member);
                  }
                }
              });
            }
          }

          /**
           * *** new: count of is_group_member ***
           * resolve the bug: if is deleted a project-user the array of members of the group are not updated
           * so the count of the members done on the lenght of the array not corresponding to the real number of members
           */
          if (projectUser.is_group_member === true) {
            this.count = this.count + 1;
            this.logger.log('[GROUP-EDIT-ADD] GROUP MEMBER count ', this.count)
          }
        });
      }
    }, error => {
      this.showSpinner = false;
      this.showSpinnerInModal = false;
      this.logger.error('[GROUP-EDIT-ADD] PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      this.logger.log('[GROUP-EDIT-ADD] PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
    });
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.project_id = project._id
        this.logger.log('[GROUP-EDIT-ADD] - project ID from AUTH service subscription ', this.project_id)
      }

    });
  }

  // CREATE
  create() {
    this.displayCreateGroupModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;
    this.CREATE_GROUP_ERROR = false;

    this.logger.log('[GROUP-EDIT-ADD] - HAS CLICKED CREATE NEW GROUP');
    this.logger.log('[GROUP-EDIT-ADD] - Create GROUP - NAME ', this.groupName);

    this.groupsService.createGroup(this.groupName)
      .subscribe((group) => {
        this.logger.log('[GROUP-EDIT-ADD] - CREATE GROUP - POST DATA ', group);

        if (group) {
          this.group_name = group['name'];
          this.id_new_group = group['_id']
        }

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      }, (error) => {
        this.logger.error('[GROUP-EDIT-ADD] - CREATE GROUP - POST REQUEST ERROR ', error);
        setTimeout(() => {
          this.SHOW_CIRCULAR_SPINNER = false
          this.CREATE_GROUP_ERROR = true;
        }, 300);

        // IF THERE IS AN ERROR, PREVENT THAT THE USER BE ADDRESSED TO THE PAGE 'EDIT BOT'
        // WHEN CLICK ON THE BUTTON 'CONTINUE' OF THE MODAL 'CREATE BOT'
        this.goToEditGroup = false;
      }, () => {
        this.logger.log('[GROUP-EDIT-ADD] - CREATE GROUP - POST REQUEST * COMPLETE *');

        setTimeout(() => {
          this.SHOW_CIRCULAR_SPINNER = false
        }, 300);

      });
  }


  // WHEN A NEW GROUP IS CREATED IN THE MODAL WINDOW 'CREATE GROUP', TWO ACTIONS ARE POSSIBLE:
  // "ADD GROUP MEMBERS NOW" and "RETURN TO THE LIST (ADD AFTER)". DEFAULT IS SELECTED THE FIRST ACTION.
  // WHEN THE USER CLICK ON "CONTINUE" WILL BE ADDRESSED: TO THE VIEW OF "EDIT GROUP" or,
  // IF THE USER SELECT THE SECOND OPTION, TO THE LIST OF GROUPS
  actionAfterGroupCreation(goToEditGroup) {
    this.logger.log('[GROUP-EDIT-ADD] - OPEN MODAL TO ADD MEMBERS ', goToEditGroup)
    this.goToEditGroup = goToEditGroup
  }

  // CREATE GROUP MODAL - HANDLE THE ACTION OF THE BUTTON 'CONTINUE'
  onCloseCreateGroupModal() {
    this.displayCreateGroupModal = 'none'

    if (this.goToEditGroup === true) {
      this.router.navigate(['project/' + this.project_id + '/group/edit/' + this.id_new_group]);
      this.logger.log('[GROUP-EDIT-ADD] 1) check if HAS COMPLETED getGroupById ', this.has_completed_getGroupById)

    } else {
      this.router.navigate(['project/' + this.project_id + '/groups']);
    }
  }


  onClosedisplayCreateGroupModal() {
    this.displayCreateGroupModal = 'none'
  }

  editGroupName() {
    this.groupsService.updateGroupName(this.id_group, this.groupNameToUpdate).subscribe((group) => {

      this.logger.log('[GROUP-EDIT-ADD] UPDATED GROUP WITH UPDATED NAME', group);
    }, (error) => {
      this.logger.error('[GROUP-EDIT-ADD] UPDATED GROUP WITH UPDATED NAME - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating the group', 4, 'report_problem');
      this.notify.showWidgetStyleUpdateNotification(this.updateGroupErrorNoticationMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[GROUP-EDIT-ADD] UPDATED GROUP WITH UPDATED NAME * COMPLETE *');

      // this.router.navigate(['project/' + this.project_id + '/groups']);

      // =========== NOTIFY SUCCESS===========
      // this.notify.showNotification('group successfully updated', 2, 'done');
      this.notify.showWidgetStyleUpdateNotification(this.updateGroupSuccessNoticationMsg, 2, 'done');

      // UPDATE THE GROUP LIST
      // this.ngOnInit()
    });

  }

  goBackGroupList() {
    this.router.navigate(['project/' + this.project_id + '/groups']);
  }

  goBack() {
    this.location.back();
  }

  open_users_list_modal() {
    // this.id_group = id_group;
    // this.group_name = group_name;
    // this.group_members = group_members;

    this.showSpinnerInModal = true;

    // this.logger.log('[GROUP-EDIT-ADD] GROUP SELECTED -> group NAME: ', this.group_name, ' -> group ID: ', this.id_group)
    // this.logger.log('[GROUP-EDIT-ADD] GROUP SELECTED -> MEMBERS; ', this.group_members);

    // this.users_selected = this.group_members;
    // this.logger.log('[GROUP-EDIT-ADD] ARRAY OF SELECTED USERS WHEN OPEN MODAL ', this.users_selected);


    this.getAllUsersOfCurrentProject();
    this.display_users_list_modal = 'block';
  }



  onCloseModal() {
    this.display_users_list_modal = 'none';
  }

  change(obj) {
    // + this.group_members
    this.logger.log('[GROUP-EDIT-ADD] - change - obj', obj);

    const index = this.users_selected.indexOf(obj);

    this.logger.log('[GROUP-EDIT-ADD] - change - users_selected INDEX ', index);

    if (index > -1) {
      this.users_selected.splice(index, 1);
    } else {
      this.users_selected.push(obj);
    }

    this.logger.log('[GROUP-EDIT-ADD] - change - ARRAY OF SELECTED USERS ', this.users_selected);
    this.logger.log('[GROUP-EDIT-ADD] - change - ARRAY OF SELECTED USERS lenght ', this.users_selected.length);

    // DISABLE THE ADD BUTTON
    // if (this.users_selected.length < 1) {
    //   this.add_btn_disabled = true;

    // } else {
    //   this.add_btn_disabled = false;
    // }
  }

  addMembersToTheGroup() {
    this.showSpinner = true;
    this.display_users_list_modal = 'none';

    this.SHOW_CIRCULAR_SPINNER = true;
    this.displayAddingMembersModal = 'block';

    this.groupsService.updateGroup(this.id_group, this.users_selected).subscribe((group) => {

      this.logger.log('[GROUP-EDIT-ADD] - UPDATED GROUP WITH THE USER SELECTED', group);

      this.COUNT_OF_MEMBERS_ADDED = group['members'].length;
      this.logger.log('[GROUP-EDIT-ADD] - # OF MEMBERS ADDED ', group['members'].length);
    }, (error) => {
      this.logger.error('[GROUP-EDIT-ADD] - UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
      this.SHOW_CIRCULAR_SPINNER = false;
      this.ADD_MEMBER_TO_GROUP_ERROR = true;
    }, () => {
      this.logger.log('[GROUP-EDIT-ADD]- UPDATED GROUP WITH THE USER SELECTED * COMPLETE *');
      this.SHOW_CIRCULAR_SPINNER = false;
      this.ADD_MEMBER_TO_GROUP_ERROR = false;

      // =========== NOTIFY SUCCESS===========
      // this.notify.showNotification('group successfully updated', 2, 'done');
      this.notify.showWidgetStyleUpdateNotification(this.updateGroupSuccessNoticationMsg, 2, 'done');

      // UPDATE THE GROUP LIST
      this.ngOnInit()
      // this.getAllUsersOfCurrentProject();
    });
  }

  onCloseAddingMembersModal() {
    this.displayAddingMembersModal = 'none';
  }

  // =========== DELETE MODAL ===========
  openDeleteModal(id_user, user_email) {
    this.displayDeleteModal = 'block';
    this.logger.log('[GROUP-EDIT-ADD] - OPEN DELETE MODAL - ID USER: ', id_user, ' USER EMAIL ', user_email);
    this.id_user_to_delete = id_user;
  }

  onCloseDeleteModal() {
    this.displayDeleteModal = 'none';
  }

  deleteMemberFromTheGroup() {
    this.displayDeleteModal = 'none';
    this.logger.log('[GROUP-EDIT-ADD] - DELETE MEMBER ', this.id_user_to_delete, ' FROM THE GROUP ', this.group_members);

    const index = this.group_members.indexOf(this.id_user_to_delete);
    this.logger.log('[GROUP-EDIT-ADD] - INDEX OF THE MEMBER ', index);
    if (index > -1) {
      this.group_members.splice(index, 1);
      this.logger.log('[GROUP-EDIT-ADD] - GROUP AFTER MEMBER DELETED ', this.group_members);

      this.groupsService.updateGroup(this.id_group, this.group_members).subscribe((group) => {

        this.logger.log('[GROUP-EDIT-ADD] - UPDATED GROUP WITH THE USER SELECTED', group);

      }, (error) => {
        this.logger.error('[GROUP-EDIT-ADD] - UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while removing the member', 4, 'report_problem');
        this.notify.showWidgetStyleUpdateNotification(this.removeGroupMemberErrorNoticationMsg, 4, 'report_problem');

      }, () => {
        this.logger.log('[GROUP-EDIT-ADD] - UPDATED GROUP WITH THE USER SELECTED* COMPLETE *');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('member successfully removed', 2, 'done');
        this.notify.showWidgetStyleUpdateNotification(this.removeGroupMemberSuccessNoticationMsg, 2, 'done');

        // UPDATE THE GROUP LIST
        this.ngOnInit()
        // this.getAllUsersOfCurrentProject();
      });
    }
  }

  goToMemberProfile(member_id: any) {
    this.logger.log('[GROUP-EDIT-ADD] has clicked GO To MEMBER ', member_id);
    // this.router.navigate(['project/' + this.project_id + '/member/' + member_id]);
    this.router.navigate(['project/' + this.project_id + '/user/edit/' + member_id]);
  }



}
