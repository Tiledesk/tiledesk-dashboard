// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { ProjectService } from '../../services/project.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-payments-list',
  templateUrl: './payments-list.component.html',
  styleUrls: ['./payments-list.component.scss']
})
export class PaymentsListComponent implements OnInit, OnDestroy {
  subscription_payments: any;
  showSpinner = true;
  subscription: Subscription;
  constructor(
    private auth: AuthService,
    private prjctPlanService: ProjectPlanService,
    private prjctService: ProjectService,
    public location: Location,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getProjectPlan();
  }


  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[PRICING - PAYMENT-LIST] getProjectPlan project Profile Data', projectProfileData)

      if (projectProfileData && projectProfileData.subscription_id) {
        this.getSubscriptionPayments(projectProfileData.subscription_id)
      }
    }, error => {
    
      this.logger.error('[PRICING - PAYMENT-LIST] - getProjectPlan - ERROR', error);
    }, () => {
     
      this.logger.log('[PRICING - PAYMENT-LIST] - getProjectPlan * COMPLETE *')

    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getSubscriptionPayments(subscription_id) {
    this.prjctService.getSubscriptionPayments(subscription_id).subscribe((subscriptionPayments: any) => {
      this.logger.log('[PRICING - PAYMENT-LIST] get subscriptionPayments ', subscriptionPayments);

      if (subscriptionPayments) {
        this.subscription_payments = [];
        subscriptionPayments.forEach(subscriptionPayment => {
          this.logger.log('[PRICING - PAYMENT-LIST] subscriptionPayment.stripe_event ', subscriptionPayment.stripe_event);


          // && subscriptionPayment.stripe_event !== 'customer.subscription.deleted' && subscriptionPayment.stripe_event !== 'customer.subscription.updated'

          if (subscriptionPayment.stripe_event === 'invoice.payment_succeeded') {

            const plan_description = subscriptionPayment.object.data.object.lines.data[0].description;
            this.logger.log('[PRICING - PAYMENT-LIST] subscriptionPayment plan_description: ', plan_description);

            if (plan_description.indexOf('×') !== -1) {

              const planSubstring = plan_description.split('×').pop();

              this.logger.log('[PRICING - PAYMENT-LIST] subscriptionPayment planSubstring: ', planSubstring);

              if (plan_description.indexOf('(') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('('));
                this.logger.log('[PRICING - PAYMENT-LIST] subscriptionPayment planName: ', planName);

                subscriptionPayment.plan_name = planName.trim()
              }

              if (plan_description.indexOf('after') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('after'));
                this.logger.log('[PRICING - PAYMENT-LIST] subscriptionPayment planName: ', planName);

                subscriptionPayment.plan_name = planName.trim()
              }
            } else {
              subscriptionPayment.plan_name = plan_description
            }
            this.subscription_payments.push(subscriptionPayment);
          }
        });
        this.logger.log('[PRICING - PAYMENT-LIST] FILTERED subscriptionPayments ', this.subscription_payments);
      }
    }, (error) => {
      this.logger.error('[PRICING - PAYMENT-LIST] get subscriptionPayments error ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[PRICING - PAYMENT-LIST] get subscriptionPayments * COMPLETE * ');
      this.showSpinner = false;
    });
  }

  goBack() {
    this.location.back();
  }

}
