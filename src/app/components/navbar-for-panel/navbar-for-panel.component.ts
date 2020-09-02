import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../services/users.service';
@Component({
  selector: 'appdashboard-navbar-for-panel',
  templateUrl: './navbar-for-panel.component.html',
  styleUrls: ['./navbar-for-panel.component.scss']
})
export class NavbarForPanelComponent implements OnInit {
  user: any;
  currentUserId: string;
  IS_AVAILABLE: boolean;
  IS_BUSY: boolean;
  USER_ROLE: string;
  projectId: string;


  constructor(
    private auth: AuthService,
    private usersService: UsersService,
  ) { }

  ngOnInit() {

    this.getLoggedUser();
    this.getCurrentProject();
    // this.getUserAvailability();
    // this.getUserUserIsBusy();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        // console.log('00 -> !!!! CONTACTS project ID from AUTH service subscription  ', this.projectId)
      }
    });
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('NAVBAR-FOR-PANEL - LOGGED USER ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;

      if (user) {
        this.currentUserId = user._id;
        console.log('NAVBAR-FOR-PANEL - CURRENT USER ID ', this.currentUserId);

        if (this.currentUserId) {

        
          // this.getProjectUserByCurrentUserIdAndProjectId()
        }

      }
    });
  }

  // note: the project id is passed in the service
  getProjectUserByCurrentUserIdAndProjectId() {
    this.usersService.getProjectUserByUserId(this.currentUserId).subscribe((projectUser: any) => {

      console.log('NAVBAR-FOR-PANEL PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID - PROJECT USER ', projectUser);
      console.log('NAVBAR-FOR-PANEL PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID LENGTH', projectUser.length);
      if ((projectUser) && (projectUser.length !== 0)) {
        console.log('NAVBAR-FOR-PANEL PROJECT-USER ID ', projectUser[0]._id)
        console.log('NAVBAR-FOR-PANEL USER IS AVAILABLE (from db)', projectUser[0].user_available)
        console.log('NAVBAR-FOR-PANEL USER IS BUSY (from db)', projectUser[0].isBusy)
        // this.user_is_available_bs = projectUser.user_available;

        // NOTE_nk: comment this this.subsTo_WsCurrentUser(projectUser[0]._id)
        this.subsTo_WsCurrentUser(projectUser[0]._id)

        if (projectUser[0].user_available !== undefined) {
          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy)
        }

        // ADDED 21 AGO
        if (projectUser[0].role !== undefined) {
          console.log('NAVBAR-FOR-PANEL GET PROJECT USER ROLE FOR THE PROJECT ', this.projectId, ' »» ', projectUser[0].role);

          // ASSIGN THE projectUser[0].role VALUE TO USER_ROLE
          this.USER_ROLE = projectUser[0].role;

          // SEND THE ROLE TO USER SERVICE THAT PUBLISH
          this.usersService.user_role(projectUser[0].role);
        }
      } else {
        // this could be the case in which the current user was deleted as a member of the current project
        console.log('NAVBAR-FOR-PANEL PROJECT-USER UNDEFINED ')
      }

    }, (error) => {
      console.log('NAVBAR-FOR-PANEL PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
    }, () => {
      console.log('NAVBAR-FOR-PANEL PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
    });
  }


  subsTo_WsCurrentUser(currentuserprjctuserid) {
    console.log('SB - SUBSCRIBE TO WS CURRENT-USER AVAILABILITY  prjct user id of current user ', currentuserprjctuserid);
    this.usersService.subscriptionToWsCurrentUser(currentuserprjctuserid);
    // this.getWsCurrentUserAvailability$();
    // this.getWsCurrentUserIsBusy$();
}

  // getUserAvailability() {
  //   this.usersService.user_is_available_bs.subscribe((user_available) => {
  //     this.IS_AVAILABLE = user_available;
  //     console.log('NAVBAR-FOR-PANEL - USER IS AVAILABLE ', this.IS_AVAILABLE);
  //   });
  // }

  // getUserUserIsBusy() {
  //   this.usersService.user_is_busy$.subscribe((user_isbusy) => {
  //     this.IS_BUSY = user_isbusy;
  //     // THE VALUE OF IS_BUSY IS THEN UPDATED WITH THE VALUE RETURNED FROM THE WEBSOCKET getWsCurrentUserIsBusy$()
  //     // WHEN, FOR EXAMPLE IN PROJECT-SETTINGS > ADVANCED THE NUM OF MAX CHAT IS 3 AND THE 
  //     console.log('!!! SIDEBAR - USER IS BUSY (from db)', this.IS_BUSY);
  //   });
  // }


}
