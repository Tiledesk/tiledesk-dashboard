import { Component, OnInit } from '@angular/core';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { CHATBOT_MAX_NUM, PLAN_NAME } from 'app/utils/util';

@Component({
  selector: 'appdashboard-bots-base',
  templateUrl: './bots-base.component.html',
  styleUrls: ['./bots-base.component.scss']
})
export class BotsBaseComponent implements OnInit {


  dialogflowLanguage = [
    { code: 'zh-cn', name: 'Chinese (Simplified) — zh-cn' },
    { code: 'zh-hk', name: 'Chinese (Hong Kong) — zh-hk' },
    { code: 'zh-tw', name: 'Chinese (Traditional) — zh-tw' },
    { code: 'da', name: 'Danish — da' },
    { code: 'nl', name: 'Dutch — nl' },
    { code: 'en', name: 'English — en' },
    { code: 'fr', name: 'French — fr' },
    { code: 'de', name: 'German — de' },
    { code: 'hi', name: 'Hindi — hi' },
    { code: 'id', name: 'Indonesian — id' },
    { code: 'it', name: 'Italian — it' },
    { code: 'ja', name: 'Japanese — ja' },
    { code: 'ko', name: 'Korean (South Korea) — ko' },
    { code: 'no', name: 'Norwegian — no' },
    { code: 'pl', name: 'Polish — pl' },
    { code: 'pt-br', name: 'Portuguese (Brazilian) — pt-br' },
    { code: 'pt', name: 'Portuguese (European) — pt' },
    { code: 'ru', name: 'Russian — ru' },
    { code: 'es', name: 'Spanish — es' },
    { code: 'sv', name: 'Swedish — sv' },
    { code: 'th', name: 'Thai — th' },
    { code: 'tr', name: 'Turkish — tr' },
    { code: 'uk', name: 'Ukrainian — uk' },
  ];

  botDefaultLanguages = [
    { code: 'da', name: 'Danish - da' },
    { code: 'nl', name: 'Dutch - nl' },
    { code: 'en', name: 'English - en' },
    { code: 'fi', name: 'Finnish - fi' },
    { code: 'fr', name: 'French - fr' },
    { code: 'de', name: 'German - de' },
    { code: 'hu', name: 'Hungarian - hu' },
    { code: 'it', name: 'Italian - it' },
    { code: 'nb', name: 'Norwegian - nb' },
    { code: 'pt', name: 'Portuguese - pt' },
    { code: 'ro', name: 'Romanian - ro' },
    { code: 'ru', name: 'Russian - ru' },
    { code: 'es', name: 'Spanish - es' },
    { code: 'sv', name: 'Swedish - sv' },
    { code: 'tr', name: 'Turkish - tr' }
  ];


  public projectPlanAgentsNo: any;
  public prjct_profile_type: any;
  public subscription_is_active: any;
  public subscription_end_date: any;
  public profile_name: any;
  public trial_expired: any;
  public prjct_profile_name: string;
  public chatBotLimit: any;
  public tParamsPlanAndChatBot: any;

  constructor(
    public prjctPlanService: ProjectPlanService,
  ) { }

  ngOnInit() {
  }

  getIndexOfdialogflowLanguage(langcode: string): number {
    const index = this.dialogflowLanguage.findIndex(x => x.code === langcode);
    return index
  }

  getIndexOfbotDefaultLanguages(langcode: string): number {
    console.log('getIndexOfbotDefaultLanguages' , langcode) 
    const index = this.botDefaultLanguages.findIndex(x => x.code === langcode);
    return index
  }

