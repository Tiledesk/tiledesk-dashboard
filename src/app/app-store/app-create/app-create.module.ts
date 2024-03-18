import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCreateComponent } from './app-create.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: "", component: AppCreateComponent},
];

@NgModule({
  declarations: [
    AppCreateComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    FormsModule
  ],
  exports: [
    RouterModule
  ]
})
export class AppCreateModule { }
