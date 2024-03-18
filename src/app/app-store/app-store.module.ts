import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStoreComponent } from './app-store.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MomentModule } from 'ngx-moment';

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
    NgSelectModule,
    MomentModule,
  ],
  exports: [
    RouterModule
  ]
})
export class AppStoreModule { }
