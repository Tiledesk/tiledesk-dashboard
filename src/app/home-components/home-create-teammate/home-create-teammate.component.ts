import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { GroupService } from 'app/services/group.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';
import { avatarPlaceholder, getColorBck } from 'app/utils/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'appdashboard-home-create-teammate',
  templateUrl: './home-create-teammate.component.html',
  styleUrls: ['./home-create-teammate.component.scss']
})
export class HomeCreateTeammateComponent implements OnInit {
  public projectUsers: any;
  public storageBucket: string;
  public baseUrl: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  projectId: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  USER_ROLE: string;
  numOfTeammatesNotDiplayed: number;
  countOfTeammates: number;
  constructor(
    public auth: AuthService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private usersService: UsersService,
    private groupsService: GroupService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    console.log('[HOME-CREATE-TEAMMATE] OnInit  ')
    this.getCurrentProjectAndPrjctTeammates();
    // this.getGroupsByProjectId();
  }


  getGroupsByProjectId() {
    this.groupsService.getGroupsByProjectId().subscribe((groups: any) => {
      console.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID ', groups);

      // this.groupsList = groups;


    }, (error) => {
      console.error('[HOME-CREATE-TEAMMATE] GET GROUPS - ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      // this.showSpinner = false;
      console.log('[HOME-CREATE-TEAMMATE] GET GROUPS * COMPLETE');
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('[HOME-CREATE-TEAMMATE] changes  ', changes)
    // this.getCurrentProjectAndPrjctTeammates();
  }

  getCurrentProjectAndPrjctTeammates() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        console.log('[HOME-CREATE-TEAMMATE] $UBSCIBE TO PUBLISHED PROJECT - RES  ', project)
        if (project) {
          this.projectId = project._id
          this.getImageStorageThenProjectUsers();
        }
      }, (error) => {
        console.error('[HOME-CREATE-TEAMMATE] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);

      }, () => {
        console.log('[HOME-CREATE-TEAMMATE] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }

  getImageStorageThenProjectUsers() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      console.log('[HOME-CREATE-TEAMMATE] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')

      this.getAllUsersOfCurrentProject(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE)


    } else {

      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
      console.log('[HOME-CREATE-TEAMMATE] ', this.baseUrl, 'usecase native')
      this.getAllUsersOfCurrentProject(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME

    }
  }

  getAllUsersOfCurrentProject(storage, uploadEngineIsFirebase) {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('[HOME-CREATE-TEAMMATE] - GET PROJECT-USERS BY PROJECT ID ', projectUsers);

      if (projectUsers) {
        this.projectUsers = projectUsers
        this.countOfTeammates = projectUsers.length;
        if (this.countOfTeammates > 10) {
          this.numOfTeammatesNotDiplayed = this.countOfTeammates - 10

        }

        this.groupsService.getGroupsByProjectId().subscribe((groups: any) => {
          console.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID ', groups);
          let groupArray = []
          let groupArrayGrouped = []
          if (groups && groups.length > 0) {
            for (let i = 0; i < groups.length; i++) {
              console.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > GROUP NAME ', groups[i].name)
              console.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > GROUP MEMBERS ', groups[i].members)
              groupArray.push({ groupName: groups[i].name, groupMembers: groups[i].members })
              console.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > GROUP ARRAY ', groupArray)

             
        
              //   if (groups[i].members && groups[i].members.length > 0) {
              //     for (let j = 0; j < groups[i].members.length; j++) {
              //       console.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > GROUP MEMBERS > MEMBER', groups[i].members[j])

              //       if (projectUsers && projectUsers.length > 0) {
              //         for (let x = 0; x < projectUsers.length; x++) {
              //           // console.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > PU > USER ID', projectUsers[x].id_user._id)
              //           if (groups[i].members[j] === projectUsers[x].id_user._id) {
              //             // group.push(groups[i].name)
              //             projectUsers[x]['group'] = groups[i].name
              //           }
              //         }
              //       }
              //     }
              //   }
              // }
            }

            // if (groupArray && groupArray['groupMembers'] && groupArray['groupMembers'].length > 0) {
            //   groupArray['groupMembers'].forEach(member => {
            //     groupArrayGrouped.push({memberId:member , groupName: groupArray['groupName']} ) 
            //   });
            //   console.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > groupArrayGrouped ', groupArrayGrouped)
            // }

          
          }
        })



        // ------------------------
        // CHECK IF USER HAS IMAGE
        // ------------------------
        this.projectUsers.forEach(user => {
          let imgUrl = ''
          if (uploadEngineIsFirebase === true) {
            // this.logger.log('[HOME-CREATE-TEAMMATE] - CHECK IF csnUSER HAS IMAGE - UPLOAD ENGINE IS FIREBASE ? ', uploadEngineIsFirebase);
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Firebase 
            // ------------------------------------------------------------------------------
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + storage + "/o/profiles%2F" + user['id_user']['_id'] + "%2Fphoto.jpg?alt=media"

          } else {
            // this.logger.log('[HOME-CREATE-TEAMMATE] - CHECK IF USER HAS IMAGE - UPLOAD ENGINE IS FIREBASE ? ', uploadEngineIsFirebase);
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Native 
            // ------------------------------------------------------------------------------
            imgUrl = storage + "images?path=uploads%2Fusers%2F" + user['id_user']['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }

          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              this.logger.log('[HOME-CREATE-TEAMMATE] - IMAGE EXIST X USERS', user);
              user.hasImage = true;
            }
            else {
              this.logger.log('[HOME-CREATE-TEAMMATE] - IMAGE NOT EXIST X USERS', user);
              user.hasImage = false;
            }
          });
          let fullname = '';
          if (user && user['id_user'] && user['id_user'].firstname && user['id_user'].lastname) {
            fullname = user['id_user']['firstname'] + ' ' + user['id_user']['lastname']
            user['fullname_initial'] = avatarPlaceholder(fullname);
            user['fillColour'] = getColorBck(fullname)
          } else if (user && user['id_user'] && user['id_user'].firstname) {

            fullname = user['id_user'].firstname
            user['fullname_initial'] = avatarPlaceholder(fullname);
            user['fillColour'] = getColorBck(fullname)
          } else {
            user['fullname_initial'] = 'N/A';
            user['fillColour'] = 'rgb(98, 100, 167)';
          }
        });
      }

    }, error => {
      console.error('[HOME-CREATE-TEAMMATE] - GET PROJECT-USERS  - ERROR', error);
    }, () => {
      console.log('[HOME-CREATE-TEAMMATE] - GET PROJECT-USERS  - COMPLETE')
    });
  }


  checkImageExists(imageUrl, callBack) {
    var imageData = new Image();
    imageData.onload = function () {
      callBack(true);
    };
    imageData.onerror = function () {
      callBack(false);
    };
    imageData.src = imageUrl;
  }

  goToTeammates() {
    console.log('[HOME-CREATE-TEAMMATE] - goToTeammates clicked')
    this.router.navigate(['project/' + this.projectId + '/users'])
  }


}
