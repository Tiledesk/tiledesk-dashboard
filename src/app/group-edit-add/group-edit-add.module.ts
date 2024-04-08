import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupEditAddComponent } from './group-edit-add.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'app/shared/shared.module';

const routes: Routes = [
  { path: "", component: GroupEditAddComponent },
];

@NgModule({
  declarations: [
    GroupEditAddComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    FormsModule,
    SharedModule,
  ]
})
export class GroupEditAddModule { }
