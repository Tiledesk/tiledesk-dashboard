import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-create-chatbot-modal',
  templateUrl: './create-chatbot-modal.component.html',
  styleUrls: ['./create-chatbot-modal.component.scss']
})
export class CreateChatbotModalComponent implements OnInit {
  public chatbotName: string;
  public botSubType: string;
  myControl = new FormControl('');
  namespaces: [];
  namespace_id: string;
  automationCopilotIsAvailable: boolean;
  automationCopilotIsEnabled: boolean;
  t_params: any;
  salesEmail: string;
  project_name: string;
  currentProjectId: string;
  isVisiblePAY: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateChatbotModalComponent>,
    private translate: TranslateService,
    private logger: LoggerService,
    private kbService: KnowledgeBaseService,
  ) {
    this.logger.log('[Create-chatbot-modal] data:', data)
    this.logger.log('[Create-chatbot-modal] data automationCopilotIsEnabled:', data.automationCopilotIsEnabled)
    if (data ) {
      this.botSubType = data.subtype;
      this.automationCopilotIsAvailable = data.automationCopilotIsAvailable;
      if (this.automationCopilotIsAvailable === false) {
        this.myControl.disable();
      }
      
      this.automationCopilotIsEnabled = data.automationCopilotIsEnabled;
      this.logger.log('[Create-chatbot-modal] automationCopilotIsEnabled:', this.automationCopilotIsEnabled);

      if (this.automationCopilotIsEnabled === false) {
        this.myControl.disable();
      }

       this.t_params = data.t_params;
       this.salesEmail = data.salesEmail;
       this.project_name = data.project_name;
       this.currentProjectId = data.currentProjectId
       this.isVisiblePAY = data.isVisiblePAY
    }
  }

  ngOnInit(): void {

    if (this.botSubType === 'copilot') {
      this.getAllNamespaces()
    }

    this.myControl.valueChanges.subscribe(value => {

      // this.logger.log('Selected Knowledge Base ID:', value['id']);
      this.namespace_id = value['id']
      this.logger.log('[Create-chatbot-modal] Selected Namespace ID:', this.namespace_id);
    });
  }


  getAllNamespaces() {
    this.kbService.getAllNamespaces().subscribe((res: any) => {
      if (res) {

        this.logger.log('[Create-chatbot-modal] - GET ALL NAMESPACES', res);
        this.namespaces = res
      }
    }, (error) => {
      this.logger.error('[Create-chatbot-modal]  GET GET ALL NAMESPACES ERROR ', error);

    }, () => {
      this.logger.log('[Create-chatbot-modal]  GET ALL NAMESPACES * COMPLETE *');

    });
  }

  displayFn(kb): string {
    return kb?.name || '';
  }

  goToPricing() {
    this.dialogRef.close('upgrade-plan');
  }

  onOkPresssed(chatbotName) {
    this.dialogRef.close({ 'chatbotName': chatbotName, 'subType': this.botSubType, 'namespace_id': this.namespace_id });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  contacUsViaEmail() {
    this.dialogRef.close();
    window.open(`mailto:${this.salesEmail}?subject=Enable Copilot Automation for project ${this.project_name} (${this.currentProjectId})`);
  }

}
