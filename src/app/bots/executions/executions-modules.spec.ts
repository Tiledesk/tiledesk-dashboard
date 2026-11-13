import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ExecutionsModule } from './executions.module';
import { GraphPageModule } from './graph-page/graph-page.module';
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

  it('GraphPageModule imports NgSelectModule and FormsModule; the graph brings the stat cards', () => {
    expect(imports(GraphPageModule)).toContain(NgSelectModule);
    expect(imports(GraphPageModule)).toContain(FormsModule);
    expect(imports(ExecutionGraphModule)).toContain(ExecutionStatCardsModule);
  });
});
