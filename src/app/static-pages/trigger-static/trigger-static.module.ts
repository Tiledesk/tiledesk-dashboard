import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerStaticComponent } from './trigger-static.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: "", component: TriggerStaticComponent},
];


@NgModule({
  declarations: [
    TriggerStaticComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
  ]
})
export class TriggerStaticModule { }
