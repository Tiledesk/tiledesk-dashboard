import { NgModule } from '@angular/core';

import { CheckboxMaterialMarkupDirective } from './checkbox-material-markup/checkbox-material-markup.directive';


@NgModule({
    declarations: [
        CheckboxMaterialMarkupDirective,
    ],
    imports     : [],
    exports     : [
        CheckboxMaterialMarkupDirective,
    ]
})
export class DirectivesModule
{
}
