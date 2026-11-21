import { Component, Input } from '@angular/core';
import { monitorExecutionsLink } from '../execution-links';

export type AgentExecTab = 'agents' | 'executions';

/** Agenti | Esecuzioni. Agenti opens the agents list; Esecuzioni opens every execution. */
@Component({
  selector: 'agent-exec-tabs',
  templateUrl: './agent-exec-tabs.component.html',
  styleUrls: ['./agent-exec-tabs.component.scss']
})
export class AgentExecTabsComponent {
  @Input() projectId: string;
  @Input() active: AgentExecTab = 'agents';
  /** On the agents list the bar sits beside the actions and only as wide as the two tabs. */
  @Input() inline = false;

  get agentsLink(): string[] {
    return ['/project', this.projectId, 'bots', 'my-chatbots', 'all'];
  }

  get executionsLink(): string[] {
    return monitorExecutionsLink(this.projectId);
  }
}
