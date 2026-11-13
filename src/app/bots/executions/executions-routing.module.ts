import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExecutionsListComponent } from './executions-list/executions-list.component';
import { ExecutionDetailComponent } from './execution-detail/execution-detail.component';

const routes: Routes = [
  { path: '', component: ExecutionsListComponent },
  { path: ':executionid', component: ExecutionDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExecutionsRoutingModule { }
