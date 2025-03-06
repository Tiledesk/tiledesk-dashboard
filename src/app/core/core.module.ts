import { NgModule } from '@angular/core';

import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';
import { SsoService } from './sso.service';


@NgModule({
  imports: [],
  providers: [
    AuthService,
    NotifyService,
    SsoService
  ],
})
export class CoreModule { }
