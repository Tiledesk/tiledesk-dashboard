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


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
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
