import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnowledgeBasesPreviousComponent } from './knowledge-bases-previous.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MomentModule } from 'ngx-moment';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: "", component: KnowledgeBasesPreviousComponent},
];

@NgModule({
  declarations: [
    KnowledgeBasesPreviousComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,  
    MatTooltipModule,
    MomentModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class KnowledgeBasesPreviousModule { }
