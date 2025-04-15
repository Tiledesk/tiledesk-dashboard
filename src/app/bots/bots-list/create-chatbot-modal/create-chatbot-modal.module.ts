import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateChatbotModalComponent } from './create-chatbot-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';



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
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  exports: [
    CreateChatbotModalComponent,
  ]
})
export class CreateChatbotModalModule { }
