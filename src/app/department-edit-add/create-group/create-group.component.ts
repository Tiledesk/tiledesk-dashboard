import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { slideInOutAnimation } from './../../_animations/index';
import { UsersService } from '../../services/users.service';
import { AppConfigService } from '../../services/app-config.service';


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

  @Input() newInnerWidth
  @Input() deptName_toUpdate

  @ViewChild('scrollMe')
  private myScrollContainer: ElementRef;

  showSpinner = true;
  projectUsersList: any;
  storageBucket: string;
  groupMembersArray = [];
  sidebar_height: any;
  group_name: string
  constructor(
    private usersService: UsersService,
    public appConfigService: AppConfigService

  ) {

    // this.sidebar_height = this.newInnerWidth +'px'

  }


  ngOnInit() {
    this.group_name = this.deptName_toUpdate + ' ' + 'group' 
    this.getStorageBucket();
    this.getAllUsersOfCurrentProject();
    // this.getScollPosition()
  }

  ngAfterViewInit() {
    // this.sidebar_height = this.newInnerWidth +'px'
    // console.log('CREATE GROUP SIDEBAR >>>  sidebar_height ',  this.sidebar_height);
  }

  onScroll(event: any): void {
    // console.log('RICHIAMO ON SCROLL ')
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;
    console.log('CREATE GROUP SIDEBAR >>> scrollPosition', scrollPosition);
    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    console.log('CREATE GROUP SIDEBAR >>> scrollHeight', scrollHeight);
    // console.log('ON SCROLL - SCROLL POSITION ', scrollPosition);
    // console.log('ON SCROLL - SCROLL HEIGHT ', scrollHeight);

    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    // console.log('ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
    // if (scrollHeighLessScrollPosition > 500) {
    //   this.displayBtnScrollToBottom = 'block';
    // } else {
    //   this.displayBtnScrollToBottom = 'none';
    // }
  }
  getScollPosition() {
    // const elemSaveGroup = <HTMLElement>document.querySelector('.div-save-group');
    // console.log('CREATE GROUP SIDEBAR scrollLeft', elemSaveGroup.scrollLeft);
    // console.log('CREATE GROUP SIDEBAR scrollTop', elemSaveGroup.scrollTop);

    // var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    // var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // console.log('CREATE GROUP SIDEBAR >>> scrollLeft', scrollLeft);
    // console.log('CREATE GROUP SIDEBAR >>> scrollTop', scrollTop);
    const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    const _elemFooter = <HTMLElement>document.querySelector('footer');
    // console.log('CREATE GROUP SIDEBAR >>> _elemFooter', _elemFooter);
    // const footerTop = _elemFooter.offsetTop
    // console.log('CREATE GROUP SIDEBAR >>> footerTop offsetTop ', footerTop);
    // console.log('CREATE GROUP SIDEBAR >>> _elemMainPanel scrollTop', _elemMainPanel.scrollTop);

    // if (_elemMainPanel.onscroll) {
    //   console.log('CREATE GROUP SIDEBAR >>> _elemMainPanel scrollTop', _elemMainPanel.scrollTop);
    // }

    _elemMainPanel.addEventListener("scroll", function () {
      console.log('CREATE GROUP SIDEBAR >>> _elemMainPanel calling scroll',);
      console.log('CREATE GROUP SIDEBAR >>> _elemMainPanel scrollTop', _elemMainPanel.scrollTop);
    });

    // window.onscroll = function (ev) {
    //   console.log('CREATE GROUP SIDEBAR >>> _window.onscroll ', window.innerHeight);
    //   if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    //     alert("you're at the bottom of the page");
    //   }
    // };

  }

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


  createGroup(userid) {
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

    // DISABLE THE ADD BUTTON
    // if (this.users_selected.length < 1) {
    //   this.add_btn_disabled = true;

    // } else {
    //   this.add_btn_disabled = false;
    // }
  }

}
