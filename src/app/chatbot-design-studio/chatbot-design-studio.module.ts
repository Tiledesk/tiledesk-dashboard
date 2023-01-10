import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';

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
import { ActionSendEmailComponent } from './cds-dashboard/panel-intent-detail/actions/action-send-email/action-send-email.component';
import { QuestionComponent } from './cds-dashboard/panel-intent-detail/question/question.component';
import { AnswerComponent } from './cds-dashboard/panel-intent-detail/answer/answer.component';
import { FormComponent } from './cds-dashboard/panel-intent-detail/form/form.component';
import { FormFieldComponent } from './cds-dashboard/panel-intent-detail/form/form-field/form-field.component';
import { FormEditAddComponent } from './cds-dashboard/panel-intent-detail/form/form-edit-add/form-edit-add.component';
import { ModalWindowComponent } from './cds-dashboard/panel-intent-detail/form/modal-window/modal-window.component';



@NgModule({
  declarations: [
    CdsDashboardComponent,
    PanelReplyToolsComponent,
    ActionReplyComponent,
    TextResponseComponent,
    DelaySliderComponent,
    // ButtonConfigurationPanelComponent,
    ImageResponseComponent,
    FrameResponseComponent,
    ImageUploadComponent,
    PanelIntentListComponent,
    PanelIntentComponent,
    PanelActionsComponent,
    PanelIntentDetailComponent,
    PanelIntentHeaderComponent,
    PanelButtonConfigurationComponent,
    ElementFromUrlComponent,
    ActionSendEmailComponent, 
    QuestionComponent,
    AnswerComponent, 
    FormComponent,
    FormFieldComponent,
    FormEditAddComponent,
    ModalWindowComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    NgSelectModule,
    TextFieldModule,
    MatSliderModule,
    MatSidenavModule,
    MatSelectModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    MatInputModule,
    MatExpansionModule,
  ]
})
export class ChatbotDesignStudioModule { }