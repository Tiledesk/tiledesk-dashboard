import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ExecutionsModule } from './executions.module';
import { ExecutionGraphModule } from './graph/execution-graph.module';
import { ExecutionStatCardsModule } from './shared/execution-stat-cards.module';

const imports = (m: any): any[] => (m.ɵinj && m.ɵinj.imports || []).reduce((acc: any[], x: any) => acc.concat(Array.isArray(x) ? x : [x]), []);

/** The dropdowns are ng-select and the big numbers one shared component: each page's module must bring them. */
describe('executions modules', () => {
  it('ExecutionsModule imports NgSelectModule, FormsModule and the stat cards', () => {
    expect(imports(ExecutionsModule)).toContain(NgSelectModule);
    expect(imports(ExecutionsModule)).toContain(FormsModule);
    expect(imports(ExecutionsModule)).toContain(ExecutionStatCardsModule);
  });

  it('ExecutionsModule embeds the graph (its Graph view); the graph has no cards of its own', () => {
    expect(imports(ExecutionsModule)).toContain(ExecutionGraphModule);
    expect(imports(ExecutionGraphModule)).not.toContain(ExecutionStatCardsModule);
  });
});
