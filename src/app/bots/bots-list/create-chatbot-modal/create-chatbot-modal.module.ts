import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateChatbotModalComponent } from './create-chatbot-modal.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    CreateChatbotModalComponent
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
  ],
  exports: [
    CreateChatbotModalComponent,
  ]
})
export class CreateChatbotModalModule { }
