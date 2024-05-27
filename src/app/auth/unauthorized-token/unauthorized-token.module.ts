import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedTokenComponent } from './unauthorized-token.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: "", component: UnauthorizedTokenComponent},
];

@NgModule({
  declarations: [
    UnauthorizedTokenComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
  ]
})


export class UnauthorizedTokenModule { }
