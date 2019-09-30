// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { ProjectService } from '../../services/project.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
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
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getProjectPlan();
  }


  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (PaymentsListComponent) project Profile Data', projectProfileData)

      if (projectProfileData) {
        this.getSubscriptionPayments(projectProfileData.subscription_id)
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getSubscriptionPayments(subscription_id) {
    this.prjctService.getSubscriptionPayments(subscription_id).subscribe((subscriptionPayments: any) => {
      console.log('PaymentsListComponent get subscriptionPayments ', subscriptionPayments);

      if (subscriptionPayments) {
        this.subscription_payments = [];
        subscriptionPayments.forEach(subscriptionPayment => {
          console.log('PaymentsListComponent subscriptionPayment.stripe_event ', subscriptionPayment.stripe_event);


          // && subscriptionPayment.stripe_event !== 'customer.subscription.deleted' && subscriptionPayment.stripe_event !== 'customer.subscription.updated'

          if (subscriptionPayment.stripe_event === 'invoice.payment_succeeded') {

            const plan_description = subscriptionPayment.object.data.object.lines.data[0].description;
            console.log('PaymentsListComponent subscriptionPayment plan_description: ', plan_description);

            if (plan_description.indexOf('×') !== -1) {

              const planSubstring = plan_description.split('×').pop();

              console.log('PaymentsListComponent subscriptionPayment planSubstring: ', planSubstring);

              if (plan_description.indexOf('(') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('('));
                console.log('PaymentsListComponent subscriptionPayment planName: ', planName);

                subscriptionPayment.plan_name = planName.trim()
              }

              if (plan_description.indexOf('after') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('after'));
                console.log('PaymentsListComponent subscriptionPayment planName: ', planName);

                subscriptionPayment.plan_name = planName.trim()
              }
            } else {
              subscriptionPayment.plan_name = plan_description
            }
            this.subscription_payments.push(subscriptionPayment);
          }
        });
        console.log('PaymentsListComponent FILTERED subscriptionPayments ', this.subscription_payments);
      }
    }, (error) => {
      console.log('PaymentsListComponent get subscriptionPayments error ', error);
      this.showSpinner = false;
    }, () => {
      console.log('PaymentsListComponent get subscriptionPayments * COMPLETE * ');
      this.showSpinner = false;
    });
  }

  goBack() {
    this.location.back();
  }

}
