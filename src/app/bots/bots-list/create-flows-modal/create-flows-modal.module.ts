import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateFlowsModalComponent } from './create-flows-modal.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';



@NgModule({
  declarations: [
    CreateFlowsModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SharedModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRippleModule
  ],
  exports: [
    CreateFlowsModalComponent,
  ]
})
export class CreateFlowsModalModule { }
