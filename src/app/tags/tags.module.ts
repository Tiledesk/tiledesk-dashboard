import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagsComponent } from './tags.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { TagsDeleteComponent } from './tags-delete/tags-delete.component';
import { TagsEditComponent } from './tags-edit/tags-edit.component';
import { MomentModule } from 'ngx-moment';

const routes: Routes = [
  { path: "", component: TagsComponent},
];

@NgModule({
  declarations: [
    TagsComponent,
    TagsDeleteComponent,
    TagsEditComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SettingsSidebarModule,
    SharedModule,
    FormsModule,
    MomentModule,
    // NgSelectModule
  ]
})
export class TagsModule { }
