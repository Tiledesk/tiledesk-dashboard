import { NgModule } from '@angular/core';

import { AuthService } from './auth.service';
import { AdminGuard } from './admin.guard';
import { NotifyService } from './notify.service';
import { SsoService } from './sso.service';


@NgModule({
  imports: [],
  providers: [
    AuthService,
    NotifyService,
    AdminGuard,
    SsoService
  ],
})
export class CoreModule { }
