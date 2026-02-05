import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactDetailsComponent } from './contact-details.component';
import { RouterModule ,Routes} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { MomentModule } from 'ngx-moment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
// import { ContactInfoComponent } from 'app/components/shared/contact-info/contact-info.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ContactInfoModule } from 'app/components/shared/contact-info/contact-info.module';
import { UnauthorizedForSettingsModule } from 'app/auth/unauthorized-for-settings/unauthorized-for-settings.module';

const routes: Routes = [
  { path: "", component: ContactDetailsComponent},
];


@NgModule({
  declarations: [
    ContactDetailsComponent,
    // ContactInfoComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    MomentModule,
    MatTooltipModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    ContactInfoModule,
    UnauthorizedForSettingsModule
  ],
  exports: [
    RouterModule
  ]
})
export class ContactDetailsModule { }
