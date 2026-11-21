import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AgentExecTabsComponent } from './agent-exec-tabs.component';

@NgModule({
  declarations: [AgentExecTabsComponent],
  imports: [CommonModule, RouterModule, TranslateModule],
  exports: [AgentExecTabsComponent]
})
export class AgentExecTabsModule { }
