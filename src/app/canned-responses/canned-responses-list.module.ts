import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CannedResponsesListComponent } from './canned-responses-list.component';
import { CannedResponsesAddEditComponent } from './canned-responses-add-edit/canned-responses-add-edit.component';
import { RouterModule ,Routes} from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { SettingsSidebarComponent } from 'app/components/settings-sidebar/settings-sidebar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: "", component: CannedResponsesListComponent},
]; 

@NgModule({
  declarations: [
    CannedResponsesListComponent,
    CannedResponsesAddEditComponent,
    
    
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    MatTooltipModule,
    TranslateModule,
    SettingsSidebarModule,
    FormsModule
  ]
})
export class CannedResponsesListModule { }
