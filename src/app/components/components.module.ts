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
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSnackBarModule

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
    NavbarForPanelService,

  ]
})
export class ComponentsModule { }
