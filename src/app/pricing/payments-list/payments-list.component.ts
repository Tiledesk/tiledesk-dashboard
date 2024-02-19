// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { ProjectService } from '../../services/project.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'appdashboard-payments-list',
  templateUrl: './payments-list.component.html',
  styleUrls: ['./payments-list.component.scss']
})
// , OnDestroy
export class PaymentsListComponent implements OnInit {
  subscription_payments: any;
  showSpinner = true;
  subscription: Subscription;
  isChromeVerGreaterThan100: boolean
  constructor(
    private auth: AuthService,
    private prjctPlanService: ProjectPlanService,
    private prjctService: ProjectService,
    public location: Location,
    private logger: LoggerService,
    private translate: TranslateService,

  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getProjectPlan();
    this.getBrowserVersion();
    // this.getLanguage()
  }

  getLanguage() {
    const browserLang = this.translate.getBrowserLang();
    if (this.auth.user_bs && this.auth.user_bs.value) { 

      const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
      this.logger.log('[PRICING - PAYMENT-LIST] stored_preferred_lang', stored_preferred_lang)
      let dshbrd_lang = ''
      if (browserLang && !stored_preferred_lang) {
          dshbrd_lang = browserLang
          this.logger.log('[PRICING - PAYMENT-LIST] dshbrd_lang', dshbrd_lang)
      } else if (browserLang && stored_preferred_lang) {
          dshbrd_lang = stored_preferred_lang
          this.logger.log('[PRICING - PAYMENT-LIST] dshbrd_lang', dshbrd_lang)
      }
    }
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
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

  // ngOnDestroy() {
  //   if (this.subscription) {
  //     this.subscription.unsubscribe();
  //   }
  // }

  getSubscriptionPayments(subscription_id) {
    this.prjctService.getSubscriptionPayments(subscription_id).subscribe((subscriptionPayments: any) => {
      this.logger.log('[PRICING - PAYMENT-LIST] get subscriptionPayments ', subscriptionPayments);

      if (subscriptionPayments) {
        this.subscription_payments = [];
        subscriptionPayments.forEach(subscriptionPayment => {
          this.logger.log('[PRICING - PAYMENT-LIST] get subscriptionPayment ', subscriptionPayment);
          this.logger.log('[PRICING - PAYMENT-LIST] get subscriptionPayment.stripe_event ', subscriptionPayment.stripe_event);



          // && subscriptionPayment.stripe_event !== 'customer.subscription.deleted' && subscriptionPayment.stripe_event !== 'customer.subscription.updated'

          if (subscriptionPayment.stripe_event === 'invoice.payment_succeeded') {

            var i = 0;
            subscriptionPayment.object.data.object.lines.data.forEach((line, index) => {
              this.logger.log('[PRICING - PAYMENT-LIST] subscriptionPayment ', index, ' line ', line)
              i++

            });
            this.logger.log('[PRICING - PAYMENT-LIST] subscriptionPayment i ', i)

            if (i > 1) {
              subscriptionPayment.has_detail = true
            }

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

  // $(function(){
  //   $(".fold-table tr.view").on("click", function(){
  //     $(this).toggleClass("open").next(".fold").toggleClass("open");
  //   });
  // });

  toggle(event_id) {
    this.logger.log('[PRICING - PAYMENT-LIST] toggle event_id', event_id);
    let elemtr_viewv: any;
    elemtr_viewv = <HTMLElement>document.querySelector('.fold-table  tr' + '#view_' + event_id);
    this.logger.log('[PRICING - PAYMENT-LIST] toggle elemtr_viewv', elemtr_viewv);
    // elemtr_viewv.classList.toggle("open").nextElementSibling.
    elemtr_viewv.classList.toggle("open")

    const foldTrElem = <HTMLElement>document.querySelector('#fold_' + event_id);
    this.logger.log('[PRICING - PAYMENT-LIST] toggle foldTrElem', foldTrElem);
    foldTrElem.classList.toggle("open");

    // const iconElem = <HTMLElement>document.querySelector('#icon_' + event_id);
    // this.logger.log('[PRICING - PAYMENT-LIST] toggle iconElem', iconElem);
    // iconElem.classList.toggle("open");

    const btnDwnloadElem = <HTMLElement>document.querySelector('#btn_dwnload_' + event_id);
    this.logger.log('[PRICING - PAYMENT-LIST] toggle btnDwnloadElem', btnDwnloadElem);
    btnDwnloadElem.classList.toggle("open");

    const btnOpenInNewTabElem = <HTMLElement>document.querySelector('#btn_openinnew_' + event_id);
    this.logger.log('[PRICING - PAYMENT-LIST] toggle btnDwnloadElem', btnOpenInNewTabElem);
    btnOpenInNewTabElem.classList.toggle("open");

    // .next(".fold").toggleClass("open");
    // .nextElementSibling(".fold").toggleClass("open");
  }

  viewRecepit(url) {
    this.logger.log('[PRICING - PAYMENT-LIST] viewRecepit', url);
    window.open(url, '_blank');
  }

  viewInvoice(url) {
    this.logger.log('[PRICING - PAYMENT-LIST] viewInvoice', url);
    window.location.assign(url);
  }

  goBack() {
    this.location.back();
  }

}
