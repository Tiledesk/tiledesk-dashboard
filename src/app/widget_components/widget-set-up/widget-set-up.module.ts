import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WidgetSetUp } from './widget-set-up.component';
import { WidgetCalloutComponent } from 'app/widget-callout/widget-callout.component';
import { WidgetHomeComponent } from 'app/widget-home-preview/widget-home.component';
import { WidgetChatComponent } from 'app/widget-chat/widget-chat.component';
import { WidgetPrechatFormComponent } from 'app/widget-prechat-form/widget-prechat-form.component';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSidebarComponent } from 'app/components/settings-sidebar/settings-sidebar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';

const routes: Routes = [
  { path: "", component: WidgetSetUp},
]; 

@NgModule({
  declarations: [
    WidgetSetUp,
    WidgetCalloutComponent,
    WidgetHomeComponent,
    WidgetChatComponent,
    WidgetPrechatFormComponent,
    // SettingsSidebarComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    TranslateModule,
    NgSelectModule,
    // ColorPickerModule,
    FormsModule,
    MatTooltipModule,
    SettingsSidebarModule
  ],
   exports: [
    // ColorPickerModule
  ]
})
export class WidgetSetUpModule { }
