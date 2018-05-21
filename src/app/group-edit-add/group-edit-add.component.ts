import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../services/users.service';

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
 

  constructor(
    private router: Router,
    private auth: AuthService,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private groupsService: GroupService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.detectsCreateEditInTheUrl();

    this.getCurrentProject();
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

    this.getAllUsersOfCurrentProject();
  }

  /**
   * GET GROUP BY ID (FOR EDIT VIEW)
   */
  getGroupById() {
    this.groupService.getGroupById(this.group_id).subscribe((group: any) => {
      console.log('GROUP GET BY ID', group);

      // console.log('MONGO DB FAQ-KB NAME', this.faqKbNameToUpdate);
      if (group) {
        this.groupNameToUpdate = group.name;
        this.group_members = group.members;
        this.id_group = group._id;


        this.users_selected = this.group_members;
        console.log('GROUP MEMBERS ', this.group_members)
      }
      this.showSpinner = false;
    });
  }

  focusFunction() {
    console.log('FOCUS FUNCTION WORKS ', )
    const lengthOfTheString = this.groupNameToUpdate.length
    console.log('LENGHT OF THE STRING ', lengthOfTheString)
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.project_id = project._id
        console.log('00 -> GROUP-EDIT-ADD-COMP project ID from AUTH service subscription ', this.project_id)
      }

    });
  }

  // CREATE (mongoDB)
  create() {
    this.displayCreateGroupModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;
    this.CREATE_GROUP_ERROR = false;

    console.log('HAS CLICKED CREATE NEW GROUP');
    console.log('Create GROUP - NAME ', this.groupName);

    this.groupService.createGroup(this.groupName)
      .subscribe((group) => {
        console.log('CREATE GROUP - POST DATA ', group);

        // this.bot_fullname = '';

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
        (error) => {
          console.log('CREATE GROUP - POST REQUEST ERROR ', error);
          this.CREATE_GROUP_ERROR = true;
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

  onClosedisplayCreateGroupModalHandled() {

    this.displayCreateGroupModal = 'none'
    this.router.navigate(['project/' + this.project_id + '/groups']);
  }

  onClosedisplayCreateGroupModal() {
    this.displayCreateGroupModal = 'none'

  }

  editGroupName() {
    this.groupsService.updateGroupName(this.id_group, this.groupNameToUpdate).subscribe((group) => {

      console.log('UPDATED GROUP WITH UPDATED NAME', group);
    },
      (error) => {
        console.log('UPDATED GROUP WITH UPDATED NAME - ERROR ', error);
      },
      () => {
        console.log('UPDATED GROUP WITH UPDATED NAME * COMPLETE *');

        this.router.navigate(['project/' + this.project_id + '/groups']);

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

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('GROUPS-COMP - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      this.showSpinnerInModal = false;
      this.projectUsersList = projectUsers;

      // CHECK IF THE USER-ID IS BETWEEN THE MEMBER OF THE GROUP
      this.projectUsersList.forEach(projectUser => {

        for (const p of this.projectUsersList) {
          // console.log('vv', projectUser._id)
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
      });

    },
      error => {
        this.showSpinnerInModal = false;
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
      });
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
    this.display_users_list_modal = 'none';

    // this.group_members.forEach(group_members => {
    //   console.log(' ++ +++ group_members ', group_members)

    //   this.users_selected.forEach(users_selected => {
    //     if (users_selected !== group_members) {

    //       console.log('XXX ', users_selected)
    //     }
    //   });
    // });

    this.groupsService.updateGroup(this.id_group, this.users_selected).subscribe((group) => {

      console.log('UPDATED GROUP WITH THE USER SELECTED', group);
    },
      (error) => {
        console.log('UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
      },
      () => {
        console.log('UPDATED GROUP WITH THE USER SELECTED* COMPLETE *');

        // UPDATE THE GROUP LIST
        this.ngOnInit()
      });
  }

  deleteMemberFromTheGroup(id_user: string) {
    console.log('DELETE MEMBER ', id_user, ' FROM THE GROUP ', this.group_members);

    const index = this.group_members.indexOf(id_user);
    console.log('INDEX OF THE MEMBER ', index);
    if (index > -1) {
      this.group_members.splice(index, 1);
      console.log('GROUP AFTER MEMBER DELETED ', this.group_members);


      this.groupsService.updateGroup(this.id_group, this.group_members).subscribe((group) => {

        console.log('UPDATED GROUP WITH THE USER SELECTED', group);
      },
        (error) => {
          console.log('UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
        },
        () => {
          console.log('UPDATED GROUP WITH THE USER SELECTED* COMPLETE *');

          // UPDATE THE GROUP LIST
          this.ngOnInit()
        });

    }
  }

}
