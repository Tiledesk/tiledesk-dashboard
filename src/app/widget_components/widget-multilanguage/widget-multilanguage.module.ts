import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetMultilanguageComponent } from './widget-multilanguage.component';
import { BaseTranslationComponent } from './base-translation/base-translation.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  { path: "", component: WidgetMultilanguageComponent},
];

@NgModule({
  declarations: [
    WidgetMultilanguageComponent,
    BaseTranslationComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    FormsModule,
    NgSelectModule
  ]
})
export class WidgetMultilanguageModule { }
