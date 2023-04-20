import { Component, isDevMode, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { emailDomainWhiteList } from 'app/utils/util';


@Component({
  selector: 'appdashboard-activate-appsumo-product',
  templateUrl: './activate-appsumo-product.component.html',
  styleUrls: ['./activate-appsumo-product.component.scss']
})
export class ActivateAppsumoProductComponent implements OnInit {
  public user: any;
  public projects: Project[];
  public projectname: string;
  public selectedProjectId: string;
  public new_project: any;
  public companyLogoBlack_Url: string;
  public tparams: any;
  public company_name: any;
  public company_site_url: any;
  public appSumoActivationEmail: string;
  public appSumoPlanId: string;
  public appSumoProductKey: string;
  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private logger: LoggerService,
    public brandService: BrandService,
  ) {
    const brand = brandService.getBrand();
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
  }

  ngOnInit(): void {
    this.getRouteParams()
    // this.getProjects();
    this.createNewProject()
  }


  getRouteParams() {
    this.route.params.subscribe((params) => {
      console.log('[ACTIVATE-APPSUMO-PRODUCT] GET ROUTE PARAMS > params', params);
      this.appSumoActivationEmail = params.activation_email
      this.appSumoPlanId = params.plan_id;
      this.appSumoProductKey = params.licenseproductkeyuuid;
    });
  }

  getLoggedUser() {
    this.auth.user_bs
      .subscribe((user) => {
        if (user) {
          this.user = user;
          // this.logger.log('[GET START CHATBOT FORK]  - user ', this.user)
        }
      });
  }



  createNewProject() {
    console.log()
    let projectName = ''
    const email = this.appSumoActivationEmail
    if (email.includes('@')) {
      const emailAfterAt = email.split('@')[1];
      if (!emailDomainWhiteList.includes(emailAfterAt)) {
        if (emailAfterAt.includes('.'))
          projectName = emailAfterAt.split('.')[0]
        else if (!emailAfterAt.includes('.')) {
          projectName = emailAfterAt
        }
      } else {
        projectName = 'My awesome project'
      }
    } else {
      projectName = 'My awesome project'
    }

    console.log('[ACTIVATE-APPSUMO-PRODUCT] CREATE NEW PROJECT - PROJECT-NAME  ', projectName);

    this.projectService.createProject(projectName)
      .subscribe((project) => {
        this.logger.log('[SIGN-UP] POST DATA PROJECT RESPONSE ', project);
        if (project) {
          this.new_project = project
          // WHEN THE USER SELECT A PROJECT ITS ID IS SEND IN THE PROJECT SERVICE THET PUBLISHES IT
          // THE SIDEBAR SIGNS UP FOR ITS PUBLICATION
          const newproject: Project = {
            _id: project['_id'],
            name: project['name'],
            operatingHours: project['activeOperatingHours'],
            profile_type: project['profile'].type,
            profile_name: project['profile'].name,
            trial_expired: project['trialExpired']
          }

          // SENT THE NEW PROJECT TO THE AUTH SERVICE THAT PUBLISH
          this.auth.projectSelected(newproject)
          console.log('[ACTIVATE-APPSUMO-PRODUCT] CREATED PROJECT ', newproject)
        }


      }, (error) => {
        // this.DISPLAY_SPINNER = false;
        this.logger.error('[ACTIVATE-APPSUMO-PRODUCT] CREATE NEW PROJECT - POST REQUEST - ERROR ', error);

      }, () => {
        this.logger.log('[ACTIVATE-APPSUMO-PRODUCT]CREATE NEW PROJECT - POST REQUEST * COMPLETE *');
        this.updateProject()

        this.projectService.newProjectCreated(true);



        if (!isDevMode()) {
          if (window['analytics']) {
            try {
              window['analytics'].page("Activate AppSumo product, Create project", {

              });
            } catch (err) {
              this.logger.error('Activate AppSumo product page error', err);
            }

            try {
              window['analytics'].identify(this.user._id, {
                name: this.user.firstname + ' ' + this.user.lastname,
                email: this.user.email,
                logins: 5,
                plan: "Pro (trial)"
              });
            } catch (err) {
              this.logger.error('Activate AppSumo product identify error', err);
            }

            try {
              window['analytics'].group(this.new_project._id, {
                name: this.new_project.name,
                plan: "Pro (trial)",
              });
            } catch (err) {
              this.logger.error('Activate AppSumo product group error', err);
            }
          }
        }


        // 'getProjectsAndSaveInStorage()' was called only on the onInit lifehook, now recalling also after the creation 
        // of the new project resolve the bug  'the auth service not find the project in the storage'
        this.getProjectsAndSaveInStorage();

      });
  }

  updateProject() {
    this.projectService.updateAppSumoProject(this.new_project._id, this.appSumoActivationEmail, this.appSumoProductKey, this.appSumoPlanId).subscribe((updatedproject) => {
      console.log('[ACTIVATE-APPSUMO-PRODUCT] UPDATE THE NEW PROJECT - RES ', updatedproject);
    }, (error) => {

      console.error('[ACTIVATE-APPSUMO-PRODUCT] UPDATE THE NEW PROJECT - ERROR ', error);

    }, () => {
      console.log('[ACTIVATE-APPSUMO-PRODUCT] UPDATE THE NEW PROJECT * COMPLETE * ');
    })
  }


  getProjectsAndSaveInStorage() {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[SIGN-UP] !!! getProjectsAndSaveInStorage PROJECTS ', projects);

      if (projects) {
        // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
        // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
        // AND THEN PUBLISH PROJECT ID AND PROJECT NAME
        projects.forEach(project => {
          this.logger.log('[SIGN-UP] !!! getProjectsAndSaveInStorage SET PROJECT IN STORAGE')
          if (project.id_project) {
            const prjct: Project = {
              _id: project.id_project._id,
              name: project.id_project.name,
              role: project.role,
              operatingHours: project.id_project.activeOperatingHours
            }

            localStorage.setItem(project.id_project._id, JSON.stringify(prjct));
          }
        });
      }
    }, error => {
      this.logger.error('[SIGN-UP] getProjectsAndSaveInStorage - ERROR ', error)
    }, () => {
      this.logger.log('[SIGN-UP] getProjectsAndSaveInStorage - COMPLETE')
    });
  }
  goToHome() {
    this.router.navigate([`/project/${this.new_project._id}/home`]);
  }
}


