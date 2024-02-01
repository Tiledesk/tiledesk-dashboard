import { Component, isDevMode, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-handle-invitation',
  templateUrl: './handle-invitation.component.html',
  styleUrls: ['./handle-invitation.component.scss']
})
export class HandleInvitationComponent implements OnInit {
  user_firstname: string;
  user_lastname: string;
  projectName: string;
  pendingInvitationRole: string;
  pendingInvitationEmail: string;
  projectid: string;
  dshbrdBaseUrl: string;
  PENDING_INVITATION_NOT_FOUND: boolean;
  showSpinner: boolean;
  browser_lang: string;
  
  // tparams = brand;
 
  tparams:any;
  company_logo_45x45: any;

  constructor(
    
    private route: ActivatedRoute,
    public usersService: UsersService,
    public projectService: ProjectService,
    private router: Router,
    private translate: TranslateService,
    public brandService: BrandService,
    private logger: LoggerService
  ) { 
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.company_logo_45x45 = brand['handle_invitation_page']['company_logo_45x45'];
  }

  ngOnInit() {
    this.get_PendingUserById();
    this.getURLParameters();
    this.getBrowserLanguage();

    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Auth Page, Handle invitation", {

          });
        } catch (err) {
          this.logger.error('Auth Page, Handle invitation - error', err);
        }
  
      }
    }
  }

  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    this.logger.log('[HandleInvitationComponent] - browser_lang ', this.browser_lang)
  }


  getURLParameters() {
    this.projectName = this.route.snapshot.params['projectname'];
    this.user_firstname = this.route.snapshot.params['adminfirstname'];
    this.user_lastname = this.route.snapshot.params['adminsurname'];
    this.logger.log('[HandleInvitationComponent] GET URL PARAMS - projectName: ', this.projectName); 
    this.logger.log('[HandleInvitationComponent] GET URL PARAMS - user_firstname: ', this.user_firstname); 
    this.logger.log('[HandleInvitationComponent] GET URL PARAMS - user_lastname: ', this.user_lastname); 
  }

  get_PendingUserById() {
    this.showSpinner = true;
    const pendingInvitationId = this.route.snapshot.params['pendinginvitationid'];
    this.logger.log('[HandleInvitationComponent] GET PENDING INVITATION BY ID - pendingInvitationId: ', pendingInvitationId); 

    this.usersService.getPendingUsersById(pendingInvitationId).subscribe((pendinginvitation: any) => {
      this.logger.log('[HandleInvitationComponent] GET PENDING INVITATION BY ID - RES: ', pendinginvitation);

      if (pendinginvitation) {

        this.pendingInvitationRole = pendinginvitation.role;
        this.pendingInvitationEmail = pendinginvitation.email;

      }
    }, (error) => {
      this.logger.error('[HandleInvitationComponent] GET PENDING INVITATION BY ID * ERROR * ')
      this.showSpinner = false;
      if (error && error.status === 404) {
        this.PENDING_INVITATION_NOT_FOUND = true;
      }


      this.logger.log('[HandleInvitationComponent] GET PENDING INVITATION BY ID - ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      this.showSpinner = false;
      this.logger.log('[HandleInvitationComponent] GET PENDING INVITATION * COMPLETE *');
      this.PENDING_INVITATION_NOT_FOUND = false;
    });
  }

  goToProject() {
    this.router.navigate(['/project/' + this.projectid + '/home']);
  }

  goToSignupPage() {
    this.router.navigate(['/signup-on-invitation/' + this.pendingInvitationEmail]);
    try {
      window['analytics'].track('Handle invitation clicked button Go to Signup', {
        "type": "organic",
        "email": this.pendingInvitationEmail,
        "role": this.pendingInvitationRole
      });
    } catch (err) {
      this.logger.error('track signup event error', err);
    }

  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }


}
