import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WsRequestsMsgsComponent } from './ws-requests-msgs.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { MomentModule } from 'ngx-moment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { WsSidebarAppsComponent } from './ws-sidebar-apps/ws-sidebar-apps.component';
import { ContactInfoModule } from 'app/components/shared/contact-info/contact-info.module';
import { RouterModule ,Routes} from '@angular/router';
import { SatPopoverModule } from '@ncstate/sat-popover';

const routes: Routes = [
  { path: "", component: WsRequestsMsgsComponent},
];


@NgModule({
  declarations: [
    WsRequestsMsgsComponent,
    // ContactInfoComponent,
    WsSidebarAppsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
    MomentModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    ContactInfoModule,
    SatPopoverModule
  ]
})
export class WsRequestsMsgsModule { }
