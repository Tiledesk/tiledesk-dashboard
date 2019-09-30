import { NgModule } from '@angular/core';

import { AuthService } from './auth.service';
import { AdminGuard } from './admin.guard';
import { NotifyService } from './notify.service';


@NgModule({
  imports: [],
  providers: [
    AuthService,
    NotifyService,
    AdminGuard
  ],
})
export class CoreModule { }
