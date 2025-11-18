import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { DepartmentService } from 'app/services/department.service';
import { takeUntil } from 'rxjs/operators';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { Subject } from 'rxjs';
import { avatarPlaceholder, getColorBck } from 'app/utils/util';
@Component({
  selector: 'app-group-edit-add',
  templateUrl: './group-edit-add.component.html',
  styleUrls: ['./group-edit-add.component.scss']
})
export class GroupEditAddComponent implements OnInit, OnDestroy {
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

  isAuthorized = false;
  permissionChecked = false;
  departmentsOfGroup: any

   private unsubscribe$: Subject<any> = new Subject<any>();
    PERMISSION_TO_VIEW_DEPT: boolean;
    PERMISSION_TO_READ_DEPT_DETAILS: boolean;

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
    private logger: LoggerService,
    private roleService: RoleService,
    public rolesService: RolesService,
    private deptService: DepartmentService,
  ) { }

  ngOnInit() {
   

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
    this.listenToProjectUser()
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

    listenToProjectUser() {
      this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
      this.rolesService.getUpdateRequestPermission()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(status => {
          console.log('[DEPTS] - Role:', status.role);
          console.log('[DEPTS] - Permissions:', status.matchedPermissions);
          
          // PERMISSION_TO_VIEW_DEPT
          if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
            if (status.matchedPermissions.includes(PERMISSIONS.DEPARTMENTS_LIST_READ)) {
  
              this.PERMISSION_TO_VIEW_DEPT = true
              console.log('[DEPTS] - PERMISSION_TO_VIEW_DEPT ', this.PERMISSION_TO_VIEW_DEPT);
            } else {
              this.PERMISSION_TO_VIEW_DEPT = false
              console.log('[DEPTS] - PERMISSION_TO_VIEW_DEPT ', this.PERMISSION_TO_VIEW_DEPT);
            }
          } else {
            this.PERMISSION_TO_VIEW_DEPT = true
            console.log('[DEPTS] - Project user has a default role ', status.role, 'PERMISSION_TO_VIEW_DEPT ', this.PERMISSION_TO_VIEW_DEPT);
          }
  
          // PERMISSION_TO_READ_DEPT_DETAILS
          if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
            if (status.matchedPermissions.includes(PERMISSIONS.DEPARTMENT_DETAIL_READ)) {
  
              this.PERMISSION_TO_READ_DEPT_DETAILS = true
              console.log('[DEPTS] - PERMISSION_TO_READ_DEPT_DETAILS ', this.PERMISSION_TO_READ_DEPT_DETAILS);
            } else {
              this.PERMISSION_TO_READ_DEPT_DETAILS = false
              console.log('[DEPTS] - PERMISSION_TO_READ_DEPT_DETAILS ', this.PERMISSION_TO_READ_DEPT_DETAILS);
            }
          } else {
            this.PERMISSION_TO_READ_DEPT_DETAILS = true
            console.log('[DEPTS] - Project user has a default role ', status.role, 'PERMISSION_TO_READ_DEPT_DETAILS ', this.PERMISSION_TO_READ_DEPT_DETAILS);
          }
  
  
          // You can also check status.role === 'owner' if needed
        });
    }

    
  async checkEditPermissions() {
    const result = await this.roleService.checkRoleForCurrentProject('group-edit')
    console.log('[GROUP-EDIT-ADD] result ', result)
    this.isAuthorized = result === true;
    this.permissionChecked = true;
    console.log('[GROUP-EDIT-ADD] isAuthorized to view EDIT', this.isAuthorized)
    console.log('[GROUP-EDIT-ADD] permissionChecked ', this.permissionChecked)
  }

   async checkCreatePermissions() {
    const result = await this.roleService.checkRoleForCurrentProject('group-create')
    console.log('[GROUP-EDIT-ADD] result ', result)
    this.isAuthorized = result === true;
    this.permissionChecked = true;
    console.log('[GROUP-EDIT-ADD] isAuthorized to CREATE', this.isAuthorized)
    console.log('[GROUP-EDIT-ADD] permissionChecked ', this.permissionChecked)
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
       this.checkCreatePermissions();

      this.CREATE_VIEW = true;
      this.showSpinner = false;

    } else {
      this.logger.log('[GROUP-EDIT-ADD] - HAS CLICKED EDIT ');
      this.checkEditPermissions();
      this.EDIT_VIEW = true;

      this.getParamsAndThenGroupById();
    }
  }




  getParamsAndThenGroupById() {
    // Sottoscrivi ai cambiamenti dei parametri della route per gestire la navigazione tra gruppi
    this.route.params
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params) => {
        const newGroupId = params['groupid'];
        console.log('[GROUP-EDIT-ADD] - GROUP-LIST PAGE HAS PASSED group_id ', newGroupId);
        
        // Se il group_id è cambiato, resetta i dati prima di caricare il nuovo gruppo
        if (newGroupId && newGroupId !== this.group_id) {
          this.resetGroupData();
          this.group_id = newGroupId;
          this.getGroupById();
        } else if (newGroupId && !this.group_id) {
          // Prima volta che viene caricato
          this.group_id = newGroupId;
          this.getGroupById();
        }
      });
  }

  // Resetta tutti i dati del gruppo quando si cambia gruppo
  resetGroupData() {
    console.log('[GROUP-EDIT-ADD] - RESET GROUP DATA');
    this.group_members = [];
    this.users_selected = [];
    this.groupNameToUpdate = '';
    this.id_group = '';
    this.groupCreatedAt = '';
    this.count = 0;
    this.has_completed_getGroupById = false;
    this.departmentsOfGroup = [];
    
    // Resetta is_group_member in projectUsersList se esiste
    if (this.projectUsersList && Array.isArray(this.projectUsersList)) {
      this.projectUsersList.forEach(user => {
        user.is_group_member = false;
      });
    }
  }


  // ---------------------------------
  // GET GROUP BY ID (FOR EDIT VIEW)
  // ---------------------------------
  getGroupById() {
    this.groupsService.getGroupById(this.group_id).subscribe((group: any) => {
      console.log('[GROUP-EDIT-ADD] - GROUP GET BY ID', group);
      this.group_members = []
      // this.logger.log('MONGO DB FAQ-KB NAME', this.faqKbNameToUpdate);
      if (group) {
        this.groupNameToUpdate = group.name;
        this.group_members = group.members;
        this.id_group = group._id;
        this.groupCreatedAt = group.createdAt

        this.users_selected = this.group_members;
        console.log('[GROUP-EDIT-ADD] -GROUP MEMBERS ', this.group_members)
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
      this.getDeptsByProjectId(this.group_id)
    });
  }


  getDeptsByProjectId(groupid: string) {
  console.log('[GROUP-EDIT-ADD] - GET DEPTS groupid', groupid);
  this.deptService.getDeptsByProjectId().subscribe((departments: any[]) => {
    console.log('[GROUP-EDIT-ADD] - GET DEPTS (RAW)', departments);

    if (Array.isArray(departments)) {
      // filtra e salva il risultato in una proprietà dell'istanza
      this.departmentsOfGroup = departments.filter(dept =>
        Array.isArray(dept.groups) && dept.groups.some(g => g.group_id === groupid)
      );

      console.log('[GROUP-EDIT-ADD] - GET DEPTS (FILTERED) departmentsOfGroup', this.departmentsOfGroup);
    } else {
      this.departmentsOfGroup = [];
      console.warn('[GROUP-EDIT-ADD] - GET DEPTS: response non è un array');
    }
  }, error => {
    this.logger.error('[GROUP-EDIT-ADD] - GET DEPTS - ERROR', error);
    this.departmentsOfGroup = [];
  }, () => {
    this.logger.log('[GROUP-EDIT-ADD] - GET DEPTS - COMPLETE');
  });
}

goToDeptDetail(dept_id){
   if (this.PERMISSION_TO_READ_DEPT_DETAILS) {
      this.router.navigate(['project/' + this.project_id + '/department/edit', dept_id]);
    } else {
      this.notify.presentDialogNoPermissionToViewThisSection()
    }
}

  // is used to display name lastname role in the members list table
  // if the id of the user in the project_user object is equal match with one of id contains 
  // in the array 'this.group_members' the user_project property 'is_group_member' is set to true
  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[GROUP-EDIT-ADD] - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);
      this.logger.log('[GROUP-EDIT-ADD] - GROUP MEMBERS TO MATCH', this.group_members);

      this.showSpinner = false;
      this.showSpinnerInModal = false;
      this.projectUsersList = projectUsers;

      if (this.projectUsersList) {
        // IMPORTANTE: Resetta is_group_member per tutti gli utenti PRIMA di controllare i nuovi membri
        this.projectUsersList.forEach(projectUser => {
          projectUser.is_group_member = false;
          // Crea avatar con iniziali se non esistono già
          this.createProjectUserAvatar(projectUser);
        });

        // CHECK IF THE USER-ID IS BETWEEN THE MEMBER OF THE GROUP
        this.count = 0;
        
        if (this.group_members && Array.isArray(this.group_members) && this.group_members.length > 0) {
          this.projectUsersList.forEach(projectUser => {
            // Controlla se l'ID utente è presente nell'array group_members
            if (projectUser.id_user && projectUser.id_user._id) {
              const isMember = this.group_members.includes(projectUser.id_user._id);
              
              if (isMember) {
                projectUser.is_group_member = true;
                this.count = this.count + 1;
                this.logger.log('[GROUP-EDIT-ADD] GROUP MEMBER FOUND - User ID: ', projectUser.id_user._id, ' - is_group_member: ', projectUser.is_group_member);
              }
            }
          });
        }

        this.logger.log('[GROUP-EDIT-ADD] GROUP MEMBER count ', this.count);
        this.logger.log('[GROUP-EDIT-ADD] PROJECT USERS LIST WITH is_group_member', this.projectUsersList);
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

  // Crea avatar con iniziali per projectUser
  createProjectUserAvatar(projectUser: any) {
    if (!projectUser || !projectUser.id_user) {
      return;
    }

    const user = projectUser.id_user;
    
    // Se già esistono, non ricrearli
    if (user.fullname_initial && user.fillColour) {
      return;
    }

    let fullname = '';
    if (user.firstname && user.lastname) {
      fullname = user.firstname + ' ' + user.lastname;
      user.fullname_initial = avatarPlaceholder(fullname);
      user.fillColour = getColorBck(fullname);
    } else if (user.firstname) {
      fullname = user.firstname;
      user.fullname_initial = avatarPlaceholder(fullname);
      user.fillColour = getColorBck(fullname);
    } else if (user.email) {
      // Usa l'email come fallback
      fullname = user.email;
      user.fullname_initial = avatarPlaceholder(fullname);
      user.fillColour = getColorBck(fullname);
    } else {
      user.fullname_initial = 'N/A';
      user.fillColour = 'rgb(98, 100, 167)';
    }
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
      
      // Aggiorna i dati del gruppo con la risposta del server
      if (group) {
        this.group_members = (group as any).members || [];
        this.users_selected = this.group_members;
      }
    }, (error) => {
      this.logger.error('[GROUP-EDIT-ADD] - UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
      this.SHOW_CIRCULAR_SPINNER = false;
      this.showSpinner = false;
      this.ADD_MEMBER_TO_GROUP_ERROR = true;
    }, () => {
      this.logger.log('[GROUP-EDIT-ADD]- UPDATED GROUP WITH THE USER SELECTED * COMPLETE *');
      this.SHOW_CIRCULAR_SPINNER = false;
      this.ADD_MEMBER_TO_GROUP_ERROR = false;

      // =========== NOTIFY SUCCESS===========
      // this.notify.showNotification('group successfully updated', 2, 'done');
      this.notify.showWidgetStyleUpdateNotification(this.updateGroupSuccessNoticationMsg, 2, 'done');

      // UPDATE THE GROUP LIST - ricarica solo i dati necessari invece di ngOnInit completo
      this.getAllUsersOfCurrentProject();
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

      // Aggiorna immediatamente projectUsersList senza ricaricare dal server
      if (this.projectUsersList && Array.isArray(this.projectUsersList)) {
        const projectUserToUpdate = this.projectUsersList.find(
          (p: any) => p.id_user && p.id_user._id === this.id_user_to_delete
        );
        
        if (projectUserToUpdate && projectUserToUpdate.is_group_member) {
          projectUserToUpdate.is_group_member = false;
          this.count = Math.max(0, this.count - 1);
          this.logger.log('[GROUP-EDIT-ADD] - UPDATED projectUser.is_group_member to false for user: ', this.id_user_to_delete);
          this.logger.log('[GROUP-EDIT-ADD] - NEW COUNT: ', this.count);
        }
      }

      this.groupsService.updateGroup(this.id_group, this.group_members).subscribe((group) => {

        this.logger.log('[GROUP-EDIT-ADD] - UPDATED GROUP WITH THE USER SELECTED', group);
        
        // Aggiorna i dati del gruppo con la risposta del server
        if (group) {
          this.group_members = (group as any).members || [];
          this.users_selected = this.group_members;
        }

      }, (error) => {
        this.logger.error('[GROUP-EDIT-ADD] - UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while removing the member', 4, 'report_problem');
        this.notify.showWidgetStyleUpdateNotification(this.removeGroupMemberErrorNoticationMsg, 4, 'report_problem');
        
        // In caso di errore, ripristina lo stato precedente
        if (this.projectUsersList && Array.isArray(this.projectUsersList)) {
          const projectUserToRestore = this.projectUsersList.find(
            (p: any) => p.id_user && p.id_user._id === this.id_user_to_delete
          );
          if (projectUserToRestore) {
            projectUserToRestore.is_group_member = true;
            this.count = this.count + 1;
          }
          // Ripristina anche group_members
          this.group_members.push(this.id_user_to_delete);
        }

      }, () => {
        this.logger.log('[GROUP-EDIT-ADD] - UPDATED GROUP WITH THE USER SELECTED* COMPLETE *');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('member successfully removed', 2, 'done');
        this.notify.showWidgetStyleUpdateNotification(this.removeGroupMemberSuccessNoticationMsg, 2, 'done');

        // Non serve più ricaricare tutti gli utenti, abbiamo già aggiornato projectUsersList
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