  // .pipe(
  //   takeUntil(this.unsubscribe$)
  // )
  getProjectPlan() {
    this.prjctPlanService.projectPlan$

      .subscribe((projectProfileData: any) => {
        console.log('[BOTS-BASE] - GET PROJECT PROFILE - RES', projectProfileData)
        if (projectProfileData) {

          this.projectPlanAgentsNo = projectProfileData.profile_agents;
          console.log('[BOTS-BASE]  - GET PROJECT PROFILE - projectPlanAgentsNo ', this.projectPlanAgentsNo);

          this.prjct_profile_type = projectProfileData.profile_type;
          console.log('[BOTS-BASE]  - GET PROJECT PROFILE - prjct_profile_type ', this.prjct_profile_type);

          this.subscription_is_active = projectProfileData.subscription_is_active;
          console.log('[BOTS-BASE]  - GET PROJECT PROFILE - subscription_is_active ', this.subscription_is_active);

          this.subscription_end_date = projectProfileData.subscription_end_date
          console.log('[BOTS-BASE]  - GET PROJECT PROFILE - subscription_end_date ', this.subscription_end_date);

          this.profile_name = projectProfileData.profile_name
          console.log('[BOTS-BASE]  - GET PROJECT PROFILE - profile_name ', this.profile_name);

          this.trial_expired = projectProfileData.trial_expired
          console.log('[BOTS-BASE]  - GET PROJECT PROFILE - trial_expired ', this.trial_expired);

          if (projectProfileData.profile_type === 'free') {

            if (projectProfileData.trial_expired === false) {

              if (this.profile_name === 'Sandbox') {
                this.prjct_profile_name = PLAN_NAME.E + " plan (trial)"
                this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.E]
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' CB LIMIT: ', this.chatBotLimit)
              }

              if (this.profile_name === 'free') {
                this.prjct_profile_name = PLAN_NAME.B + " plan (trial)"
                this.chatBotLimit = null
                // this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' CB LIMIT: ', this.chatBotLimit)
              }

            } else {
              if (this.profile_name === 'Sandbox') {
                this.prjct_profile_name = "Sandbox plan";
                this.chatBotLimit = CHATBOT_MAX_NUM.free;
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' TRIAL EXPIRED CB LIMIT: ', this.chatBotLimit)
              }

              if (this.profile_name === 'free') {
                this.prjct_profile_name = "Free plan";
                this.chatBotLimit = null;
                // this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' TRIAL EXPIRED CB LIMIT: ', this.chatBotLimit)
              }
            }
          } else if (projectProfileData.profile_type === 'payment') {

            if (this.subscription_is_active === true) {

              if (this.profile_name === PLAN_NAME.A) {
                this.prjct_profile_name = PLAN_NAME.A + " plan";
                this.chatBotLimit = null
                // this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.B) {
                this.prjct_profile_name = PLAN_NAME.B + " plan";
                this.chatBotLimit = null
                // this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.C) {
                this.prjct_profile_name = PLAN_NAME.C + " plan";
                this.chatBotLimit = null
                // this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.D) {
                this.prjct_profile_name = PLAN_NAME.D + " plan";
                this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.D]
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.E) {
                this.prjct_profile_name = PLAN_NAME.E + " plan";
                this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.E]
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.F) {
                this.prjct_profile_name = PLAN_NAME.F + " plan";
                this.chatBotLimit = CHATBOT_MAX_NUM[PLAN_NAME.F]
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB ACTIVE CB LIMIT: ', this.chatBotLimit)
              }

            } else if (this.subscription_is_active === false) {
              if (this.profile_name === PLAN_NAME.A) {
                this.prjct_profile_name = PLAN_NAME.A + " plan";
                this.chatBotLimit = null;
                // this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.B) {
                this.prjct_profile_name = PLAN_NAME.B + " plan";
                this.chatBotLimit = null;
                // this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.C) {
                this.prjct_profile_name = PLAN_NAME.C + " plan";
                this.chatBotLimit = null;
                // this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.D) {
                this.prjct_profile_name = PLAN_NAME.D + " plan";
                this.chatBotLimit = CHATBOT_MAX_NUM.free;
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.E) {
                this.prjct_profile_name = PLAN_NAME.E + " plan";
                this.chatBotLimit = CHATBOT_MAX_NUM.free;
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP CB LIMIT: ', this.chatBotLimit)

              } else if (this.profile_name === PLAN_NAME.F) {
                this.prjct_profile_name = PLAN_NAME.F + " plan";
                this.chatBotLimit = CHATBOT_MAX_NUM.free;
                this.tParamsPlanAndChatBot = { plan_name: this.prjct_profile_name, allowed_cb_num: this.chatBotLimit }
                console.log('[BOTS-BASE] - GET PROJECT PLAN - PLAN_NAME ', this.prjct_profile_name, ' SUB EXIP CB LIMIT: ', this.chatBotLimit)

              }

            }
          }

        }
      }, err => {
        console.error('[BOTS-BASE] GET PROJECT PLAN - ERROR', err);
      }, () => {
        console.log('[BOTS-BASE] GET PROJECT PLAN * COMPLETE *');

      });
  }

}
