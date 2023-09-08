import { SatPopoverModule } from '@ncstate/sat-popover';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { A11yModule } from '@angular/cdk/a11y';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';



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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

//SERVICES
// import { DragDropService } from './services/drag-drop.service';

// import { SharedModule } from '../shared/shared.module';
import { CdsDashboardComponent } from './cds-dashboard/cds-dashboard.component';
import { PanelReplyToolsComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/panel-reply-tools/panel-reply-tools.component';
import { ActionReplyComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/action-reply.component';
import { ImageResponseComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/reply-types/image-response/image-response.component';
import { FrameResponseComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/reply-types/frame-response/frame-response.component';
import { ImageUploadComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/elements/image-upload/image-upload.component';
import { PanelIntentListComponent } from './cds-dashboard/panel-intent-list/panel-intent-list.component';
import { PanelIntentComponent } from './cds-dashboard/panel-intent/panel-intent.component';
import { PanelActionsComponent } from './cds-dashboard/panel-actions/panel-actions.component';
import { PanelIntentDetailComponent } from './cds-dashboard/panel-intent-detail/panel-intent-detail.component';
import { PanelIntentHeaderComponent } from './cds-dashboard/panel-intent-header/panel-intent-header.component';
import { ElementFromUrlComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/elements/element-from-url/element-from-url.component';
import { QuestionComponent } from './cds-dashboard/panel-intent-detail/question/question.component';
import { AnswerComponent } from './cds-dashboard/panel-intent-detail/answer/answer.component';
import { FormComponent } from './cds-dashboard/panel-intent-detail/form/form.component';
import { FormFieldComponent } from './cds-dashboard/panel-intent-detail/form/form-field/form-field.component';
import { FormEditAddComponent } from './cds-dashboard/panel-intent-detail/form/form-edit-add/form-edit-add.component';
import { ModalWindowComponent } from './cds-dashboard/panel-intent-detail/form/modal-window/modal-window.component';
import { CdsSidebarComponent } from './cds-sidebar/cds-sidebar.component';
import { ElementTextareaComponent } from './cds-dashboard/panel-intent-detail/actions/action-reply/elements/element-textarea/element-textarea.component';
import { CdsChatbotDetailsComponent } from './cds-chatbot-details/cds-chatbot-details.component';
import { CdsFulfillmentComponent } from './cds-fulfillment/cds-fulfillment.component';

//BASE-ELEMENT
import { CDSTextComponent } from './cds-dashboard/base-elements/text/text.component';
import { CDSTextareaComponent } from './cds-dashboard/base-elements/textarea/textarea.component';
import { CDSDelaySliderComponent } from './cds-dashboard/base-elements/delay-slider/delay-slider.component';
import { CDSImageUploadComponent } from './cds-dashboard/base-elements/image-upload/image-upload.component';
import { CDSElementFromUrlComponent } from './cds-dashboard/base-elements/element-from-url/element-from-url.component';

//RULES COMPONENT
import { RulesComponent } from './cds-rules/rules/rules.component';
import { RulesAddComponent } from './cds-rules/rules-add/rules-add.component';
import { RulesListComponent } from './cds-rules/rules-list/rules-list.component';
import { ConditionComponent } from './cds-rules/rules-add/condition/condition.component';
import { ActionComponent } from './cds-rules/rules-add/action/action.component';


//INTENT ACTIONS
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
import { ActionJsonConditionComponent } from './cds-dashboard/panel-intent-detail/actions/action-json-condition/action-json-condition.component';

import { CdsSplashScreenComponent } from './cds-dashboard/utils/cds-splash-screen/cds-splash-screen.component';
// import { CdsFooterComponent } from './cds-dashboard/cds-footer/cds-footer.component';
import { CdsPublishOnCommunityModalComponent } from './cds-dashboard/utils/cds-publish-on-community-modal/cds-publish-on-community-modal.component';
import { SelectComponent } from './cds-base-element/select/select.component';
import { BaseConditionRowComponent } from './cds-dashboard/panel-intent-detail/actions/action-json-condition/base-condition-row/base-condition-row.component';
import { BaseFilterComponent } from './cds-dashboard/panel-intent-detail/actions/action-json-condition/base-filter/base-filter.component';
import { VariableListComponent } from './cds-dashboard/panel-intent-detail/actions/action-json-condition/variable-list/variable-list.component';
import { TextEditableDivComponent } from './cds-base-element/text-editable-div/text-editable-div.component';
import { ActionWebRequestComponent } from './cds-dashboard/panel-intent-detail/actions/action-web-request/action-web-request.component';
import { AttributesComponent } from './cds-base-element/attributes/attributes.component';
import { DialogComponent } from './cds-base-element/dialog/dialog.component';
import { ActionAssignFunctionComponent } from './cds-dashboard/panel-intent-detail/actions/action-assign-function/action-assign-function.component';
import { DialogYesNoComponent } from './cds-base-element/dialog-yes-no/dialog-yes-no.component';
import { CDSFilterComponent } from './cds-base-element/filter/filter.component';
import { CdsHeaderComponent } from './cds-dashboard/cds-header/cds-header.component';
import { CdsPopupComponent } from './cds-dashboard/utils/cds-popup/cds-popup.component';
import { CdsModalActivateBotComponent } from './cds-dashboard/utils/cds-modal-activate-bot/cds-modal-activate-bot.component';
import { CdsIntentComponent } from './cds-dashboard/cds-intent/cds-intent.component';
import { CdsPanelElementsComponent } from './cds-dashboard/cds-panel-elements/cds-panel-elements.component';
import { CdsPanelDetailComponent } from './cds-dashboard/cds-panel-detail/cds-panel-detail.component';
import { CdsPanelActionsComponent } from './cds-dashboard/cds-panel-actions/cds-panel-actions.component';
import { CdsPanelIntentListComponent } from './cds-dashboard/cds-panel-intent-list/cds-panel-intent-list.component';
import { CdsFloatingMenuComponent } from './cds-dashboard/cds-floating-menu/cds-floating-menu.component';

import { CdsConnectorComponent } from './cds-dashboard/base-elements/cds-connector/cds-connector.component';

//ACTION REPLY: elements
import { CdsActionReplyToolsComponent } from './cds-dashboard/actions/list/cds-action-reply/elements/cds-action-reply-tools/cds-action-reply-tools.component';
import { CdsActionReplyTextComponent } from './cds-dashboard/actions/list/cds-action-reply/elements/cds-action-reply-text/cds-action-reply-text.component';
import { CdsActionReplyImageComponent } from './cds-dashboard/actions/list/cds-action-reply/elements/cds-action-reply-image/cds-action-reply-image.component';
import { CdsActionReplyFrameComponent } from './cds-dashboard/actions/list/cds-action-reply/elements/cds-action-reply-frame/cds-action-reply-frame.component';
import { CdsActionReplyRedirectComponent } from './cds-dashboard/actions/list/cds-action-reply/elements/cds-action-reply-redirect/cds-action-reply-redirect.component';
import { CdsActionReplyGalleryComponent } from './cds-dashboard/actions/list/cds-action-reply/elements/cds-action-reply-gallery/cds-action-reply-gallery.component';

//ACTION ASSIGN-VARIABLE: elements
import { OperatorComponent } from './cds-dashboard/actions/list/cds-action-assign-variable/operator/operator.component';
import { OperationComponent } from './cds-dashboard/actions/list/cds-action-assign-variable/operation/operation.component';
import { OperandComponent } from './cds-dashboard/actions/list/cds-action-assign-variable/operand/operand.component';

//CDS- ACTIONS
import { CdsActionDescriptionComponent } from './cds-dashboard/actions/list/cds-action-description/cds-action-description.component';
import { CdsActionIntentComponent } from './cds-dashboard/actions/list/cds-action-intent/cds-action-intent.component';
import { CdsActionReplyComponent } from './cds-dashboard/actions/list/cds-action-reply/cds-action-reply.component';
import { CdsActionOnlineAgentsComponent } from './cds-dashboard/actions/list/cds-action-online-agents/cds-action-online-agents.component';
import { CdsActionEmailComponent } from './cds-dashboard/actions/list/cds-action-email/cds-action-email.component';
import { CdsActionWaitComponent } from './cds-dashboard/actions/list/cds-action-wait/cds-action-wait.component';
import { CdsActionAgentHandoffComponent } from './cds-dashboard/actions/list/cds-action-agent-handoff/cds-action-agent-handoff.component';
import { CdsActionChangeDepartmentComponent } from './cds-dashboard/actions/list/cds-action-change-department/cds-action-change-department.component';
import { CdsActionCloseComponent } from './cds-dashboard/actions/list/cds-action-close/cds-action-close.component';
import { CdsActionOpenHoursComponent } from './cds-dashboard/actions/list/cds-action-open-hours/cds-action-open-hours.component';
import { CdsActionJsonConditionComponent } from './cds-dashboard/actions/list/cds-action-json-condition/cds-action-json-condition.component';
import { CdsActionDeleteVariableComponent } from './cds-dashboard/actions/list/cds-action-delete-variable/cds-action-delete-variable.component';
import { CdsActionReplaceBotComponent } from './cds-dashboard/actions/list/cds-action-replace-bot/cds-action-replace-bot.component';
import { CdsActionAssignVariableComponent } from './cds-dashboard/actions/list/cds-action-assign-variable/cds-action-assign-variable.component';
import { CdsActionHideMessageComponent } from './cds-dashboard/actions/list/cds-action-hide-message/cds-action-hide-message.component';
import { CdsActionWebRequestComponent } from './cds-dashboard/actions/list/cds-action-web-request/cds-action-web-request.component';
import { CdsActionWebRequestV2Component } from './cds-dashboard/actions/list/cds-action-web-request-v2/cds-action-web-request-v2.component';
import { CdsActionAskgptComponent } from './cds-dashboard/actions/list/cds-action-askgpt/cds-action-askgpt.component';
import { CdsActionWhatsappAttributeComponent } from './cds-dashboard/actions/list/cds-action-whatsapp-attribute/cds-action-whatsapp-attribute.component';
import { CdsWhatsappReceiverComponent } from './cds-dashboard/actions/list/cds-action-whatsapp-static/whatsapp-receiver/whatsapp-receiver.component';
import { CdsActionWhatsappStaticComponent } from './cds-dashboard/actions/list/cds-action-whatsapp-static/cds-action-whatsapp-static.component';

//CDS PANELS
import { CdsActionDetailPanelComponent } from './cds-dashboard/actions/detail/cds-action-detail/cds-panel-action-detail.component';
import { CdsPanelWidgetComponent } from './cds-dashboard/cds-panel-widget/cds-panel-widget.component';
import { CdsPanelButtonConfigurationComponent } from './cds-dashboard/cds-panel-button-configuration/cds-panel-button-configuration.component';
import { CdsActionArrowComponent } from './cds-dashboard/actions/shared/cds-action-controls/cds-action-arrow/cds-action-arrow.component';
import { CdsActionControlsComponent } from './cds-dashboard/actions/shared/cds-action-controls/cds-action-controls/cds-action-controls.component';
import { CdsAddActionMenuComponent } from './cds-dashboard/actions/shared/cds-add-action-menu/cds-add-action-menu.component';

import { CdsFormComponent } from './cds-dashboard/actions/list/form/form.component';
import { CdsQuestionComponent } from './cds-dashboard/actions/list/question/question.component';
import { CdsAnswerComponent } from './cds-dashboard/actions/list/answer/answer.component';

import { AddkbDialogComponent } from './cds-dashboard/actions/list/cds-action-askgpt/addkb-dialog/addkb-dialog.component';

@NgModule({
  declarations: [
    CdsDashboardComponent,
    PanelReplyToolsComponent,
    ActionReplyComponent,
    ImageResponseComponent,
    FrameResponseComponent,
    ImageUploadComponent,
    PanelIntentListComponent,
    PanelIntentComponent,
    PanelActionsComponent,
    PanelIntentDetailComponent,
    PanelIntentHeaderComponent,
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
    CdsChatbotDetailsComponent,
    CdsSplashScreenComponent,
    ActionWaitComponent,
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
    // CdsFooterComponent,
    CdsPublishOnCommunityModalComponent,
    SelectComponent,
    BaseConditionRowComponent,
    BaseFilterComponent,
    VariableListComponent,
    TextEditableDivComponent,
    ActionWebRequestComponent,
    AttributesComponent,
    DialogComponent,
    ActionAssignFunctionComponent,
    DialogYesNoComponent,
    CdsHeaderComponent,
    CdsPopupComponent,
    CdsModalActivateBotComponent,
    CdsIntentComponent,
    CdsPanelElementsComponent,
    CdsPanelDetailComponent,
    CdsPanelActionsComponent,
    CdsPanelIntentListComponent,
    CdsFloatingMenuComponent,
    CdsAddActionMenuComponent,
    CdsConnectorComponent,
    
    //BASE ELEMENT
    CDSTextComponent,
    CDSFilterComponent,
    CDSTextareaComponent,
    CdsActionControlsComponent,
    CdsActionArrowComponent,
    CDSDelaySliderComponent,
    CDSImageUploadComponent,
    CDSElementFromUrlComponent,
    // ------ CDS-ACTIONS: start ------ //
    CdsActionDescriptionComponent,
    CdsActionReplyComponent,
    CdsActionWaitComponent,
    CdsActionAgentHandoffComponent,
    CdsActionOnlineAgentsComponent,
    CdsActionEmailComponent,
    CdsActionIntentComponent,
    CdsActionChangeDepartmentComponent,
    CdsActionCloseComponent,
    CdsActionOpenHoursComponent,
    CdsActionJsonConditionComponent,
    CdsActionDeleteVariableComponent,
    CdsActionReplaceBotComponent,
    CdsActionAssignVariableComponent,
    CdsActionHideMessageComponent,
    CdsActionWebRequestComponent,
    CdsActionWebRequestV2Component,
    CdsActionWhatsappAttributeComponent,
    CdsActionWhatsappStaticComponent,
    CdsWhatsappReceiverComponent,
    CdsActionAskgptComponent,
    // action REPLY elements: start //
    CdsActionReplyToolsComponent,
    CdsActionReplyTextComponent,
    CdsActionReplyImageComponent,
    CdsActionReplyFrameComponent,
    CdsActionReplyRedirectComponent,
    CdsActionReplyGalleryComponent,
    // action REPLY elements: end //
    // action ASSIGN-VARIABLE elements: start //
    OperationComponent,
    OperatorComponent,
    OperandComponent,
    // action ASSIGN-VARIABLE elements: end //
   
   
    // ------ CDS-ACTIONS: end ------ //
    CdsFormComponent,
    CdsQuestionComponent,
    CdsAnswerComponent,
    
    // ------ CDS PANELS ------ //
    CdsActionDetailPanelComponent,
    CdsPanelButtonConfigurationComponent,
    CdsPanelWidgetComponent,
    AddkbDialogComponent
  ],
  imports: [
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
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    MatInputModule,
    MatExpansionModule,
    MatDialogModule,
    MatTabsModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    SatPopoverModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    })
  ],
  providers: [
    // DragDropService
  ]
})
export class ChatbotDesignStudioModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}