import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChatbotAlertComponent } from './chatbot-alert.component';
import { SharedModule } from 'app/shared/shared.module';



@NgModule({
  declarations: [
    ChatbotAlertComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SharedModule
  ],
  exports: [
    ChatbotAlertComponent,
  ]
})
export class ChatbotAlertModule { }
