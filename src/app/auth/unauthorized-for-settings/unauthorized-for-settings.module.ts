import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { UnauthorizedForSettingsComponent } from './unauthorized-for-settings.component';



@NgModule({
  declarations: [
    UnauthorizedForSettingsComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
  ],
    exports: [
      UnauthorizedForSettingsComponent,
    ]
})
export class UnauthorizedForSettingsModule { }
