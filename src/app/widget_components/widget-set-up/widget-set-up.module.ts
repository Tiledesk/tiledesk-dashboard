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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { UnauthorizedForSettingsComponent } from 'app/auth/unauthorized-for-settings/unauthorized-for-settings.component';
import { UnauthorizedForSettingsModule } from 'app/auth/unauthorized-for-settings/unauthorized-for-settings.module';
import { WidgetDomainsWithelistModalComponent } from '../widget-domains-withelist-modal/widget-domains-withelist-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';


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
    WidgetDomainsWithelistModalComponent
    // UnauthorizedForSettingsComponent
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
    SettingsSidebarModule,
    UnauthorizedForSettingsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
   exports: [
    // ColorPickerModule
  ]
})
export class WidgetSetUpModule { }
