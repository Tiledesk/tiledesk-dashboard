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
import { MatTooltipModule }  from '@angular/material/tooltip';
import { MatButtonModule }  from '@angular/material/button';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatTooltipModule,
    MatButtonModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    SmallSidebarComponent,
    NavbarForPanelComponent
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    SmallSidebarComponent,
    NavbarForPanelComponent,
    TranslateModule
  ],
  providers: [
    NavbarForPanelService
  ]
})
export class ComponentsModule { }
