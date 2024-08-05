import { AfterViewInit, Component, isDevMode, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project-model';

@Component({
  selector: 'appdashboard-payment-success-page',
  templateUrl: './payment-success-page.component.html',
  styleUrls: ['./payment-success-page.component.scss']
})
export class PaymentSuccessPageComponent implements OnInit, AfterViewInit {
  private unsubscribe$: Subject<any> = new Subject<any>();

  contact_us_email: string;
  contactSalesEmail: string;
  id_project: string;
  currentUser: any;

  user_id: string;
  project_id: string;
  plan_name: string;

  constructor(
    private router: Router,
    private auth: AuthService,
    public brandService: BrandService,
    private logger: LoggerService,
    private prjctPlanService: ProjectPlanService,
    private route: ActivatedRoute,
    public projectService: ProjectService,
  ) {
    const brand = brandService.getBrand();
    this.contact_us_email = brand['CONTACT_US_EMAIL'];
    this.contactSalesEmail = brand['CONTACT_SALES_EMAIL'];
  }

  ngOnInit() {
    // this.logger.log('[PRICING - PAYMENT-SUCCESS] HI !!! ');
    this.route.queryParams
      .subscribe(params => {
        //  this.logger.log('[PRICING - PAYMENT-SUCCESS] GET QUERY PARAMS - params ', params);
        if (params.session_id) {
          this.getSubriscriptionSessionById(params.session_id)
        }

        // this.logger.log('[GET START CHATBOT FORK] GET QUERY PARAMS - templateNameOnSite ', this.templateNameOnSite);
      });

    this.getCurrentProjectAndCurrentUser();

  }

  ngAfterViewInit() {
    // this.getProjectPlan()
  }


  getSubriscriptionSessionById(session_id) {

    // const res =  {
    //     "id": "cs_test_b1qSy08z2qTAthZymdP6rB8GuZct00VKchZg6pWDBA8z6R2JqO4VtbJFAO",
    //     "object": "checkout.session",
    //     "after_expiration": null,
    //     "allow_promotion_codes": true,
    //     "amount_subtotal": 300,
    //     "amount_total": 300,
    //     "automatic_tax": {
    //         "enabled": true,
    //         "status": "complete"
    //     },
    //     "billing_address_collection": "required",
    //     "cancel_url": "https://stripe.com",
    //     "client_reference_id": "642bf4ee464edc002ce45c21_642d44dea1ca61002c296069_Growth",
    //     "consent": null,
    //     "consent_collection": {
    //         "promotions": "none",
    //         "terms_of_service": "none"
    //     },
    //     "created": 1680699195,
    //     "currency": "eur",
    //     "currency_conversion": null,
    //     "custom_fields": [],
    //     "custom_text": {
    //         "shipping_address": null,
    //         "submit": null
    //     },
    //     "customer": "cus_NepVoYz6ADQVKY",
    //     "customer_creation": "if_required",
    //     "customer_details": {
    //         "address": {
    //             "city": "Napoli",
    //             "country": "IT",
    //             "line1": "Via Alcide de Gasperi",
    //             "line2": null,
    //             "postal_code": "80133",
    //             "state": "NA"
    //         },
    //         "email": "growth12@growthplan.com",
    //         "name": "Growth 12",
    //         "phone": null,
    //         "tax_exempt": "none",
    //         "tax_ids": []
    //     },
    //     "customer_email": null,
    //     "expires_at": 1680785595,
    //     "invoice": "in_1MtVqfD1JyUWkzR9q6SlJAt2",
    //     "invoice_creation": null,
    //     "livemode": false,
    //     "locale": "auto",
    //     "metadata": {
    //         "seats": "4"
    //     },
    //     "mode": "subscription",
    //     "payment_intent": null,
    //     "payment_link": "plink_1MjKGoD1JyUWkzR9Zi2PUsYb",
    //     "payment_method_collection": "always",
    //     "payment_method_options": null,
    //     "payment_method_types": [
    //         "card"
    //     ],
    //     "payment_status": "paid",
    //     "phone_number_collection": {
    //         "enabled": false
    //     },
    //     "recovered_from": null,
    //     "setup_intent": null,
    //     "shipping_address_collection": null,
    //     "shipping_cost": null,
    //     "shipping_details": null,
    //     "shipping_options": [],
    //     "status": "complete",
    //     "submit_type": "auto",
    //     "subscription": "sub_1MtVqfD1JyUWkzR9DaEuban1",
    //     "success_url": "https://stripe.com",
    //     "tax_id_collection": {
    //         "enabled": true
    //     },
    //     "total_details": {
    //         "amount_discount": 0,
    //         "amount_shipping": 0,
    //         "amount_tax": 0
    //     },
    //     "url": null
    // }



    this.projectService.getStripeSessionById(session_id).subscribe((res: any) => {
      // this.logger.log('[PRICING - PAYMENT-SUCCESS] - GET STRIPE SESSION BY ID res ', res)
      const clientReferenceId = res.client_reference_id
      // this.logger.log('[PRICING - PAYMENT-SUCCESS] clientReferenceId ', clientReferenceId)

      this.user_id = clientReferenceId.split("_")[0];
      // this.logger.log('[PRICING - PAYMENT-SUCCESS] stripe user_id:' + this.user_id);

      this.project_id = clientReferenceId.split("_")[1];
      // this.logger.log('[PRICING - PAYMENT-SUCCESS] stripe project_id: ' + this.project_id);

      this.findCurrentProjectAmongAll(this.project_id)

      this.plan_name = clientReferenceId.split("_")[2];
      // this.logger.log('[PRICING - PAYMENT-SUCCESS] stripe plan_name: ' + this.plan_name);

      // if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page(`Ugrade plane Success page`, {});
        } catch (err) {
          this.logger.error('page Home error', err);
        }
      }
      // }


    }, (error) => {
      this.logger.error('[PRICING - PAYMENT-SUCCESS] - GET STRIPE SESSION BY ID error ', error);
    }, () => {
      // this.logger.log('[PRICING - PAYMENT-SUCCESS] - GET STRIPE SESSION BY ID  * COMPLETE *');
    });
  }



  findCurrentProjectAmongAll(projectId: string) {
    this.projectService.getProjects().subscribe((projects: any) => {
      const current_prjct = projects.find(prj => prj.id_project.id === projectId);
       this.logger.log('[PRICING - PAYMENT-SUCCESS] - FIND CURRENT PROJECT AMONG ALL - current_prjct ', current_prjct);

      const project: Project = {
        _id: current_prjct.id_project.id,
        name: current_prjct.id_project.name,
        profile_name: current_prjct.id_project.profile.name,
        trial_expired: current_prjct.id_project.trialExpired,
        trial_days_left: current_prjct.id_project.trialDaysLeft,
        operatingHours: current_prjct.id_project.activeOperatingHours
      }
      this.auth.projectSelected(project, 'payment-succcess-page')

      if (!isDevMode()) {
        if (window['analytics']) {
          try {
            window['analytics'].group(current_prjct.id_project.id, {
              name: current_prjct.id_project.name,
              plan: this.plan_name,
            });
          } catch (err) {
            this.logger.error('[PRICING - PAYMENT-SUCCESS analytics group error', err);
          }
        }
      }

    }, error => {
      this.logger.error('[PRICING - PAYMENT-SUCCESS] - FIND CURRENT PROJECT AMONG ALL - ERROR ', error);
    }, () => {
      this.logger.log('[PRICING - PAYMENT-SUCCESS] - FIND CURRENT PROJECT AMONG ALL -  * complete ');

    })
  }

  getCurrentProjectAndCurrentUser() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id;
        this.updateProject( this.id_project , project.name) 
        this.logger.log('[PRICING - PAYMENT-SUCCESS] - CurrentProject ID ', this.id_project)
        this.prjctPlanService.planUpdated(this.id_project)
      }
    });

    this.auth.user_bs.subscribe((user) => {
      // this.logger.log('[ActivitiesComponent] - LoggedUser ', user);
      if (user) {
        this.currentUser = user

        this.logger.log('[PRICING - PAYMENT-SUCCESS] currentUser email ', this.currentUser.email)

        window['rewardful']('ready', () => {
          // this.logger.log('[PRICING - PAYMENT-SUCCESS] Rewardful Ready!')
          // this.logger.log('[PRICING - PAYMENT-SUCCESS] window.rewardful.referral', window['rewardful'].referral )
          // this.logger.log('[PRICING - PAYMENT-SUCCESS] window.rewardful.campaign', window['rewardful'].campaign )
       
          window['rewardful']('convert', { email: this.currentUser.email })
          
        });

        if (!isDevMode()) {
          if (window['analytics']) {
            let userFullname = ''
            if (this.currentUser.firstname && this.currentUser.lastname)  {
              userFullname = this.currentUser.firstname + ' ' + this.currentUser.lastname
            } else if (this.currentUser.firstname && !this.currentUser.lastname) {
              userFullname = this.currentUser.firstname
            }

            try {
              window['analytics'].identify(this.currentUser._id, {
                name: userFullname,
                email: this.currentUser.user.email,
                logins: 5,
              });
            } catch (err) {
              this.logger.error('[PRICING - PAYMENT-SUCCESS]  identify user event error', err);
            }
          }
        }
      }
    });

  }

  updateProject(projectid, projectname) {
    this.logger.log('[PRICING - PAYMENT-SUCCESS] - PROJECT ID ', projectid);
    this.logger.log('[PRICING - PAYMENT-SUCCESS] - PROJECT NAME  ', projectname);

    this.projectService.updateProjectName(this.id_project, projectname)
      .subscribe((prjct: Project) => {
        this.logger.log('[PRJCT-EDIT-ADD] - UPDATED PROJECT - RES ', prjct);


      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] UPDATE PROJECT - ERROR ', error);


      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] UPDATE PROJECT * COMPLETE *');
      

      });
  }


  goToHome() {
    this.router.navigate(['/project/' + this.project_id + '/home']);
  }

}
