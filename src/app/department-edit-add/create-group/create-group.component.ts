import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { slideInOutAnimation } from './../../_animations/index';
import { UsersService } from '../../services/users.service';
import { AppConfigService } from '../../services/app-config.service';
import { GroupService } from '../../services/group.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../core/notify.service';
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

  // @ViewChild('scrollMe')
  // private myScrollContainer: ElementRef;

  showSpinner = true;
  projectUsersList: any;
  storageBucket: string;
  groupMembersArray = [];
  sidebar_height: any;
  group_name: string;
  new_group_id: string;
  create_group_and_add_members_btn_disabled = true;
  group_created_success_msg: string;
  group_created_error_msg: string;
  constructor(
    private usersService: UsersService,
    private groupsService: GroupService,
    public appConfigService: AppConfigService,
    private notify: NotifyService,
    private translate: TranslateService
  ) {

    // this.sidebar_height = this.newInnerWidth +'px'

  }


  ngOnInit() {
    this.group_name = this.deptName_toUpdate + ' ' + 'group'
    this.getStorageBucket();
    this.getAllUsersOfCurrentProject();
    this.translateCreateGroupMsgs()
    // this.getScollPosition()
  }

  
  translateCreateGroupMsgs() {
    this.translate.get('CreatedGroupSuccessMsg')
      .subscribe((text: string) => {

        this.group_created_success_msg = text;
        console.log('+ + + CreatedGroupSuccessMsg', text)
      });

      this.translate.get('CreatedGroupErrorMsg')
      .subscribe((text: string) => {

        this.group_created_error_msg = text;
        console.log('+ + + CreatedGroupErrorMsg', text)
      });
  }

  ngAfterViewInit() {
    // this.sidebar_height = this.newInnerWidth +'px'
    // console.log('CREATE GROUP SIDEBAR >>>  sidebar_height ',  this.sidebar_height);
  }

  // onScroll(event: any): void {
  //   // console.log('RICHIAMO ON SCROLL ')
  //   const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;
  //   console.log('CREATE GROUP SIDEBAR >>> scrollPosition', scrollPosition);
  //   const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
  //   console.log('CREATE GROUP SIDEBAR >>> scrollHeight', scrollHeight);
  //   // console.log('ON SCROLL - SCROLL POSITION ', scrollPosition);
  //   // console.log('ON SCROLL - SCROLL HEIGHT ', scrollHeight);

  //   const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
  //   // console.log('ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
  //   // if (scrollHeighLessScrollPosition > 500) {
  //   //   this.displayBtnScrollToBottom = 'block';
  //   // } else {
  //   //   this.displayBtnScrollToBottom = 'none';
  //   // }
  // }
  // getScollPosition() {
  //   // const elemSaveGroup = <HTMLElement>document.querySelector('.div-save-group');
  //   // console.log('CREATE GROUP SIDEBAR scrollLeft', elemSaveGroup.scrollLeft);
  //   // console.log('CREATE GROUP SIDEBAR scrollTop', elemSaveGroup.scrollTop);

  //   // var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  //   // var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  //   // console.log('CREATE GROUP SIDEBAR >>> scrollLeft', scrollLeft);
  //   // console.log('CREATE GROUP SIDEBAR >>> scrollTop', scrollTop);
  //   const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
  //   const _elemFooter = <HTMLElement>document.querySelector('footer');
  //   // console.log('CREATE GROUP SIDEBAR >>> _elemFooter', _elemFooter);
  //   // const footerTop = _elemFooter.offsetTop
  //   // console.log('CREATE GROUP SIDEBAR >>> footerTop offsetTop ', footerTop);
  //   // console.log('CREATE GROUP SIDEBAR >>> _elemMainPanel scrollTop', _elemMainPanel.scrollTop);

  //   // if (_elemMainPanel.onscroll) {
  //   //   console.log('CREATE GROUP SIDEBAR >>> _elemMainPanel scrollTop', _elemMainPanel.scrollTop);
  //   // }

  //   _elemMainPanel.addEventListener("scroll", function () {
  //     console.log('CREATE GROUP SIDEBAR >>> _elemMainPanel calling scroll',);
  //     console.log('CREATE GROUP SIDEBAR >>> _elemMainPanel scrollTop', _elemMainPanel.scrollTop);
  //   });

  //   // window.onscroll = function (ev) {
  //   //   console.log('CREATE GROUP SIDEBAR >>> _window.onscroll ', window.innerHeight);
  //   //   if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
  //   //     alert("you're at the bottom of the page");
  //   //   }
  //   // };

  // }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET (CREATE GROUP SIDEBAR) ', this.storageBucket)
  }


  closeCreateGroupRightSideBar() {
    console.log('CREATE GROUP SIDEBAR - CALLING CLOSE ')
    this.valueChange.emit(false);
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('CREATE GROUP SIDEBAR - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      if (projectUsers) {
        this.projectUsersList = projectUsers;
      }

    }, error => {
      this.showSpinner = false;

      console.log('CREATE GROUP SIDEBAR - PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      console.log('CREATE GROUP SIDEBAR - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
      this.showSpinner = false;
    });
  }


  addMembersToArray(userid) {
    console.log('CREATE GROUP SIDEBAR - change - userid', userid);

    const index = this.groupMembersArray.indexOf(userid);
    console.log('CREATE GROUP SIDEBAR USERID INDEX ', index);

    if (index > -1) {
      this.groupMembersArray.splice(index, 1);
    } else {
      this.groupMembersArray.push(userid);
    }

    console.log('CREATE GROUP SIDEBAR - ARRAY OF SELECTED USERS ', this.groupMembersArray);
    console.log('CREATE GROUP SIDEBAR - ARRAY OF SELECTED USERS lenght ', this.groupMembersArray.length);

    // DISABLE THE CREATE GROUP AND THEN ADD MEMBERS BUTTON
    if (this.groupMembersArray.length < 1) {
      this.create_group_and_add_members_btn_disabled = true;

    } else {
      this.create_group_and_add_members_btn_disabled = false;
    }
  }


  onChangeGroupName(event) {
    this.group_name = event;
    console.log('CREATE GROUP SIDEBAR - onChangeGroupName ', this.group_name);
  }

  // group_created_success_msg: string;
  // group_created_error_msg: string;

  createGroupAndAddMembers() {

    // CREATE THE GROUP
    this.groupsService.createGroup(this.group_name)
      .subscribe((group) => {
        console.log('CREATE GROUP SIDEBAR - RES ', group);

        if (group) {
          this.group_name = group.name;
          this.new_group_id = group._id

          console.log('CREATE GROUP SIDEBAR - new_group_id ', this.new_group_id);
        }

      }, (error) => {
        console.log('CREATE GROUP SIDEBAR - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.group_created_error_msg, 4, 'report_problem');

      }, () => {
        console.log('CREATE GROUP SIDEBAR  * COMPLETE *');

        this.updatedGroupWithSelectedMembers();

      });
  }

  updatedGroupWithSelectedMembers() {
    this.groupsService.updateGroup(this.new_group_id, this.groupMembersArray).subscribe((group) => {

      console.log('CREATE GROUP SIDEBAR - UPDATED GROUP WITH THE USER SELECTED', group);

      // this.COUNT_OF_MEMBERS_ADDED = group.members.length;
      console.log('CREATE GROUP SIDEBAR - # OF MEMBERS ADDED ', group.members.length);

    }, (error) => {
      console.log('CREATE GROUP SIDEBAR - UPDATED GROUP WITH THE USER SELECTED - ERROR ', error);
      this.notify.showWidgetStyleUpdateNotification(this.group_created_error_msg, 4, 'report_problem');
    }, () => {
      console.log('CREATE GROUP SIDEBAR - UPDATED GROUP WITH THE USER SELECTED * COMPLETE *');

      this.notify.showWidgetStyleUpdateNotification(this.group_created_success_msg, 2, 'done');
      
      this.closeCreateGroupRightSideBarAndEmitGroupCreated()
    });
  }

  closeCreateGroupRightSideBarAndEmitGroupCreated() {
    console.log('CREATE GROUP SIDEBAR - CALLING CLOSE ')
    this.valueChange.emit(false);
    this.groupcreated.emit(this.new_group_id);
  }



}
