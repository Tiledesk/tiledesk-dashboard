import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WsRequestsUnservedForPanelComponent } from './ws-requests-unserved-for-panel.component';
import { WsRequestDetailForPanelComponent } from '../ws-request-detail-for-panel/ws-request-detail-for-panel.component';
import { RouterModule ,Routes} from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MomentModule } from 'ngx-moment';

const routes: Routes = [
  { path: "", component: WsRequestsUnservedForPanelComponent},
];

@NgModule({
  declarations: [
    WsRequestsUnservedForPanelComponent,
    WsRequestDetailForPanelComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    MatTooltipModule,
    MomentModule,
  ]
})
export class WsRequestsUnservedForPanelModule { }
