import { SatPopoverModule } from '@ncstate/sat-popover';
import { ActionJsonConditionComponent } from './cds-dashboard/panel-intent-detail/actions/action-json-condition/action-json-condition.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { A11yModule } from '@angular/cdk/a11y';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

//MATERIAL ELEMENTS
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

// import { SharedModule } from '../shared/shared.module';
import { CdsDashboardComponent } from './cds-dashboard/cds-dashboard.component';
import { PanelReplyToolsComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/panel-reply-tools/panel-reply-tools.component';
import { ActionReplyComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/action-reply.component';
import { TextResponseComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/reply-types/text-response/text-response.component';
import { DelaySliderComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/elements/delay-slider/delay-slider.component';
// import { ButtonConfigurationPanelComponent } from './dashboard/button-configuration-panel/button-configuration-panel.component';
import { ImageResponseComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/reply-types/image-response/image-response.component';
import { FrameResponseComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/reply-types/frame-response/frame-response.component';
import { ImageUploadComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/elements/image-upload/image-upload.component';
import { PanelIntentListComponent } from './cds-dashboard/panel-intent-list/panel-intent-list.component';
import { PanelIntentComponent } from './cds-dashboard/panel-intent/panel-intent.component';
import { PanelActionsComponent } from './cds-dashboard/panel-actions/panel-actions.component';
import { PanelIntentDetailComponent } from './cds-dashboard/panel-intent-detail/panel-intent-detail.component';
import { PanelIntentHeaderComponent } from './cds-dashboard/panel-intent-header/panel-intent-header.component';
import { PanelButtonConfigurationComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/panel-button-configuration/panel-button-configuration.component';
import { ElementFromUrlComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/elements/element-from-url/element-from-url.component';
import { QuestionComponent } from './cds-dashboard/panel-intent-detail/question/question.component';
import { AnswerComponent } from './cds-dashboard/panel-intent-detail/answer/answer.component';
import { FormComponent } from './cds-dashboard/panel-intent-detail/form/form.component';
import { FormFieldComponent } from './cds-dashboard/panel-intent-detail/form/form-field/form-field.component';
import { FormEditAddComponent } from './cds-dashboard/panel-intent-detail/form/form-edit-add/form-edit-add.component';
import { ModalWindowComponent } from './cds-dashboard/panel-intent-detail/form/modal-window/modal-window.component';
import { CdsSidebarComponent } from './cds-sidebar/cds-sidebar.component';

import { ElementTextareaComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/elements/element-textarea/element-textarea.component';
import { CdsFulfillmentComponent } from './cds-fulfillment/cds-fulfillment.component';

//BASE-ELEMENT
import { CDSTextComponent } from './cds-base-element/text/text.component';
import { CDSDelaySliderComponent } from './cds-base-element/delay-slider/delay-slider.component';
import { CDSTextareaComponent } from './cds-base-element/textarea/textarea.component';

//RULES COMPONENT
import { RulesComponent } from './cds-rules/rules/rules.component';
import { RulesAddComponent } from './cds-rules/rules-add/rules-add.component';
import { RulesListComponent } from './cds-rules/rules-list/rules-list.component';
import { ConditionComponent } from './cds-rules/rules-add/condition/condition.component';
import { ActionComponent } from './cds-rules/rules-add/action/action.component';

//SETTINGS COMPONENT
import { CdsChatbotDetailsComponent } from './cds-chatbot-details/cds-chatbot-details.component';
import { CDSDetailCommunityComponent } from './cds-chatbot-details/community/community.component';
import { CDSDetailDeveloperComponent } from './cds-chatbot-details/developer/developer.component';

//intent ACTIONS
import { ActionWaitComponent } from './cds-dashboard/panel-intent-detail/actions/action-wait/action-wait.component';
import { ActionEmailComponent } from './cds-dashboard/panel-intent-detail/actions/action-email/action-email.component';
import { ActionIntentComponent } from './cds-dashboard/panel-intent-detail/actions/action-intent/action-intent.component'
import { ActionDeleteVariableComponent } from './cds-dashboard/panel-intent-detail/actions/action-delete-variable/action-delete-variable.component';
import { ActionAssignVariableComponent } from './cds-dashboard/panel-intent-detail/actions/action-assign-variable/action-assign-variable.component';
import { ActionReplaceBotComponent } from './cds-dashboard/panel-intent-detail/actions/action-replace-bot/action-replace-bot.component';
import { ActionChangeDepartmentComponent } from './cds-dashboard/panel-intent-detail/actions/action-change-department/action-change-department.component';
import { ActionOnlineAgentsComponent } from './cds-dashboard/panel-intent-detail/actions/action-online-agents/action-online-agents.component';
import { ActionOpenHoursComponent } from './cds-dashboard/panel-intent-detail/actions/action-open-hours/action-open-hours.component';
import { ActionHideMessageComponent } from './cds-dashboard/panel-intent-detail/actions/action-hide-message/action-hide-message.component';
import { ActionDescriptionComponent } from './cds-dashboard/panel-intent-detail/actions/action-description/action-description.component';
import { ActionCloseComponent } from './cds-dashboard/panel-intent-detail/actions/action-close/action-close.component';
import { ActionAgentHandoffComponent } from './cds-dashboard/panel-intent-detail/actions/action-agent-handoff/action-agent-handoff.component';


import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CdsSplashScreenComponent } from './cds-dashboard/cds-splash-screen/cds-splash-screen.component';
import { CdsFooterComponent } from './cds-dashboard/cds-footer/cds-footer.component';
import { CdsPublishOnCommunityModalComponent } from './cds-dashboard/cds-publish-on-community-modal/cds-publish-on-community-modal.component';
import { SelectComponent } from './cds-base-element/select/select.component';
import { BaseConditionRowComponent } from './cds-dashboard/panel-intent-detail/actions/action-json-condition/base-condition-row/base-condition-row.component';
import { BaseFilterComponent } from './cds-dashboard/panel-intent-detail/actions/action-json-condition/base-filter/base-filter.component';
import { VariableListComponent } from './cds-dashboard/panel-intent-detail/actions/action-json-condition/variable-list/variable-list.component';
import { TextEditableDivComponent } from './cds-base-element/text-editable-div/text-editable-div.component';
import { ActionWebRequestComponent } from './cds-dashboard/panel-intent-detail/actions/action-web-request/action-web-request.component';
import { AttributesComponent } from './cds-base-element/attributes/attributes.component';
import { OperationComponent } from './cds-dashboard/panel-intent-detail/actions/action-assign-variable/operation/operation.component';
import { OperandComponent } from './cds-dashboard/panel-intent-detail/actions/action-assign-variable/operand/operand.component';
import { OperatorComponent } from './cds-dashboard/panel-intent-detail/actions/action-assign-variable/operator/operator.component';
import { DialogComponent } from './cds-base-element/dialog/dialog.component';
import { ActionAssignFunctionComponent } from './cds-dashboard/panel-intent-detail/actions/action-assign-function/action-assign-function.component';
import { DialogYesNoComponent } from './cds-base-element/dialog-yes-no/dialog-yes-no.component';
import { CDSFilterComponent } from './cds-base-element/filter/filter.component';
import { CDSDetailBotDetailComponent } from './cds-chatbot-details/detail/detail.component';
import { CDSDetailImportExportComponent } from './cds-chatbot-details/import-export/import-export.component';
// import { WsChatbotService } from 'app/services/websocket/ws-chatbot.service';
import { ChangeBotLangModalComponent } from 'app/components/modals/change-bot-lang/change-bot-lang.component';
import { ActionWhatsappStaticComponent } from './cds-dashboard/panel-intent-detail/actions/action-whatsapp-static/action-whatsapp-static.component';
import { ActionWhatsappAttributeComponent } from './cds-dashboard/panel-intent-detail/actions/action-whatsapp-attribute/action-whatsapp-attribute.component';
import { ActionWhatsappSegmentComponent } from './cds-dashboard/panel-intent-detail/actions/action-whatsapp-segment/action-whatsapp-segment.component';
import { WhatsappReceiverComponent } from './cds-dashboard/panel-intent-detail/actions/action-whatsapp-static/whatsapp-receiver/whatsapp-receiver.component';
import { GalleryResponseComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/reply-types/gallery-response/gallery-response.component';
import { RedirectResponseComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/reply-types/redirect-response/redirect-response.component';


const routes: Routes = [
  { path: "", component: CdsDashboardComponent},
];

@NgModule({
  declarations: [
    CdsDashboardComponent,
    //ACTION-REPLY
    PanelReplyToolsComponent,
    ActionReplyComponent,
    TextResponseComponent,
    DelaySliderComponent,
    ImageResponseComponent,
    FrameResponseComponent,
    GalleryResponseComponent,
    ImageUploadComponent,
    RedirectResponseComponent,
    PanelIntentListComponent,
    PanelIntentComponent,
    PanelActionsComponent,
    PanelIntentDetailComponent,
    PanelIntentHeaderComponent,
    PanelButtonConfigurationComponent,
    ElementFromUrlComponent,
    QuestionComponent,
    AnswerComponent,
    FormComponent,
    FormFieldComponent,
    FormEditAddComponent,
    ModalWindowComponent,
    CdsSidebarComponent,
    ElementTextareaComponent,
    RulesComponent,
    RulesAddComponent,
    RulesListComponent,
    CdsFulfillmentComponent,
    ConditionComponent,
    ActionComponent,
    
    CdsSplashScreenComponent,
    ActionWaitComponent,
    //BASE-ELEMENT
    CDSTextComponent,
    CDSDelaySliderComponent,
    CDSFilterComponent,
    CDSTextareaComponent,
    ActionDeleteVariableComponent,
    ActionAssignVariableComponent,
    ActionIntentComponent,
    ActionEmailComponent,
    ActionReplaceBotComponent,
    ActionChangeDepartmentComponent,
    ActionOnlineAgentsComponent,
    ActionOpenHoursComponent,
    ActionHideMessageComponent,
    ActionDescriptionComponent,
    ActionCloseComponent,
    ActionAgentHandoffComponent,
    ActionJsonConditionComponent,
    CdsFooterComponent,
    CdsPublishOnCommunityModalComponent,
    SelectComponent,
    BaseConditionRowComponent,
    BaseFilterComponent,
    VariableListComponent,
    TextEditableDivComponent,
    ActionWebRequestComponent,
    AttributesComponent,
    OperationComponent,
    OperandComponent,
    OperatorComponent,
    DialogComponent,
    ActionAssignFunctionComponent,
    DialogYesNoComponent,
    //SETTINGS COMPONENTS
    CdsChatbotDetailsComponent,
    CDSDetailDeveloperComponent,
    CDSDetailCommunityComponent,
    CDSDetailBotDetailComponent,
    CDSDetailImportExportComponent,
    //DETAIL COMPONENT SECTION
    ChangeBotLangModalComponent,
    WhatsappReceiverComponent,
    ActionWhatsappStaticComponent,
    ActionWhatsappAttributeComponent,
    ActionWhatsappSegmentComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    A11yModule,
    CommonModule,
    DragDropModule,
    NgSelectModule,
    PickerModule,
    TextFieldModule,
    MatSliderModule,
    MatSidenavModule,
    MatSelectModule,
    MatTooltipModule,
    MatRadioModule,
    MatCheckboxModule,
    MatChipsModule,
    MatGridListModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    MatInputModule,
    MatExpansionModule,
    MatDialogModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    SatPopoverModule,
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: HttpLoaderFactory,
    //     deps: [HttpClient],
    //   },
    // })
  ],
  exports: [
    RouterModule
  ]
  // ,
  // providers: [
  //   WsChatbotService
  // ]
})
export class ChatbotDesignStudioModule { }

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }