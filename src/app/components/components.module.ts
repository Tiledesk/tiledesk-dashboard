import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { SmallSidebarComponent } from './small-sidebar/small-sidebar.component';
import { NavbarForPanelComponent } from './navbar-for-panel/navbar-for-panel.component';
import { NavbarForPanelService } from './navbar-for-panel/navbar-for-panel.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SidebarUserDetailsComponent } from './sidebar-user-details/sidebar-user-details.component';
import {FormsModule} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { LoadingSpinnerComponent } from 'app/ui/loading-spinner/loading-spinner.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    NgSelectModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    SmallSidebarComponent,
    NavbarForPanelComponent,
    SidebarUserDetailsComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    SidebarUserDetailsComponent,
    SmallSidebarComponent,
    NavbarForPanelComponent,
    TranslateModule
  ],
  providers: [
    NavbarForPanelService

  ]
})
export class ComponentsModule { }
