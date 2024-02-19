import { Component, OnInit } from '@angular/core';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { APPSUMO_PLAN_SEATS, APP_SUMO_PLAN_NAME, CHATBOT_MAX_NUM, KB_MAX_NUM, PLAN_NAME, PLAN_SEATS } from 'app/utils/util';

@Component({
  selector: 'appdashboard-pricing-base',
  template: `
    <p>
      pricing-base works!
    </p>
  `,
  styles: [
  ]
})
export class PricingBaseComponent implements OnInit {
  PLAN_NAME = PLAN_NAME;
  PLAN_SEATS = PLAN_SEATS;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  APPSUMO_PLAN_SEATS = APPSUMO_PLAN_SEATS;
  CHATBOT_MAX_NUM = CHATBOT_MAX_NUM;
  KB_MAX_NUM = KB_MAX_NUM


  USER_ROLE: string;

  prjct_id: string;
  prjct_name: string;
  appSumoProfile: string;
  projectPlanAgentsNo: number;
  prjct_profile_type: string;
  subscription_is_active: boolean;
  subscription_end_date: any;
  subscription_id: string;
  profile_name: string;
  trial_expired: any;
  prjct_profile_name: string;
  appSumoProfilefeatureAvailableFromBPlan: string;
  projectProfileData: any;
  dispayBadgeAvaibleFromInAppStore: boolean;
  profile_name_for_segment: string;
  areActivePay: boolean;

  // Plan limit
  public seatsLimit: any;
  public chatBotLimit: any;
  public kbLimit: any;

  // Translations params
  public tParamsFreePlanSeatsNum: any;
  public tParamsPlanAndSeats: any;
  public tParamsPlanAndChatBot: any;
  public tParamsPlanAndKb: any;
  public tParamsPlanNameTrialExpired: any;
  public tParamsHoursAvailableFromPlan: any;
  public tParamsActivitiesFromPlan: any;
  public tParamsCRMAvailableFromPlan: any;
  public tParamsMonitorAvailableFromPlan: any;
  public tParamsEmailTicketingFromPlan: any;
  public tParamsCannedAvailableFromPlan: any;
  public tParamsAvailableFromTier2: any; // i.e. Scale or Premium
  public tParamsAvailableFromAppSumoTier3: any;
  public tprojectprofilemane: any;

  constructor(
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
  ) {

  }

  ngOnInit(): void {
  }

