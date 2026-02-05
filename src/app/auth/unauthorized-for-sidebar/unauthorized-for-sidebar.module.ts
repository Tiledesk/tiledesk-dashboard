import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { UnauthorizedForSidebarComponent } from './unauthorized-for-sidebar.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "", component: UnauthorizedForSidebarComponent},
];

@NgModule({
  declarations: [
    UnauthorizedForSidebarComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
    SharedModule,
  ],
  exports: [
    UnauthorizedForSidebarComponent,
  ]
})
export class UnauthorizedForSidebarModule { }
