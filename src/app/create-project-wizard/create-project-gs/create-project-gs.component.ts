import { Component, isDevMode, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { emailDomainWhiteList } from 'app/utils/util';
import moment from 'moment';

@Component({
  selector: 'appdashboard-create-project-gs',
  templateUrl: './create-project-gs.component.html',
  styleUrls: ['./create-project-gs.component.scss']
})
export class CreateProjectGsComponent implements OnInit {
  public user: any;
  public new_project: any;
  public id_project: string;

  constructor(
    public auth: AuthService,
    private projectService: ProjectService,
    private router: Router,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.getLoggedUserAndProjects()
  }

  getLoggedUserAndProjects() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.getProjects(user)
        this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] USER  ', user)
        this.user = user
        // this.createNewProject(user)
        // this.router.navigate(['/create-new-project']);
        this.router.navigate(['/onboarding']);
      }
    })
  }


  getProjects(user) {
   
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] getProjects PROJECTS ', projects);

      if (projects && projects.length === 0) {
        this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] THERE IS NOT PROJECTS ');

        if (!isDevMode()) {
          if (window['analytics']) {
            try {
              window['analytics'].page("Google sign up, onboarding", {
    
              });
            } catch (err) {
              this.logger.error('Google sign up, onboarding - error', err);
            }
            let userFullname = ''
            if (user.firstname && user.lastname)  {
              userFullname = user.firstname + ' ' + user.lastname
            } else if (user.firstname && !user.lastname) {
              userFullname = user.firstname
            }
            try {
              window['analytics'].identify(user._id, {
                name: userFullname,
                email: user.email,
                logins: 5,
                plan: "Premium (trial)"
              });
            } catch (err) {
              this.logger.error('Google sign up identify error', err);
            }

            try {
              window['analytics'].track("Signed Up", {
                "type": "organic",
                "first_name": user.firstname,
                "last_name": user.lastname,
                "email": user.email,
                "username": userFullname,
                'userId': user._id,
                'button': "Signup up with Google",
                'method': "Google Auth"
              });
            } catch (err) {
              this.logger.error('track signup event error', err);
            }
      
          }
        }
       
  
      }
    }, error => {
      this.logger.error('[CREATE-PROJECT-GOOGLE-AUTH getProjects - ERROR ', error)
    }, () => {
      this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] getProjects - COMPLETE')
    });
  }

  // --------------------------------------------------
  // NOT USED
  // --------------------------------------------------
  // createNewProject(user) {
  //   let projectName = ''
  //   const email = user['email']
  //   if (email.includes('@')) {
  //     const emailAfterAt = email.split('@')[1];
  //     if (!emailDomainWhiteList.includes(emailAfterAt)) {
  //       if (emailAfterAt.includes('.'))
  //         projectName = emailAfterAt.split('.')[0]
  //       else if (!emailAfterAt.includes('.')) {
  //         projectName = emailAfterAt
  //       }
  //     } else {
  //       projectName = 'My awesome project'
  //     }
  //   } else {
  //     projectName = 'My awesome project'
  //   }
  //   // this.DISPLAY_SPINNER_SECTION = true;
  //   // this.DISPLAY_SPINNER = true;
  //   this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] CREATE NEW PROJECT - PROJECT-NAME DIGIT BY USER ', projectName);

  //   this.projectService.createProject(projectName, 'signup')
  //     .subscribe((project: Project) => {
  //       this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] POST DATA PROJECT RESPONSE ', project);
  //       if (project) {

  //         // SENT THE NEW PROJECT TO THE AUTH SERVICE THAT PUBLISH
  //         project['role'] = 'owner'
  //         this.auth.projectSelected(project, 'create-project-gs')
  //         this.id_project = project._id
  //         localStorage.setItem(this.id_project, JSON.stringify(project));
          
  //         this.router.navigate([`/project/${this.id_project}/configure-widget`]);

  //         this.new_project = project
  //         // // WHEN THE USER SELECT A PROJECT ITS ID IS SEND IN THE PROJECT SERVICE THET PUBLISHES IT
  //         // // THE SIDEBAR SIGNS UP FOR ITS PUBLICATION
  //         // const newproject: Project = {
  //         //   _id: project['_id'],
  //         //   name: project['name'],
  //         //   operatingHours: project['activeOperatingHours'],
  //         //   profile_type: project['profile'].type,
  //         //   profile_name: project['profile'].name,
  //         //   trial_expired: project['trialExpired']
  //         // }
  //       }


  //     }, (error) => {
  //       // this.DISPLAY_SPINNER = false;
  //       this.logger.error('[CREATE-PROJECT-GOOGLE-AUTH] CREATE NEW PROJECT - POST REQUEST - ERROR ', error);

  //     }, () => {
  //       this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] CREATE NEW PROJECT - POST REQUEST * COMPLETE *');
  //       this.projectService.newProjectCreated(true);

  //       this.trackTrial(user)

  //       // 'getProjectsAndSaveInStorage()' was called only on the onInit lifehook, now recalling also after the creation 
  //       // of the new project resolve the bug  'the auth service not find the project in the storage'
  //       // this.getProjectsAndSaveInStorage();

  //     });
  // }

 

  // getProjectsAndSaveInStorage() {
  //   this.projectService.getProjects().subscribe((projects: any) => {
  //     this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] !!! getProjectsAndSaveInStorage PROJECTS ', projects);

  //     if (projects) {
  //       // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
  //       // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
  //       // AND THEN PUBLISH PROJECT ID AND PROJECT NAME
  //       projects.forEach(project => {
  //         this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] !!! getProjectsAndSaveInStorage SET PROJECT IN STORAGE')
  //         if (project.id_project) {
  //           const prjct: Project = {
  //             _id: project.id_project._id,
  //             name: project.id_project.name,
  //             role: project.role,
  //             operatingHours: project.id_project.activeOperatingHours
  //           }

  //           localStorage.setItem(project.id_project._id, JSON.stringify(prjct));
  //         }
  //       });
  //     }
  //   }, error => {
  //     this.logger.error('[CREATE-PROJECT-GOOGLE-AUTH] getProjectsAndSaveInStorage - ERROR ', error)
  //   }, () => {
  //     this.logger.log('[CREATE-PROJECT-GOOGLE-AUTH] getProjectsAndSaveInStorage - COMPLETE')
  //   });
  // }

  // trackTrial(user) {
  //   const trialStarDate = moment(new Date(this.new_project.createdAt)).format("YYYY-MM-DD hh:mm:ss")
  //   // this.logger.log('[WIZARD - CREATE-PRJCT] POST DATA PROJECT trialStarDate ', trialStarDate);
  //   const trialEndDate = moment(new Date(this.new_project.createdAt)).add(14, 'days').format("YYYY-MM-DD hh:mm:ss")
  //   // this.logger.log('[WIZARD - CREATE-PRJCT] POST DATA PROJECT trialEndDate', trialEndDate)

  //   if (!isDevMode()) {
  //     if (window['analytics']) {
  //       try {
  //         window['analytics'].page("Google Auth, Create project", {

  //         });
  //       } catch (err) {
  //        this.logger.error('Google Auth project page error', err);
  //       }

  //       let userFullname = ''
  //       if (user.firstname && user.lastname)  {
  //         userFullname = user.firstname + ' ' + user.lastname
  //       } else if (user.firstname && !user.lastname) {
  //         userFullname = user.firstname
  //       }
  //       try {
  //         window['analytics'].identify(user._id, {
  //           name: userFullname,
  //           email: user.email,
  //           logins: 5,
  //           plan: "Premium (trial)"
  //         });
  //       } catch (err) {
  //         this.logger.error('Google Auth project identify error', err);
  //       }

  //       try {
  //         window['analytics'].track('Trial Started', {
  //           "userId": user._id,
  //           "trial_start_date": trialStarDate,
  //           "trial_end_date": trialEndDate,
  //           "trial_plan_name": "Premium (trial)",
  //           "context": {
  //             "groupId": this.new_project._id
  //           }
  //         });
  //       } catch (err) {
  //        this.logger.error('Google Auth track Trial Started event error', err);
  //       }

  //       try {
  //         window['analytics'].group(this.new_project._id, {
  //           name: this.new_project.name,
  //           plan: "Premium (trial)",
  //         });
  //       } catch (err) {
  //         this.logger.error('Google Auth project group error', err);
  //       }
  //     }
  //   }
  // }

}
