import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { AppStoreInstallComponent } from './app-store-install.component';
import { RouterModule ,Routes} from '@angular/router';

const routes: Routes = [
  { path: "", component: AppStoreInstallComponent},
];

@NgModule({
  declarations: [
    AppStoreInstallComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
  ],
  exports: [
    RouterModule
  ]
})
export class AppStoreInstallModule { }