  getProjectPlan() {
    this.prjctPlanService.projectPlan$.subscribe(
      (projectProfileData: any) => {
        // console.log('[P-BASE] - GET PROJECT PLAN - RES ', projectProfileData)
        if (projectProfileData) {
          this.projectProfileData = projectProfileData
          this.prjct_id = projectProfileData._id
          // console.log('[P-BASE] - GET PROJECT PROFILE - prjct_id ', this.prjct_id);

          this.prjct_name = projectProfileData.name
          // console.log('[P-BASE] - GET PROJECT PROFILE - prjct_name ', this.prjct_name);

          this.projectPlanAgentsNo = projectProfileData.profile_agents;
          // console.log('[P-BASE] - GET PROJECT PROFILE - projectPlanAgentsNo ', this.projectPlanAgentsNo);

          this.subscription_is_active = projectProfileData.subscription_is_active;
          // console.log('[P-BASE] - GET PROJECT PROFILE - subscription_is_active ', this.subscription_is_active);

          this.subscription_end_date = projectProfileData.subscription_end_date;
          // console.log('[P-BASE] - GET PROJECT PROFILE - subscription_end_date ', this.subscription_end_date);

          this.prjct_profile_type = projectProfileData.profile_type;
          // console.log('[P-BASE] - GET PROJECT PROFILE - prjct_profile_type ', this.prjct_profile_type);

          this.profile_name = projectProfileData.profile_name;
          // console.log('[P-BASE] - GET PROJECT PROFILE - profile_name ', this.profile_name);

          this.subscription_id = projectProfileData.subscription_id;
          // console.log('[P-BASE] - GET PROJECT PROFILE - subscription_id ', this.subscription_id);

          this.USER_ROLE = projectProfileData.user_role
          // console.log('[P-BASE] - GET PROJECT PROFILE - USER_ROLE ', this.USER_ROLE);

          this.trial_expired = projectProfileData.trial_expired;
          // console.log('[P-BASE]  - GET PROJECT PROFILE - trial_expired ', this.trial_expired);

          this.areActivePay = projectProfileData.payActive
          // console.log('[P-BASE]  - GET PROJECT PROFILE - areActivePay ', this.areActivePay);

          if (projectProfileData && projectProfileData.extra3) {
            // console.log('[P-BASE] Find Current Project Among All extra3 ', projectProfileData.extra3)
            this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3],
              this.appSumoProfilefeatureAvailableFromBPlan = APP_SUMO_PLAN_NAME['tiledesk_tier3']
            // console.log('[P-BASE] Find Current Project appSumoProfile ', this.appSumoProfile)
            this.tParamsAvailableFromAppSumoTier3 = { plan_name: this.appSumoProfilefeatureAvailableFromBPlan }
            if (projectProfileData.extra3 === 'tiledesk_tier1' || projectProfileData.extra3 === 'tiledesk_tier2') {
              this.tParamsAvailableFromTier2 = { plan_name: this.appSumoProfilefeatureAvailableFromBPlan }
            }
          }

          if (projectProfileData.profile_type === 'free') {
            if (projectProfileData.trial_expired === false) {

              // ------------------------------------------------------------------------ 
              // USECASE: Free Plan (TRIAL ACTIVE i.e. Scale trial)
              // ------------------------------------------------------------------------
              if (this.profile_name === 'free') {

                this.prjct_profile_name = PLAN_NAME.B + " plan (trial)"
                this.profile_name_for_segment = this.prjct_profile_name
                if (this.areActivePay === true) {
                  // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' TRIAL IS EXPIRED: ', projectProfileData.trial_expired)
                  // Seats limit
                  this.seatsLimit = PLAN_SEATS[PLAN_NAME.B]
                  this.tParamsPlanAndSeats = { plan_name: this.prjct_profile_name, allowed_seats_num: this.seatsLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                  // Chatbot limit
                  this.chatBotLimit = null
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit)

                  // KB limit
                  this.kbLimit = 3
                  // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit)

                  // Translate params
                  this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                  this.tParamsPlanNameTrialExpired = { plan_name: PLAN_NAME.B }

                  this.dispayBadgeAvaibleFromInAppStore = false;

                } else if (this.areActivePay === false) {
                  // console.log('[P-BASE] HERE YES plan areActivePay ' , this.areActivePay, ' prjct_profile_name ',  this.prjct_profile_name, ' TRIAL IS EXPIRED: ', this.trial_expired)
                  this.chatBotLimit = 1000
                  this.seatsLimit = 1000;
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit)
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)
                }

                // ------------------------------------------------------------------------
                // USECASE: Sandbox Plan (new FREE PLAN - TRIAL ACTIVE i.e. Premium trial)
                // ------------------------------------------------------------------------
              } else if (this.profile_name === 'Sandbox') {
                this.prjct_profile_name = PLAN_NAME.E + " plan (trial)"
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' TRIAL IS EXPIRED: ', this.trial_expired)
                this.profile_name_for_segment = this.prjct_profile_name
                if (this.areActivePay === true) {
                  // Seats limit
                  this.seatsLimit = PLAN_SEATS[PLAN_NAME.E]
                  // this.seatsLimit = projectProfileData.profile_agents
                  this.tParamsPlanAndSeats = { plan_name: this.prjct_profile_name, allowed_seats_num: this.seatsLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                  // Chatbot limit
                  this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.E]
                  this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit)

                  // Kb Limit
                  this.kbLimit = KB_MAX_NUM[PLAN_NAME.E]
                  this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit)

                  // Translate params 
                  this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                  this.tParamsPlanNameTrialExpired = { plan_name: PLAN_NAME.E }

                  this.dispayBadgeAvaibleFromInAppStore = false;
                } else if (this.areActivePay === false) {
                  // console.log('[P-BASE] HERE YES plan areActivePay ' , this.areActivePay, ' prjct_profile_name ',  this.prjct_profile_name, ' TRIAL IS EXPIRED: ', this.trial_expired)
                  this.chatBotLimit = 1000
                  this.seatsLimit = 1000;
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit)
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)
                }
              }
            } else {
              // ------------------------------------------------------------------------
              // USECASE: Free Plan (TRIAL EXPIRED)
              // ------------------------------------------------------------------------
              if (this.profile_name === 'free') {
                this.prjct_profile_name = "Free plan";

                if (this.areActivePay === true) {
                  // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' TRIAL IS EXPIRED: ', this.trial_expired)
                  this.profile_name_for_segment = this.prjct_profile_name

                  // Seats limit
                  this.seatsLimit = PLAN_SEATS.free
                  this.tParamsPlanAndSeats = { plan_name: 'Free', allowed_seats_num: this.seatsLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                  // Chatbot limit
                  // this.chatBotLimit = null;
                  this.chatBotLimit = CHATBOT_MAX_NUM.free;
                  this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit)

                  // KB limit
                  // this.kbLimit = 3;
                  this.kbLimit = KB_MAX_NUM.free;
                  this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit)
                  
                  // --------------------------------------------------------------------------------
                  // @ Translate params for static page (Upgrade plan names reference old plan names)
                  // --------------------------------------------------------------------------------
                  this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.A }
                  this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.A }
                  this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.A }
                  this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.A }
                  this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.A }
                 

                  // --------------------------------------------------------------------------------
                  // @ Translate params for static page (Upgrade plan names reference new plan names)
                  // --------------------------------------------------------------------------------
                  // this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.D }
                  // this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.D }
                  // this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.D}
                  // this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.D }
                  // this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.D }

                  this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.B }
                  this.tParamsPlanNameTrialExpired = { plan_name: PLAN_NAME.B }
                  this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                  

                  this.dispayBadgeAvaibleFromInAppStore = true;
                } else if (this.areActivePay === false) {
                  // console.log('[P-BASE] HERE YES plan areActivePay ' , this.areActivePay, ' prjct_profile_name ',  this.prjct_profile_name, ' TRIAL IS EXPIRED: ', this.trial_expired)
                  this.chatBotLimit = 1000
                  this.seatsLimit = 1000;
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit)
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)
                }
                // ------------------------------------------------------------------------
                // USECASE: Sandbox Plan (TRIAL EXPIRED)
                // ------------------------------------------------------------------------
              } else if (this.profile_name === 'Sandbox') {
                this.prjct_profile_name = "Sandbox plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' TRIAL IS EXPIRED: ', this.trial_expired)
                this.profile_name_for_segment = this.prjct_profile_name;
                if (this.areActivePay === true) {
                  // Seats limit
                  this.seatsLimit = PLAN_SEATS.free
                  this.tParamsPlanAndSeats = { plan_name: 'Sandbox', allowed_seats_num: this.seatsLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                  // Chatbot limit
                  this.chatBotLimit = CHATBOT_MAX_NUM.free;
                  this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit)

                  // KB limit
                  this.kbLimit = KB_MAX_NUM.free;
                  this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit)
                  // --------------------------------------------------------------------------------
                  // @ Translate params for static page
                  // --------------------------------------------------------------------------------
                  this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.D }
                  this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.D }
                  this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.D }
                  this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.D }
                  this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.E }
                  this.tParamsPlanNameTrialExpired = { plan_name: PLAN_NAME.E }
                  this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.E }
                  this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                  this.dispayBadgeAvaibleFromInAppStore = true;
                } else if (this.areActivePay === false) {
                  // console.log('[P-BASE] HERE YES plan areActivePay ' , this.areActivePay, ' prjct_profile_name ',  this.prjct_profile_name, ' TRIAL IS EXPIRED: ', this.trial_expired)
                  this.chatBotLimit = 1000
                  this.seatsLimit = 1000;
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit)
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)
                }
              }
            }
          } else if (projectProfileData.profile_type === 'payment') {

            if (this.subscription_is_active === true) {

              if (this.profile_name === PLAN_NAME.A) {
                // ------------------------------------------------------------------------
                // USECASE: Growth Plan (SUB ACTIVE)
                // ------------------------------------------------------------------------
                if (!this.appSumoProfile) {
                  this.prjct_profile_name = PLAN_NAME.A + " plan";
                  // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                  this.profile_name_for_segment = this.prjct_profile_name;
                  this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                  // Seats limit
                  this.seatsLimit = PLAN_SEATS[PLAN_NAME.A]
                  this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.A, allowed_seats_num: this.seatsLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                  // Chatbot limit
                  this.chatBotLimit = null;
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                  // KB limit
                  this.kbLimit = 3;
                  this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit };
                  // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                  // Translate params for static page
                  this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                  this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.B }

                  this.dispayBadgeAvaibleFromInAppStore = true;
                } else {
                  // ------------------------------------------------------------------------
                  // USECASE: Growth Plan AppSumo (SUB ACTIVE)
                  // ------------------------------------------------------------------------
                  this.prjct_profile_name = PLAN_NAME.A + " plan " + '(' + this.appSumoProfile + ')';
                  // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                  this.profile_name_for_segment = this.prjct_profile_name;
                  this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                  // Seats limit
                  this.seatsLimit = APPSUMO_PLAN_SEATS[projectProfileData.extra3];
                  this.tParamsPlanAndSeats = { plan_name: 'AppSumo ' + this.appSumoProfile, allowed_seats_num: this.seatsLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit);

                  // Chatbot limit
                  this.chatBotLimit = null;
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                  // KB limit
                  this.kbLimit = 3;
                  this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit };
                  // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                  // Translate params for static page
                  this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                }
              } else if (this.profile_name === PLAN_NAME.B) {
                // ------------------------------------------------------------------------
                // USECASE: Scale Plan (SUB ACTIVE)
                // ------------------------------------------------------------------------
                if (!this.appSumoProfile) {
                  this.prjct_profile_name = PLAN_NAME.B + " plan";
                  // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                  this.profile_name_for_segment = this.prjct_profile_name;
                  this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                  // Seats limit
                  this.seatsLimit = PLAN_SEATS[PLAN_NAME.B]
                  this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.B, allowed_seats_num: this.seatsLimit };
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit);

                  // Chatbot limit
                  this.chatBotLimit = null;
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                  // KB limit
                  this.kbLimit = 3;
                  this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit };
                  // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                  // Translate params for static page
                  this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }

                  this.dispayBadgeAvaibleFromInAppStore = false;
                } else {
                  // ------------------------------------------------------------------------
                  // USECASE: Scale Plan AppSumo (SUB ACTIVE)
                  // ------------------------------------------------------------------------
                  this.prjct_profile_name = PLAN_NAME.B + " plan " + '(' + this.appSumoProfile + ')';
                  // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                  this.profile_name_for_segment = this.prjct_profile_name;
                  this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                  // Seats limit
                  this.seatsLimit = APPSUMO_PLAN_SEATS[projectProfileData.extra3];
                  this.tParamsPlanAndSeats = { plan_name: 'AppSumo ' + this.appSumoProfile, allowed_seats_num: this.seatsLimit }
                  // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                  // Chatbot limit
                  this.chatBotLimit = null;
                  // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                  // KB limit
                  this.kbLimit = 3;
                  this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit };
                  // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                  // Translate params for static page
                  
                  this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                }
                // ------------------------------------------------------------------------
                // USECASE: Plus Plan (SUB ACTIVE)
                // ------------------------------------------------------------------------
              } else if (this.profile_name === PLAN_NAME.C) {
                this.prjct_profile_name = PLAN_NAME.C + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = projectProfileData.profile_agents
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.C, allowed_seats_num: this.seatsLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                // Chatbot limit
                this.chatBotLimit = null;
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                this.kbLimit = 3;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit };
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                this.dispayBadgeAvaibleFromInAppStore = false;
                // ------------------------------------------------------------------------
                // USECASE: Basic Plan (SUB ACTIVE) new for Growth Plan
                // ------------------------------------------------------------------------
              } else if (this.profile_name === PLAN_NAME.D) {
                this.prjct_profile_name = PLAN_NAME.D + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = projectProfileData.profile_agents
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.D, allowed_seats_num: this.seatsLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                // Chatbot limit
                this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.D]
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                this.kbLimit = KB_MAX_NUM[PLAN_NAME.D]
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);
                
                // --------------------------------------------------------------------------------
                // @ Translate params for static page
                // --------------------------------------------------------------------------------
                this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.E }
                this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.E }
                this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                this.dispayBadgeAvaibleFromInAppStore = true;

                // ------------------------------------------------------------------------
                // USECASE: Premium Plan (SUB ACTIVE) new for Scale Plan
                // ------------------------------------------------------------------------
              } else if (this.profile_name === PLAN_NAME.E) {
                this.prjct_profile_name = PLAN_NAME.E + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = projectProfileData.profile_agents;
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.E, allowed_seats_num: this.seatsLimit };
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit);

                // Chatbot limit
                this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.E]
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit };
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                this.kbLimit = KB_MAX_NUM[PLAN_NAME.E]
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                // Translate params for static page
                this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                this.dispayBadgeAvaibleFromInAppStore = false;
                // ------------------------------------------------------------------------
                // USECASE: Custom Plan (SUB ACTIVE) new for Plus Plan
                // ------------------------------------------------------------------------
              } else if (this.profile_name === PLAN_NAME.F) {
                this.prjct_profile_name = PLAN_NAME.F + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = projectProfileData.profile_agents;
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.F, allowed_seats_num: this.seatsLimit };
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit);

                // Chatbot limit CHATBOT_MAX_NUM[PLAN_NAME.F]
                this.chatBotLimit = null
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                this.kbLimit = KB_MAX_NUM[PLAN_NAME.F]
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);
                this.dispayBadgeAvaibleFromInAppStore = false;
              }

            } else if (this.subscription_is_active === false) {


              // ------------------------------------------------------------------------
              // USECASE: Growth Plan (SUB EXPIRED)
              // ------------------------------------------------------------------------
              if (this.profile_name === PLAN_NAME.A) {
                this.prjct_profile_name = PLAN_NAME.A + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.A, allowed_seats_num: this.seatsLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                // Chatbot limit
                // this.chatBotLimit = null;
                this.chatBotLimit = CHATBOT_MAX_NUM.free
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                // this.kbLimit = 3;
                this.kbLimit = KB_MAX_NUM.free
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);


                // --------------------------------------------------------------------------------
                // @ Translate params for static page (Upgrade plan names reference old plan names)
                // --------------------------------------------------------------------------------
                this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.A }

                // --------------------------------------------------------------------------------
                // @ Translate params for static page (Upgrade plan names reference new plan names)
                // --------------------------------------------------------------------------------
                // this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.D }

                this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.B }
                this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                this.dispayBadgeAvaibleFromInAppStore = true;
                // ------------------------------------------------------------------------
                // USECASE: Scale Plan (SUB EXPIRED)
                // ------------------------------------------------------------------------
              } else if (this.profile_name === PLAN_NAME.B) {
                this.prjct_profile_name = PLAN_NAME.B + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.B, allowed_seats_num: this.seatsLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                // Chatbot limit
                // this.chatBotLimit = null;
                this.chatBotLimit = CHATBOT_MAX_NUM.free
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                // this.kbLimit = 3;
                this.kbLimit = KB_MAX_NUM.free
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                // --------------------------------------------------------------------------------
                // @ Translate params for static page (Upgrade plan names reference old plan names)
                // --------------------------------------------------------------------------------
                this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.A }

                // --------------------------------------------------------------------------------
                // @ Translate params for static page (Upgrade plan names reference new plan names)
                // --------------------------------------------------------------------------------
                // this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.D }

                this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.B }
                this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                this.dispayBadgeAvaibleFromInAppStore = true;
                // ------------------------------------------------------------------------
                // USECASE: Plus Plan (SUB EXPIRED)
                // ------------------------------------------------------------------------
              } else if (this.profile_name === PLAN_NAME.C) {
                this.prjct_profile_name = PLAN_NAME.C + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active);
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.C, allowed_seats_num: this.seatsLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                // Chatbot limit
                // this.chatBotLimit = null;
                this.chatBotLimit = CHATBOT_MAX_NUM.free;
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                // this.kbLimit = 3;
                this.kbLimit = KB_MAX_NUM.free
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                // --------------------------------------------------------------------------------
                // @ Translate params for static page (Upgrade plan names reference old plan names)
                // --------------------------------------------------------------------------------
                this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.A }
                this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.A }


                // --------------------------------------------------------------------------------
                // @ Translate params for static page (Upgrade plan names reference new plan names)
                // --------------------------------------------------------------------------------
                // this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.D }
                // this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.D }

                this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.B }
                this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                this.dispayBadgeAvaibleFromInAppStore = true;
                // ------------------------------------------------------------------------
                // USECASE: Basic Plan (SUB EXPIRED) new for Growth
                // ------------------------------------------------------------------------
              } else if (this.profile_name === PLAN_NAME.D) {
                this.prjct_profile_name = PLAN_NAME.D + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.D, allowed_seats_num: this.seatsLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                // Chatbot limit
                this.chatBotLimit = CHATBOT_MAX_NUM.free;
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                this.kbLimit = KB_MAX_NUM.free;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);


                // Translate params for static page
                this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.E }
                this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.E }
                this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                this.dispayBadgeAvaibleFromInAppStore = true;

                // ------------------------------------------------------------------------
                // USECASE: Premium Plan (SUB EXPIRED) new for Scale
                // ------------------------------------------------------------------------
              } else if (this.profile_name === PLAN_NAME.E) {
                this.prjct_profile_name = PLAN_NAME.E + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.E, allowed_seats_num: this.seatsLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                // Chatbot limit
                this.chatBotLimit = CHATBOT_MAX_NUM.free;
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                this.kbLimit = KB_MAX_NUM.free;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                // Translate params for static page
                this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.E }
                this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.E }
                this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                this.dispayBadgeAvaibleFromInAppStore = true;

                // ------------------------------------------------------------------------
                // USECASE: Custom Plan (SUB EXPIRED) new for Plus
                // ------------------------------------------------------------------------
              } else if (this.profile_name === PLAN_NAME.F) {
                this.prjct_profile_name = PLAN_NAME.F + " plan";
                // console.log('[P-BASE] - GET PROJECT PLAN - NAME ', this.prjct_profile_name, ' TYPE: ', projectProfileData.profile_type, ' SUB IS ACTIVE: ', this.subscription_is_active)
                this.profile_name_for_segment = this.prjct_profile_name;
                this.tprojectprofilemane = { projectprofile: this.prjct_profile_name }

                // Seats limit
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.F, allowed_seats_num: this.seatsLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - SEATS LIMIT ', this.seatsLimit)

                // Chatbot limit
                this.chatBotLimit = CHATBOT_MAX_NUM.free;
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - CB LIMIT ', this.chatBotLimit);

                // KB limit
                this.kbLimit = KB_MAX_NUM.free;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - KB LIMIT ', this.kbLimit);

                // Translate params for static page
                this.tParamsCRMAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsMonitorAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsHoursAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsCannedAvailableFromPlan = { plan_name: PLAN_NAME.D }
                this.tParamsAvailableFromTier2 = { plan_name: PLAN_NAME.E }
                this.tParamsEmailTicketingFromPlan = { plan_name: PLAN_NAME.E }
                this.tParamsActivitiesFromPlan = { plan_name: PLAN_NAME.F }
                this.dispayBadgeAvaibleFromInAppStore = true;

              }
            }
          }
        }
      },
      (err) => {
        // console.error('[P-BASE] GET PROJECT PROFILE - ERROR', err)
      },
      () => {
        // console.log('[P-BASE] GET PROJECT PROFILE * COMPLETE *')
      },
    )
  }

}
