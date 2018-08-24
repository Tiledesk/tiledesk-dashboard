import { NgModule } from '@angular/core';

import { AuthService } from './auth.service';
import { AdminGuard } from './admin.guard';
import { NotifyService } from './notify.service';

import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

@NgModule({
  imports: [
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
  providers: [AuthService, NotifyService, AdminGuard],
})
export class CoreModule { }
