import { Component, OnInit } from '@angular/core';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { KB_MAX_NUM, PLAN_NAME } from 'app/utils/util';

@Component({
  selector: 'appdashboard-kb-base',
  template: `
    <p>
      kb-base works!
    </p>
  `,
  styles: [
  ]
})
export class KbBaseComponent implements OnInit {
  PLAN_NAME = PLAN_NAME
  KB_MAX_NUM = KB_MAX_NUM
  public projectPlanAgentsNo: number;
  public prjct_profile_type: string;
  public subscription_is_active: boolean;
  public subscription_end_date: any
  public profile_name: string;
  public trial_expired:  boolean;
  public prjct_profile_name: string;
  public kbLimit: any;
  public tParamsPlanAndKb: any;
  constructor(
    public prjctPlanService: ProjectPlanService,
  ) { }

  ngOnInit(): void {
  }

  getProjectPlan() {
    this.prjctPlanService.projectPlan$

      .subscribe((projectProfileData: any) => {
        console.log('[KB-BASE] - GET PROJECT PROFILE - RES', projectProfileData)
        if (projectProfileData) {

          this.projectPlanAgentsNo = projectProfileData.profile_agents;
          console.log('[KB-BASE]  - GET PROJECT PROFILE - projectPlanAgentsNo ', this.projectPlanAgentsNo);

          this.prjct_profile_type = projectProfileData.profile_type;
          console.log('[KB-BASE]  - GET PROJECT PROFILE - prjct_profile_type ', this.prjct_profile_type);

          this.subscription_is_active = projectProfileData.subscription_is_active;
          console.log('[KB-BASE]  - GET PROJECT PROFILE - subscription_is_active ', this.subscription_is_active);

          this.subscription_end_date = projectProfileData.subscription_end_date
          console.log('[KB-BASE]  - GET PROJECT PROFILE - subscription_end_date ', this.subscription_end_date);

          this.profile_name = projectProfileData.profile_name
          console.log('[KB-BASE]  - GET PROJECT PROFILE - profile_name ', this.profile_name);

          this.trial_expired = projectProfileData.trial_expired
          console.log('[KB-BASE]  - GET PROJECT PROFILE - trial_expired ', this.trial_expired);

          if (projectProfileData.profile_type === 'free') {

            if (projectProfileData.trial_expired === false) {

              if (this.profile_name === 'Sandbox') {
                this.prjct_profile_name = PLAN_NAME.E + " plan (trial)"
                 this.kbLimit = KB_MAX_NUM[PLAN_NAME.E]
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' KB LIMIT: ', this.kbLimit)
              }

              if (this.profile_name === 'free') {
                this.prjct_profile_name = PLAN_NAME.B + " plan (trial)"
                this.kbLimit = null
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' KB LIMIT: ', this.kbLimit)
              }

            } else {
              if (this.profile_name === 'Sandbox') {
                this.prjct_profile_name = "Sandbox plan";
                this.kbLimit = KB_MAX_NUM.free;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' TRIAL EXPIRED KB LIMIT: ', this.kbLimit)
              }

              if (this.profile_name === 'free') {
                this.prjct_profile_name = "Free plan";
                this.kbLimit = null;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' TRIAL EXPIRED KB LIMIT: ', this.kbLimit)
              }
            }
          } else if (projectProfileData.profile_type === 'payment') {

            if (this.subscription_is_active === true) {

              if (this.profile_name === PLAN_NAME.A) {
                this.prjct_profile_name = PLAN_NAME.A + " plan";
                this.kbLimit = null
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.B) {
                this.prjct_profile_name = PLAN_NAME.B + " plan";
                this.kbLimit = null
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.C) {
                this.prjct_profile_name = PLAN_NAME.C + " plan";
                this.kbLimit = null
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.D) {
                this.prjct_profile_name = PLAN_NAME.D + " plan";
                this.kbLimit = KB_MAX_NUM[PLAN_NAME.D]
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.E) {
                this.prjct_profile_name = PLAN_NAME.E + " plan";
                this.kbLimit = KB_MAX_NUM[PLAN_NAME.E]
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.F) {
                this.prjct_profile_name = PLAN_NAME.F + " plan";
                this.kbLimit = KB_MAX_NUM[PLAN_NAME.F]
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE KB LIMIT: ', this.kbLimit)
              }

            } else if (this.subscription_is_active === false) {
              if (this.profile_name === PLAN_NAME.A) {
                this.prjct_profile_name = PLAN_NAME.A + " plan";
                this.kbLimit = null;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.B) {
                this.prjct_profile_name = PLAN_NAME.B + " plan";
                this.kbLimit = null;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.C) {
                this.prjct_profile_name = PLAN_NAME.C + " plan";
                this.kbLimit = null;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.D) {
                this.prjct_profile_name = PLAN_NAME.D + " plan";
                 this.kbLimit = KB_MAX_NUM.free;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.E) {
                this.prjct_profile_name = PLAN_NAME.E + " plan";
                this.kbLimit = KB_MAX_NUM.free;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP KB LIMIT: ', this.kbLimit)

              } else if (this.profile_name === PLAN_NAME.F) {
                this.prjct_profile_name = PLAN_NAME.F + " plan";
                this.kbLimit = KB_MAX_NUM.free;
                this.tParamsPlanAndKb = { plan_name: this.prjct_profile_name, allowed_kb_num: this.kbLimit }
                console.log('[KB-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP KB LIMIT: ', this.kbLimit)

              }

            }
          }

        }
      }, err => {
        console.error('[KB-BASE] GET PROJECT PLAN - ERROR', err);
      }, () => {
        console.log('[KB-BASE] GET PROJECT PLAN * COMPLETE *');

      });
  }

}
