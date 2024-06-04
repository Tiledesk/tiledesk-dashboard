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
    ModalUrlsKnowledgeBaseComponent,
    ModalDeleteNamespaceComponent,
    ModalPreviewSettingsComponent
  ],
  imports: [
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
    MomentModule
  ]
})
export class KnowledgeBasesModule { }
