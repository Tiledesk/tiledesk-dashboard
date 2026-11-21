import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AgentExecTabsComponent } from './agent-exec-tabs.component';

describe('AgentExecTabsComponent', () => {
  let fixture: ComponentFixture<AgentExecTabsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgentExecTabsComponent],
      imports: [TranslateModule.forRoot(), RouterTestingModule],
    });
    fixture = TestBed.createComponent(AgentExecTabsComponent);
    fixture.componentInstance.projectId = 'p1';
  });

  function labels(): string[] {
    fixture.detectChanges();
    return Array.from(fixture.nativeElement.querySelectorAll('.agent-tabs a'))
      .map((a: HTMLAnchorElement) => a.textContent.trim());
  }

  it('links Agenti to the agents list and Esecuzioni to every execution', () => {
    fixture.componentInstance.active = 'agents';
    expect(labels()).toEqual(['Agents', 'Executions.Executions']);
    expect(fixture.componentInstance.agentsLink).toEqual(['/project', 'p1', 'bots', 'my-chatbots', 'all']);
    expect(fixture.componentInstance.executionsLink).toEqual(['/project', 'p1', 'monitor', 'executions']);
    expect(fixture.nativeElement.querySelector('.agent-tab--active a').textContent.trim()).toBe('Agents');
  });

  it('marks Esecuzioni active on the executions pages', () => {
    fixture.componentInstance.active = 'executions';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.agent-tab--active a').textContent.trim()).toBe('Executions.Executions');
  });
});
