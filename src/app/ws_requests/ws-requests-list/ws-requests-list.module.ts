import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WsRequestsListComponent } from './ws-requests-list.component';
import { WsRequestsServedComponent } from './ws-requests-served/ws-requests-served.component';
import { WsRequestsUnservedComponent } from './ws-requests-unserved/ws-requests-unserved.component';
import { RouterModule ,Routes} from '@angular/router';
import { TooltipModule, TooltipOptions } from 'ng2-tooltip-directive';
import { CutomTooltipOptions } from 'app/utils/util';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentModule } from 'ngx-moment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MapRequestComponent } from 'app/map-request/map-request.component';
import { MatMenuModule } from '@angular/material/menu';


const routes: Routes = [
  { path: "", component: WsRequestsListComponent},
];

@NgModule({
  declarations: [
    WsRequestsListComponent,
    WsRequestsServedComponent,
    WsRequestsUnservedComponent,
    MapRequestComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    TooltipModule,
    CommonModule,
    MatTooltipModule,
    TranslateModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatDatepickerModule,
    MomentModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class WsRequestsListModule { }
