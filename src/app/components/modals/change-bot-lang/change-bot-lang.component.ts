import { Component, Inject, OnChanges, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BotsBaseComponent } from 'app/bots/bots-base/bots-base.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { getIndexOfbotDefaultLanguages } from 'app/utils/util';
@Component({
  selector: 'appdashboard-change-bot-lang',
  templateUrl: './change-bot-lang.component.html',
  styleUrls: ['./change-bot-lang.component.scss']
})
// extends BotsBaseComponent
export class ChangeBotLangModalComponent  implements OnInit, OnChanges {
  botDefaultSelectedLangCode: string
  selectedDefaultBotLang: string
  intentsEngine: string;
  chatbotLanguages: any
  constructor(
    public dialogRef: MatDialogRef<ChangeBotLangModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public prjctPlanService: ProjectPlanService,
    ) {
    // super(prjctPlanService);
    console.log('[CHANGE-BOT-LANG] DATA ', data)
    this.chatbotLanguages = data.chatbotLanguages
    this.botDefaultSelectedLangCode = data.chatbot.language;
    this.selectedDefaultBotLang =  this.chatbotLanguages[getIndexOfbotDefaultLanguages(data.chatbot.language)].name;
    console.log('CHANGE-BOT-LANG DIALOG ', this.selectedDefaultBotLang)
    this.intentsEngine = data.chatbot.intentsEngine
  }

  ngOnInit(): void { }

  ngOnChanges() { }


  onSelectBotDefaultlang(selectedDefaultBotLang) {
   console.log('onSelectBotDefaultlang > selectedDefaultBotLang ', selectedDefaultBotLang)
    if (selectedDefaultBotLang) {
      this.selectedDefaultBotLang = selectedDefaultBotLang.name;
      this.botDefaultSelectedLangCode = selectedDefaultBotLang.code;
      console.log('[CHANGE-BOT-LANG] onSelectBotDefaultlang > selectedDefaultBotLang > lang', this.selectedDefaultBotLang)
    }
  }


  closeDialog() {
    this.dialogRef.close('close');
  }


  changeBotLanguage() {
    this.dialogRef.close(this.botDefaultSelectedLangCode);
  }


}
