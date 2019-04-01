import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'appdashboard-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  projectId: string;
  projectUserIdOfcurrentUser: string;
  currentUserId: string;
  usersActivities: any;
  constructor(
    private usersService: UsersService,
    public auth: AuthService,
  ) { }

  ngOnInit() {
    this.getCurrentProject();
    this.getLoggedUserAndHisProjectUserId();

    // this.getProjectUsers();
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        console.log('ActivitiesComponent - projectId ', this.projectId)
      }
    });
  }

  getLoggedUserAndHisProjectUserId() {
    this.auth.user_bs.subscribe((user) => {
      console.log('ActivitiesComponent - LoggedUser ', user);

      if (user && user._id) {
        this.currentUserId = user._id;
        this.usersService.getProjectUsersByProjectIdAndUserId(user._id, this.projectId)
          .subscribe((project_user: any) => {

            console.log('ActivitiesComponent - Logged ProjectUser ', project_user);
            if (project_user) {
              this.projectUserIdOfcurrentUser = project_user[0]._id;
              console.log('ActivitiesComponent - Logged ProjectUser ID', this.projectUserIdOfcurrentUser);

              this.getActivities();
            }
          });

      }
    });
  }


  getProjectUsers() {
    this.usersService.getProjectUsersByProjectId().subscribe((project_users: any) => {

      console.log('ActivitiesComponent - getProjectUsers - RES ', project_users);

    }, (error) => {
      console.log('ActivitiesComponent - getProjectUsers - ERROR ', error);
    }, () => {
      console.log('ActivitiesComponent - getProjectUsers * COMPLETE *');
    });

  }


  getActivities() {
    this.usersService.getUsersActivities()
      .subscribe((res: any) => {
        // console.log('getActivities - RESPONSE ', res );
        if (res) {
          const perPage = res.perPage;
          const count = res.count;
          console.log('ActivitiesComponent - getActivities RESPONSE - per Page ', perPage);
          console.log('ActivitiesComponent - getActivities RESPONSE - count ', count);

          if (res.activities) {
            this.usersActivities = res.activities;
            this.usersActivities.forEach((activity: any) => {
              console.log('ActivitiesComponent - getActivities RESPONSE - activity ', activity);

              const userId = activity.actor;


              // console.log('ActivitiesComponent - getActivities RESPONSE - userId ', userId);

              const targetSplitted = activity.target.split('/');
              // console.log('ActivitiesComponent - getActivities RESPONSE - targetSplitted ', targetSplitted);

              const target_ProjectUserId = targetSplitted[3];
              // tslint:disable-next-line:max-line-length
              console.log('ActivitiesComponent - getActivities RESPONSE - target_ProjectUserId ', target_ProjectUserId,
                ' currentUserProjectUserId ', this.projectUserIdOfcurrentUser);
              if (this.projectUserIdOfcurrentUser === target_ProjectUserId) {

                activity.targetOfActionIsYourself = true;
              } else {

                activity.targetOfActionIsYourself = false;
              }


              this.usersService.getUsersById(userId).subscribe((user: any) => {

                console.log('ActivitiesComponent - getUsersById - RES ', user);
                if (user) {
                  activity.actorfullname = user.firstname + ' ' + user.lastname
                }

              }, (error) => {
                console.log('ActivitiesComponent - getUsersById - ERROR ', error);
              }, () => {
                console.log('ActivitiesComponent - getUsersById * COMPLETE *');
              });

            });
          }
        }

      }, (error) => {
        console.log('ActivitiesComponent - getActivities - ERROR ', error);
      }, () => {
        console.log('ActivitiesComponent - getActivities * COMPLETE *');
      });
  }

}
