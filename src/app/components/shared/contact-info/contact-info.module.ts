import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactInfoComponent } from './contact-info.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    ContactInfoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgSelectModule,
    MatTooltipModule,
  ],
  exports: [
    ContactInfoComponent,
  ]
})
export class ContactInfoModule { }
