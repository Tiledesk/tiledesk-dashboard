import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { AuthService } from '../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import 'moment/locale/it.js';
import 'moment/locale/en-gb.js';
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
  browser_lang: string;
  showSpinner = true;
  pageNo = 0
  totalPagesNo_roundToUp: number;

  constructor(
    private usersService: UsersService,
    public auth: AuthService,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getBrowserLanguage();
    this.getCurrentProject();
    // this.getLoggedUserAndHisProjectUserId();
    this.getActivities();
    this.getCurrentUser();

    // this.getProjectUsers();
  }
  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    console.log('ActivitiesComponent - browser_lang ', this.browser_lang)
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        console.log('ActivitiesComponent - projectId ', this.projectId)
      }
    });
  }

  getCurrentUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('ActivitiesComponent - LoggedUser ', user);

      if (user && user._id) {
        this.currentUserId = user._id;
      }

    });
  }

  // getLoggedUserAndHisProjectUserId() {
  //   this.auth.user_bs.subscribe((user) => {
  //     console.log('ActivitiesComponent - LoggedUser ', user);

  //     if (user && user._id) {
  //       this.currentUserId = user._id;
  //       this.usersService.getProjectUsersByProjectIdAndUserId(user._id, this.projectId)
  //         .subscribe((project_user: any) => {

  //           console.log('ActivitiesComponent - Logged ProjectUser ', project_user);
  //           if (project_user) {
  //             this.projectUserIdOfcurrentUser = project_user[0]._id;
  //             console.log('ActivitiesComponent - Logged ProjectUser ID', this.projectUserIdOfcurrentUser);

  //             this.getActivities();
  //           }
  //         });

  //     }
  //   });
  // }


  // getProjectUsers() {
  //   this.usersService.getProjectUsersByProjectId().subscribe((project_users: any) => {

  //     console.log('ActivitiesComponent - getProjectUsers - RES ', project_users);

  //   }, (error) => {
  //     console.log('ActivitiesComponent - getProjectUsers - ERROR ', error);
  //   }, () => {
  //     console.log('ActivitiesComponent - getProjectUsers * COMPLETE *');
  //   });

  // }


  getActivities() {
    this.usersService.getUsersActivities(this.pageNo)
      .subscribe((res: any) => {
        console.log('ActivitiesComponent - getActivities - **** RESPONSE **** ', res);
        if (res) {
          const perPage = res.perPage;
          const count = res.count;
          console.log('ActivitiesComponent - getActivities RESPONSE - per Page ', perPage);
          console.log('ActivitiesComponent - getActivities RESPONSE - count ', count);



          const totalPagesNo = count / perPage;
          console.log('ActivitiesComponent - TOTAL PAGES NUMBER', totalPagesNo);

          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
          console.log('ActivitiesComponent - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);

          if (res.activities) {
            this.usersActivities = res.activities;
            this.usersActivities.forEach((activity: any) => {
              console.log('ActivitiesComponent - getActivities RESPONSE - activity ', activity);

              if (activity && activity.verb && activity.verb === 'PROJECT_USER_UPDATE') {
                if (activity.actor &&
                  activity.actor.id &&
                  activity.target &&
                  activity.target.object &&
                  activity.target.object.id_user &&
                  activity.target.object.id_user._id) {


                  if (activity.actor.id === activity.target.object.id_user._id) {
                    activity.targetOfActionIsYourself = true;
                  } else {
                    activity.targetOfActionIsYourself = false;
                  }
                }
              }

              // moment.locale('en-gb')
              if (this.browser_lang === 'it') {
                moment.locale('it')
                const date = moment(activity.updatedAt).format('dddd, DD MMM YYYY - HH:mm:ss');
                console.log('ActivitiesComponent - getActivities - updatedAt date', date);
                activity.date = date;
              } else {
                const date = moment(activity.updatedAt).format('dddd, MMM DD, YYYY - HH:mm:ss');
                console.log('ActivitiesComponent - getActivities - updatedAt date', date);
                activity.date = date;
              }
            });
          }
        }

      }, (error) => {
        this.showSpinner = false;
        console.log('ActivitiesComponent - getActivities - ERROR ', error);
      }, () => {
        console.log('ActivitiesComponent - getActivities * COMPLETE *');
        this.showSpinner = false;
      });
  }

  /// PAGINATION
  decreasePageNumber() {
    this.pageNo -= 1;

    console.log('ActivitiesComponent - DECREASE PAGE NUMBER ', this.pageNo);
    this.getActivities();
  }

  increasePageNumber() {
    this.pageNo += 1;

    console.log('ActivitiesComponent - INCREASE PAGE NUMBER ', this.pageNo);
    this.getActivities();
  }

  goToMemberProfile(member_id: any) {
    console.log('has clicked GO To MEMBER ', member_id);
    this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
  }

}
