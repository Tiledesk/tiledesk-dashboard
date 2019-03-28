import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../services/users.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(
    private router: Router,
    private auth: AuthService,
    // private groupService: GroupService,
    private route: ActivatedRoute,
    private groupsService: GroupService,
    private usersService: UsersService,
    private notify: NotifyService,
    private translate: TranslateService,
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
  }

  // TRANSLATION
  translateUpdateGroupSuccessNoticationMsg() {
    this.translate.get('UpdateGroupSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.updateGroupSuccessNoticationMsg = text;
        // console.log('+ + + Update Group Success Notication Msg', text)
      });
  }
  // TRANSLATION
  translateUpdateGroupErrorNoticationMsg() {
    this.translate.get('UpdateGroupErrorNoticationMsg')
      .subscribe((text: string) => {

        this.updateGroupErrorNoticationMsg = text;
        // console.log('+ + + Update Group Error Notication Msg', text)
      });
  }

  // TRANSLATION
  translateRemoveGroupMemberSuccessNoticationMsg() {
    this.translate.get('RemoveGroupMemberSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.removeGroupMemberSuccessNoticationMsg = text;
        // console.log('+ + + Remove Group Success Notication Msg', text)
      });
  }

   // TRANSLATION
   translateRemoveGroupMemberErrorNoticationMsg() {
    this.translate.get('RemoveGroupMemberErrorNoticationMsg')
      .subscribe((text: string) => {

        this.removeGroupMemberErrorNoticationMsg = text;
        // console.log('+ + + Remove Group Error Notication Msg', text)
      });
  }


  onInitUsersListModalHeight() {
    this.windowActualHeight = window.innerHeight;
    console.log('»»» GROUP EDIT ADD - ACTUAL HEIGHT ', this.windowActualHeight);

    this.users_list_modal_height = this.windowActualHeight - 350
    console.log('»»» GROUP EDIT ADD - ON INIT USER LIST MODAL HEIGHT ', this.users_list_modal_height);

    return { 'height': this.users_list_modal_height += 'px' };
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.newInnerWidth = event.target.innerWidth;
    this.newInnerHeight = event.target.innerHeight;
    this.users_list_modal_height = this.newInnerHeight - 350

    console.log('»»» GROUP EDIT ADD - NEW INNER HEIGHT ', this.newInnerHeight);
    console.log('»»» GROUP EDIT ADD - ON RESIZE USER LIST MODAL HEIGHT ', this.users_list_modal_height);

    return { 'height': this.users_list_modal_height += 'px' };

  }

  detectBrowserLang() {
    this.browser_lang = this.translate.getBrowserLang();
    console.log('»» »» GROUP-EDIT-ADD COMP - BROWSER LANGUAGE ', this.browser_lang);
  }

  detectsCreateEditInTheUrl() {
    if (this.router.url.indexOf('/create') !== -1) {
      console.log('HAS CLICKED CREATE ');

      this.CREATE_VIEW = true;
      this.showSpinner = false;

    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      // this.showSpinner = false;

      // GET THE ID OF GROUP PASSED BY GROUP-LIST PAGE
      this.getGroupId();
    }
  }
  getGroupId() {
    this.group_id = this.route.snapshot.params['groupid'];
    console.log('GROUP-LIST PAGE HAS PASSED group_id ', this.group_id);

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
      console.log('GROUP GET BY ID', group);

      // console.log('MONGO DB FAQ-KB NAME', this.faqKbNameToUpdate);
      if (group) {
        this.groupNameToUpdate = group.name;
        this.group_members = group.members;
        this.id_group = group._id;
        this.groupCreatedAt = group.createdAt

        this.users_selected = this.group_members;
        console.log('GROUP MEMBERS ', this.group_members)
      }
      // this.showSpinner = false;

    },
      (error) => {
        this.showSpinner = false;
        console.log('GROUP GET BY ID - ERROR ', error);
      },
      () => {
        console.log('GROUP GET BY ID * COMPLETE *');
        this.has_completed_getGroupById = true;
        console.log('HAS COMPLETED getGroupById ', this.has_completed_getGroupById)

        this.getAllUsersOfCurrentProject();
      });
  }

  // is used to display name lastname role in the members list table
  // if the id of the user in the project_user object is equal match with one of id contains 
  // in the array 'this.group_members' the user_project property 'is_group_member' is set to true
  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('GROUPS-COMP - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      this.showSpinner = false;
      this.showSpinnerInModal = false;
      this.projectUsersList = projectUsers;

      if (this.projectUsersList) {
        // CHECK IF THE USER-ID IS BETWEEN THE MEMBER OF THE GROUP
        this.projectUsersList.forEach(projectUser => {

          for (const p of this.projectUsersList) {
            // console.log('vv', projectUser._id)
            if (this.group_members) {

              this.group_members.forEach(group_member => {
                if (p.id_user._id === group_member) {
                  if (projectUser._id === p._id) {
                    p.is_group_member = true;
                    console.log('GROUP MEMBER ', group_member)
                    console.log('IS MEMBER OF THE GROUP THE USER ', p.id_user._id, ' - ', p.is_group_member)
                  }
                }
              });

            }
          }
        });
      }
    }, error => {
      this.showSpinner = false;
      this.showSpinnerInModal = false;
      console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
    });
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.project_id = project._id
        console.log('00 -> GROUP-EDIT-ADD-COMP project ID from AUTH service subscription ', this.project_id)
      }

    });
  }

  // CREATE
  create() {
    this.displayCreateGroupModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;
    this.CREATE_GROUP_ERROR = false;

    console.log('HAS CLICKED CREATE NEW GROUP');
    console.log('Create GROUP - NAME ', this.groupName);

    this.groupsService.createGroup(this.groupName)
      .subscribe((group) => {
        console.log('CREATE GROUP - POST DATA ', group);

        if (group) {
          this.group_name = group.name;
          this.id_new_group = group._id
        }

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
        (error) => {
          console.log('CREATE GROUP - POST REQUEST ERROR ', error);
          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
            this.CREATE_GROUP_ERROR = true;
          }, 300);

          // IF THERE IS AN ERROR, PREVENT THAT THE USER BE ADDRESSED TO THE PAGE 'EDIT BOT'
          // WHEN CLICK ON THE BUTTON 'CONTINUE' OF THE MODAL 'CREATE BOT'
          this.goToEditGroup = false;
        },
        () => {
          console.log('CREATE GROUP - POST REQUEST * COMPLETE *');

          // this.faqKbService.createFaqKbKey()
          // .subscribe((faqKbKey) => {

          //   console.log('CREATE FAQKB KEY - POST DATA ', faqKbKey);

          // });
          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
          }, 300);

          // this.router.navigate(['project/' + this.project._id + '/faqkb']);
        });
  }


  // WHEN A NEW GROUP IS CREATED IN THE MODAL WINDOW 'CREATE GROUP', TWO ACTIONS ARE POSSIBLE:
  // "ADD GROUP MEMBERS NOW" and "RETURN TO THE LIST (ADD AFTER)". DEFAULT IS SELECTED THE FIRST ACTION.
  // WHEN THE USER CLICK ON "CONTINUE" WILL BE ADDRESSED: TO THE VIEW OF "EDIT GROUP" or,
  // IF THE USER SELECT THE SECOND OPTION, TO THE LIST OF GROUPS
  actionAfterGroupCreation(goToEditGroup) {
    console.log('OPEN MODAL TO ADD MEMBERS ', goToEditGroup)
    this.goToEditGroup = goToEditGroup
  }

  // CREATE GROUP MODAL - HANDLE THE ACTION OF THE BUTTON 'CONTINUE'
  onCloseCreateGroupModal() {
    this.displayCreateGroupModal = 'none'

    if (this.goToEditGroup === true) {
      this.router.navigate(['project/' + this.project_id + '/group/edit/' + this.id_new_group]);
      console.log('1) check if HAS COMPLETED getGroupById ', this.has_completed_getGroupById)

    } else {
      this.router.navigate(['project/' + this.project_id + '/groups']);
    }
  }


  onClosedisplayCreateGroupModal() {
    this.displayCreateGroupModal = 'none'
  }

  editGroupName() {
    this.groupsService.updateGroupName(this.id_group, this.groupNameToUpdate).subscribe((group) => {

      console.log('UPDATED GROUP WITH UPDATED NAME', group);
    }, (error) => {
      console.log('UPDATED GROUP WITH UPDATED NAME - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating the group', 4, 'report_problem');
      this.notify.showNotification(this.updateGroupErrorNoticationMsg, 4, 'report_problem');
    }, () => {
      console.log('UPDATED GROUP WITH UPDATED NAME * COMPLETE *');

      // this.router.navigate(['project/' + this.project_id + '/groups']);

      // =========== NOTIFY SUCCESS===========
      // this.notify.showNotification('group successfully updated', 2, 'done');
      this.notify.showNotification(this.updateGroupSuccessNoticationMsg, 2, 'done');

      // UPDATE THE GROUP LIST
      // this.ngOnInit()
    });

  }

  goBackGroupList() {
    this.router.navigate(['project/' + this.project_id + '/groups']);
  }

  open_users_list_modal() {
    // this.id_group = id_group;
    // this.group_name = group_name;
    // this.group_members = group_members;

    this.showSpinnerInModal = true;

    // console.log('GROUP SELECTED -> group NAME: ', this.group_name, ' -> group ID: ', this.id_group)
    // console.log('GROUP SELECTED -> MEMBERS; ', this.group_members);

    // this.users_selected = this.group_members;
    // console.log('ARRAY OF SELECTED USERS WHEN OPEN MODAL ', this.users_selected);


    this.getAllUsersOfCurrentProject();
    this.display_users_list_modal = 'block';
  }



  onCloseModal() {
    this.display_users_list_modal = 'none';
  }

  change(obj) {
    // + this.group_members
    console.log('obj', obj);

    const index = this.users_selected.indexOf(obj);

    console.log('INDEX ', index);

    if (index > -1) {
      this.users_selected.splice(index, 1);
    } else {
      this.users_selected.push(obj);
    }

    console.log('ARRAY OF SELECTED USERS ', this.users_selected);
    console.log('ARRAY OF SELECTED USERS lenght ', this.users_selected.length);

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

      console.log('UPDATED GROUP WITH THE USER SELECTED', group);

      this.COUNT_OF_MEMBERS_ADDED = group.members.length;
      console.log('# OF MEMBERS ADDED ', group.members.length);
    },
      (error) => {
        console.log('UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
        this.SHOW_CIRCULAR_SPINNER = false;
        this.ADD_MEMBER_TO_GROUP_ERROR = true;
      },
      () => {
        console.log('UPDATED GROUP WITH THE USER SELECTED * COMPLETE *');
        this.SHOW_CIRCULAR_SPINNER = false;
        this.ADD_MEMBER_TO_GROUP_ERROR = false;

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('group successfully updated', 2, 'done');
        this.notify.showNotification(this.updateGroupSuccessNoticationMsg, 2, 'done');

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
    console.log('OPEN DELETE MODAL - ID USER: ', id_user, ' USER EMAIL ', user_email);
    this.id_user_to_delete = id_user;
  }

  onCloseDeleteModal() {
    this.displayDeleteModal = 'none';
  }

  deleteMemberFromTheGroup() {
    this.displayDeleteModal = 'none';
    console.log('DELETE MEMBER ', this.id_user_to_delete, ' FROM THE GROUP ', this.group_members);

    const index = this.group_members.indexOf(this.id_user_to_delete);
    console.log('INDEX OF THE MEMBER ', index);
    if (index > -1) {
      this.group_members.splice(index, 1);
      console.log('GROUP AFTER MEMBER DELETED ', this.group_members);

      this.groupsService.updateGroup(this.id_group, this.group_members).subscribe((group) => {

        console.log('UPDATED GROUP WITH THE USER SELECTED', group);

      }, (error) => {
        console.log('UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while removing the member', 4, 'report_problem');
        this.notify.showNotification(this.removeGroupMemberErrorNoticationMsg, 4, 'report_problem');

      }, () => {
        console.log('UPDATED GROUP WITH THE USER SELECTED* COMPLETE *');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('member successfully removed', 2, 'done');
        this.notify.showNotification(this.removeGroupMemberSuccessNoticationMsg, 2, 'done');

        // UPDATE THE GROUP LIST
        this.ngOnInit()
        // this.getAllUsersOfCurrentProject();
      });
    }
  }

  goToMemberProfile(member_id: any) {
    console.log('has clicked GO To MEMBER ', member_id);
    this.router.navigate(['project/' + this.project_id + '/member/' + member_id]);
  }



}
