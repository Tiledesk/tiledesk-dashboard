import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { SmallSidebarComponent } from './small-sidebar/small-sidebar.component';


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
    SmallSidebarComponent
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    SmallSidebarComponent,
    TranslateModule
  ]
})
export class ComponentsModule { }
