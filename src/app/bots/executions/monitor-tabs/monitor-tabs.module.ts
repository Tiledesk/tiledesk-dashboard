import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MonitorTabsComponent } from './monitor-tabs.component';

@NgModule({
  declarations: [MonitorTabsComponent],
  imports: [CommonModule, RouterModule, TranslateModule],
  exports: [MonitorTabsComponent],
})
export class MonitorTabsModule { }
