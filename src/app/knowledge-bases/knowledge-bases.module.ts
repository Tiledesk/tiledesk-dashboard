import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnowledgeBasesComponent } from './knowledge-bases.component';
import { AddContentMenuComponent } from './menu/add-content-menu/add-content-menu.component';
import { KnowledgeBaseTableComponent } from './modals/knowledge-base-table/knowledge-base-table.component';
import { ModalDeleteKnowledgeBaseComponent } from './modals/modal-delete-knowledge-base/modal-delete-knowledge-base.component';
import { ModalDetailKnowledgeBaseComponent } from './modals/modal-detail-knowledge-base/modal-detail-knowledge-base.component';
import { ModalErrorComponent } from './modals/modal-error/modal-error.component';
import { ModalGptKeyComponent } from './modals/modal-gpt-key/modal-gpt-key.component';
import { ModalPageUrlComponent } from './modals/modal-page-url/modal-page-url.component';
import { ModalPreviewKnowledgeBaseComponent } from './modals/modal-preview-knowledge-base/modal-preview-knowledge-base.component';
import { ModalSiteMapComponent } from './modals/modal-site-map/modal-site-map.component';
import { ModalTextFileComponent } from './modals/modal-text-file/modal-text-file.component';
import { ModalUrlsKnowledgeBaseComponent } from './modals/modal-urls-knowledge-base/modal-urls-knowledge-base.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { BotsSidebarModule } from 'app/bots/bots-list/bots-sidebar/bots-sidebar.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MomentModule } from 'ngx-moment';
import { ModalDeleteNamespaceComponent } from './modals/modal-delete-namespace/modal-delete-namespace.component';
import { ModalPreviewSettingsComponent } from './modals/modal-preview-settings/modal-preview-settings.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ModalAddNamespaceComponent } from './modals/modal-add-namespace/modal-add-namespace.component';
import { ModalUploadFileComponent } from './modals/modal-upload-file/modal-upload-file.component';
import { ModalChatbotNameComponent } from './modals/modal-chatbot-name/modal-chatbot-name.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModalHookBotComponent } from './modals/modal-hook-bot/modal-hook-bot.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ModalNsLimitReachedComponent } from './modals/modal-ns-limit-reached/modal-ns-limit-reached.component';
import { ModalConfirmGotoCdsComponent } from './modals/modal-confirm-goto-cds/modal-confirm-goto-cds.component';
import { SatPopoverModule } from '@ncstate/sat-popover';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { ModalFaqsComponent } from './modals/modal-faqs/modal-faqs.component';

const routes: Routes = [
  { path: "", component: KnowledgeBasesComponent},
];

@NgModule({
  declarations: [
    KnowledgeBasesComponent,
    AddContentMenuComponent,
    KnowledgeBaseTableComponent,
    ModalDeleteKnowledgeBaseComponent,
    ModalDetailKnowledgeBaseComponent,
    ModalErrorComponent,
    ModalGptKeyComponent,
    ModalPageUrlComponent,
    ModalPreviewKnowledgeBaseComponent,
    ModalSiteMapComponent,
    ModalTextFileComponent,
    ModalFaqsComponent,
    ModalUrlsKnowledgeBaseComponent,
    ModalDeleteNamespaceComponent,
    ModalPreviewSettingsComponent,
    ModalAddNamespaceComponent,
    ModalUploadFileComponent,
    ModalChatbotNameComponent,
    ModalHookBotComponent,
    ModalNsLimitReachedComponent,
    ModalConfirmGotoCdsComponent
  ],
  imports: [
    ClipboardModule,
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule ,
    NgSelectModule,
    BotsSidebarModule,
    SharedModule,
    TranslateModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    MomentModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    SatPopoverModule,
    MatChipsModule,
    MatSelectModule
  ]
  // ,
  // providers: [
  //   {
  //     provide: HIGHLIGHT_OPTIONS,
  //     useValue: {
  //       fullLibraryLoader: () => import('highlight.js'),
  //       themePath: 'assets/styles/solarized-dark.css'
  //     }
  //   }
    // { provide: MAT_DIALOG_DATA, useValue: {} },
    // { provide: MatDialogRef, useValue: {} }
  // ]
})
export class KnowledgeBasesModule { }
