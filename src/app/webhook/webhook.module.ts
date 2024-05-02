import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WebhookComponent } from './webhook.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { WebhookAddEditComponent } from './webhook-add-edit/webhook-add-edit.component';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  { path: "", component: WebhookComponent},
];


@NgModule({
  declarations: [
    WebhookComponent,
    WebhookAddEditComponent
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
export class WebhookModule { }
