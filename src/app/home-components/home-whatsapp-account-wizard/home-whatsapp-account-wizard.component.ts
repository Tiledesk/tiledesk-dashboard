import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';


import { LoggerService } from 'app/services/logger/logger.service';


@Component({
  selector: 'appdashboard-home-whatsapp-account-wizard',
  templateUrl: './home-whatsapp-account-wizard.component.html',
  styleUrls: ['./home-whatsapp-account-wizard.component.scss']
})
export class HomeWhatsappAccountWizardComponent implements OnInit, OnChanges {

  @Output() goToConnectWA = new EventEmitter();
  // @Output() goToCreateChatbot = new EventEmitter();
  // @Output() hasTestedBotOnWa = new EventEmitter();
  // @Output() hasCreatedChatbot = new EventEmitter();
  // @Input() whatsAppIsConnected: boolean;
  // @Input() wadepartmentName: string;
  // @Input() chatbotConnectedWithWA: boolean;
  // @Input() waBotId: string;
  // @Input() botIdForTestWA: string;
  @Input() use_case_for_child: string;
  @Input() solution_channel_for_child: string;
  @Input() solution_for_child: string;
  
  // public projectID: string;
  constructor(
    private logger: LoggerService,

  ) { }

  ngOnInit(): void {
    // this.getCurrentProject()
    // this.getBots()
  }


  ngOnChanges() {
    
    this.logger.log('[HOME-WA-WIZARD] use_case_for_child ', this.use_case_for_child)
    this.logger.log('[HOME-WA-WIZARD] solution_channel_for_child ', this.solution_channel_for_child)
    this.logger.log('[HOME-WA-WIZARD] solution_for_child ', this.solution_for_child)
 
  
  }

  
 
  

  goToConnectWASection() {
    this.goToConnectWA.emit()
  }

  goToBookADemo() {
    this.logger.log('[HOME-WHATSAPP-ACCOUNT-WIZARD] goToBookADemo ' )
   const url = "https://go.oncehub.com/Jovana1"
   window.open(url, '_blank');
  }
  

  // testItOutWABot() {
  //   let tiledesk_phone_number = this.appConfigService.getConfig().tiledeskPhoneNumber;
  //   this.logger.log('[HOME-WHATSAPP-ACCOUNT-WIZARD] TEST IT OUT ' )
  //   let info = {
  //     project_id: this.projectID,
  //     bot_id: this.botIdForTestWA
  //   }

  //   this.logger.log("[HOME-WHATSAPP-ACCOUNT-WIZARD] TEST IT OUT WA BOT: ", info)

  //   this.multichannelService.getCodeForWhatsappTest(info).then((response: any) => {
  //     this.logger.log("[HOME-WHATSAPP-ACCOUNT-WIZARD]  GET CODE FOR WA TEST : ", response);
  //     // let code = "%23td" + response.short_uid;
  //     let text = "%23td" + response.short_uid + " Send me to start testing your bot";
  //     const testItOutOnWhatsappUrl = `https://api.whatsapp.com/send/?phone=${tiledesk_phone_number}&text=${text}&type=phone_number&app_absent=0`
  //     let left = (screen.width - 815) / 2;
  //     var top = (screen.height - 727) / 4;
  //     let params = `toolbar=no,menubar=no,width=815,height=727,left=${left},top=${top}`;
  //     window.open(testItOutOnWhatsappUrl, 'blank', params);
  //   }).catch((err) => {
  //    this.logger.error("[HOME-WHATSAPP-ACCOUNT-WIZARD] error getting testing code from whatsapp: ", err);
  //   })
  // }


  // getCurrentProject() {
  //   this.auth.project_bs.subscribe((project) => {
  //      if (project) {
  //        this.projectID = project._id
 
  //      }
  //    });
  //  }

}
