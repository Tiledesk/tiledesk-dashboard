import { AfterViewInit, Component, isDevMode, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectPlanService } from 'app/services/project-plan.service';
import moment from 'moment';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';


@Component({
  selector: 'appdashboard-payment-success-page',
  templateUrl: './payment-success-page.component.html',
  styleUrls: ['./payment-success-page.component.scss']
})
export class PaymentSuccessPageComponent implements OnInit, AfterViewInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  // contact_us_email = brand.contact_us_email;
  contact_us_email: string;
  id_project: string;
  currentUser: any;
  constructor(
    private router: Router,
    private auth: AuthService,
    public brandService: BrandService,
    private logger: LoggerService,
    private prjctPlanService: ProjectPlanService
  ) {
    const brand = brandService.getBrand();
    this.contact_us_email = brand['contact_us_email'];
  }

  ngOnInit() {
    this.getCurrentProjectAndCurrentUser();
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Plan updated, Success", {});
        } catch (err) {
          this.logger.error('page Home error', err);
        }
      }
    }
  }

  ngAfterViewInit() {
    // this.getProjectPlan()
  }



  getCurrentProjectAndCurrentUser() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        this.logger.log('[PRICING - PAYMENT-SUCCESS] - CurrentProject ID ', this.id_project)
        this.prjctPlanService.planUpdated(this.id_project)
      }
    });

    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[ActivitiesComponent] - LoggedUser ', user);
      if (user) {
        this.currentUser = user
      }
    });

  }


  goToHome() {
    this.router.navigate(['/project/' + this.id_project + '/home']);
  }

}
