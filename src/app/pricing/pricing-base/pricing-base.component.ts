import { Component, OnInit } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { APPSUMO_PLAN_SEATS, APP_SUMO_PLAN_NAME, PLAN_NAME, PLAN_SEATS } from 'app/utils/util';

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

  prjct_id: string;
  prjct_name: string;
  appSumoProfile: string;
  projectPlanAgentsNo: number;
  prjct_profile_type: string;
  subscription_is_active: boolean;
  subscription_end_date: any
  profile_name: string
  trial_expired: any;
  prjct_profile_name: string

  // Plan limit
  seatsLimit: any;

  // Translations params
  tParamsFreePlanSeatsNum: any;
  tParamsPlanAndSeats: any;

  constructor(
    public prjctPlanService: ProjectPlanService,
  ) {

  }

  ngOnInit(): void {
  }

  getProjectPlan() {
    this.prjctPlanService.projectPlan$.subscribe(
      (projectProfileData: any) => {
        console.log('[P-BASE] - GET PROJECT PLAN - RES ', projectProfileData)
        if (projectProfileData) {
          this.prjct_id = projectProfileData._id
          this.prjct_name = projectProfileData.name
          this.projectPlanAgentsNo = projectProfileData.profile_agents;
          this.subscription_is_active = projectProfileData.subscription_is_active;
          this.subscription_end_date = projectProfileData.subscription_end_date;
          this.prjct_profile_type = projectProfileData.profile_type;
          this.profile_name = projectProfileData.profile_name;
          this.trial_expired = projectProfileData.trial_expired;

          if (projectProfileData && projectProfileData.extra3) {
            console.log('[HOME] Find Current Project Among All extra3 ', projectProfileData.extra3)
            this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
            console.log('[P-BASE] Find Current Project appSumoProfile ', this.appSumoProfile)
          }

          if (projectProfileData.profile_type === 'free') {
            if (projectProfileData.trial_expired === false) {

              if (this.profile_name === 'free') {
                this.prjct_profile_name = PLAN_NAME.B + " plan (trial)"
                this.seatsLimit = PLAN_SEATS[PLAN_NAME.B]
                // this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: this.prjct_profile_name, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', 'FREE TRIAL', ' SEATS LIMIT: ', this.seatsLimit)
              } else if (this.profile_name === 'Sandbox') {

                this.prjct_profile_name = PLAN_NAME.E + " plan (trial)"
                this.seatsLimit = PLAN_SEATS[PLAN_NAME.E]
                // this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: this.prjct_profile_name, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', 'FREE TRIAL', ' SEATS LIMIT: ', this.seatsLimit)
              }
            } else {
              if (this.profile_name === 'free') {
                this.prjct_profile_name = "Free plan";
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: 'Free', allowed_seats_num: this.seatsLimit }
                // console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', 'FREE TRIAL', ' SEATS LIMIT: ', this.seatsLimit)
              } else if (this.profile_name === 'Sandbox') {
                this.prjct_profile_name = "Sandbox plan";
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: 'Sandbox', allowed_seats_num: this.seatsLimit }
              }
            }
          } else if (projectProfileData.profile_type === 'payment') {
            if (this.subscription_is_active === true) {
              if (projectProfileData.profile_name === PLAN_NAME.A) {
                if (!this.appSumoProfile) {
                  this.prjct_profile_name = PLAN_NAME.A + " plan";
                  this.seatsLimit = PLAN_SEATS[PLAN_NAME.A]
                  this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.A, allowed_seats_num: this.seatsLimit }
                  console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.A, ' SEATS LIMIT: ', this.seatsLimit)
                } else {
                  this.prjct_profile_name = PLAN_NAME.A + " plan " + '(' + this.appSumoProfile + ')';
                  this.seatsLimit = APPSUMO_PLAN_SEATS[projectProfileData.extra3];
                  this.tParamsPlanAndSeats = { plan_name: 'AppSumo ' + this.appSumoProfile, allowed_seats_num: this.seatsLimit }
                  console.log('[P-BASE] - GET PROJECT PLAN - prjct_profile_name ', this.prjct_profile_name, ' SEATS LIMIT: ', this.seatsLimit)
                }
              } else if (projectProfileData.profile_name === PLAN_NAME.B) {
                if (!this.appSumoProfile) {
                  this.prjct_profile_name = PLAN_NAME.B + " plan";
                  this.seatsLimit = PLAN_SEATS[PLAN_NAME.B]
                  this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.B, allowed_seats_num: this.seatsLimit }
                  console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.B, ' SEATS LIMIT: ', this.seatsLimit)
                } else {
                  this.prjct_profile_name = PLAN_NAME.B + " plan " + '(' + this.appSumoProfile + ')';;
                  this.seatsLimit = APPSUMO_PLAN_SEATS[projectProfileData.extra3];
                  this.tParamsPlanAndSeats = { plan_name: 'AppSumo ' + this.appSumoProfile, allowed_seats_num: this.seatsLimit }
                  console.log('[P-BASE] - GET PROJECT PLAN - prjct_profile_name ', this.prjct_profile_name, ' SEATS LIMIT: ', this.seatsLimit)
                }
              } else if (projectProfileData.profile_name === PLAN_NAME.C) {
                this.prjct_profile_name = PLAN_NAME.C + " plan";
                this.seatsLimit = projectProfileData.profile_agents
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.C, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)

              } else if (projectProfileData.profile_name === PLAN_NAME.D) {
                this.prjct_profile_name = PLAN_NAME.D + " plan";
                this.seatsLimit = projectProfileData.profile_agents
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.D, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.D, ' SEATS LIMIT: ', this.seatsLimit)
              } else if (projectProfileData.profile_name === PLAN_NAME.E) {
                this.prjct_profile_name = PLAN_NAME.E + " plan";
                this.seatsLimit = projectProfileData.profile_agents
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.E, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.D, ' SEATS LIMIT: ', this.seatsLimit)
              } else if (projectProfileData.profile_name === PLAN_NAME.F) {
                this.prjct_profile_name = PLAN_NAME.F + " plan";
                this.seatsLimit = projectProfileData.profile_agents
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.F, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.F, ' SEATS LIMIT: ', this.seatsLimit)
              }

            } else if (this.subscription_is_active === false) {
              

              if (projectProfileData.profile_name === PLAN_NAME.A) {
                this.prjct_profile_name = PLAN_NAME.A + " plan";
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.A, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.A, ' SEATS LIMIT: ', this.seatsLimit)

              } else if (projectProfileData.profile_name === PLAN_NAME.B) {
                this.prjct_profile_name = PLAN_NAME.B + " plan";
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.B, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.B, ' SEATS LIMIT: ', this.seatsLimit)

              } else if (projectProfileData.profile_name === PLAN_NAME.C) {
                this.prjct_profile_name = PLAN_NAME.C + " plan";
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.C, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)

              } else if (projectProfileData.profile_name === PLAN_NAME.D) {
                this.prjct_profile_name = PLAN_NAME.D + " plan";
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.D, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.C, ' SEATS LIMIT: ', this.seatsLimit)

              } else if (projectProfileData.profile_name === PLAN_NAME.E) {
                this.prjct_profile_name = PLAN_NAME.E + " plan";
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.E, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.E, ' SEATS LIMIT: ', this.seatsLimit)

              } else if (projectProfileData.profile_name === PLAN_NAME.F) {
                this.prjct_profile_name = PLAN_NAME.F + " plan";
                this.seatsLimit = PLAN_SEATS.free
                this.tParamsPlanAndSeats = { plan_name: PLAN_NAME.F, allowed_seats_num: this.seatsLimit }
                console.log('[P-BASE] - GET PROJECT PLAN - PLAN_NAME ', PLAN_NAME.F, ' SEATS LIMIT: ', this.seatsLimit)
              }
            }
          }


          // ADDS 'Plan' to the project plan's name
          // NOTE: IF THE PLAN IS OF FREE TYPE IN THE USER INTERFACE THE MESSAGE 'You currently have ...' IS NOT DISPLAYED
          if (this.prjct_profile_type === 'payment') {
            // this.getPaidPlanTranslation(this.profile_name)
          }
        }
      },
      (err) => {
        console.error('[P-BASE] GET PROJECT PROFILE - ERROR', err)
      },
      () => {
        console.log('[P-BASE] GET PROJECT PROFILE * COMPLETE *')
      },
    )
  }

}
