import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotsSidebarComponent } from './bots-sidebar.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    BotsSidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatTooltipModule,
  ], exports: [
    BotsSidebarComponent,
  ]
})
export class BotsSidebarModule { }
