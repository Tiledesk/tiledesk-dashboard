import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsSidebarComponent } from './settings-sidebar.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    SettingsSidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatTooltipModule,
  ],
  exports: [
    SettingsSidebarComponent,
  ]
})
export class SettingsSidebarModule { }
