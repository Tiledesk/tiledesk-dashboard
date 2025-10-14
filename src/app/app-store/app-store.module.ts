import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStoreComponent } from './app-store.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { UnauthorizedForSettingsModule } from 'app/auth/unauthorized-for-settings/unauthorized-for-settings.module';


const routes: Routes = [
  { path: "", component: AppStoreComponent},
];

@NgModule({
  declarations: [
    AppStoreComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    MatTooltipModule,
    SettingsSidebarModule,
    UnauthorizedForSettingsModule
  ],
  exports: [
    RouterModule
  ]
})
export class AppStoreModule { }
