import { NgModule } from '@angular/core';

import { PerfectScrollbarTdDirective } from './td-perfect-scrollbar/perfect-scrollbar-td.directive';


@NgModule({
    declarations: [
        PerfectScrollbarTdDirective,
    
    ],
    imports     : [],
    exports     : [
        PerfectScrollbarTdDirective,
      
    ]
})
export class DirectivesModule
{
}
