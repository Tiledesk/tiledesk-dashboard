import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { MultichannelService } from 'app/services/multichannel.service';
import { HomeWhatsappAccountWizardModalComponent } from './home-whatsapp-account-wizard-modal/home-whatsapp-account-wizard-modal.component';


@Component({
  selector: 'appdashboard-home-whatsapp-account-wizard',
  templateUrl: './home-whatsapp-account-wizard.component.html',
  styleUrls: ['./home-whatsapp-account-wizard.component.scss']
})
export class HomeWhatsappAccountWizardComponent implements OnInit, OnChanges {

  @Output() goToConnectWA = new EventEmitter();
  @Output() goToCreateChatbot = new EventEmitter();
  @Output() hasTestedBotOnWa = new EventEmitter();
  @Input() whatsAppIsConnected: boolean;
  @Input() wadepartmentName: string;
  @Input() chatbotConnectedWithWA: boolean;
  @Input() waBotId: string;
  @Input() use_case_for_child: string;
  @Input() solution_channel_for_child: string;
  @Input() solution_for_child: string;
  @Input() testBotOnWA: boolean;
  
  public thereIsALeastOneBot: boolean = false;
  public projectID: string;
  constructor(
    public dialog: MatDialog,
    private faqKbService: FaqKbService,
    private multichannelService: MultichannelService,
    private auth: AuthService,
    public appConfigService: AppConfigService,
  ) { }

  ngOnInit(): void {
    this.getCurrentProject()
    this.getBots()
  }


  ngOnChanges() {
    console.log('[HOME-WA-WIZARD] whatsAppIsConnected ', this.whatsAppIsConnected)
    console.log('[HOME-WA-WIZARD] wadepartmentName ', this.wadepartmentName)
    console.log('[HOME-WA-WIZARD] chatbotConnectedWithWA ', this.chatbotConnectedWithWA)
    console.log('[HOME-WA-WIZARD] waBotId ', this.waBotId)
    console.log('[HOME-WA-WIZARD] use_case_for_child ', this.use_case_for_child)
    console.log('[HOME-WA-WIZARD] solution_channel_for_child ', this.solution_channel_for_child)
    console.log('[HOME-WA-WIZARD] solution_for_child ', this.solution_for_child)
    console.log('[HOME-WA-WIZARD] testBotOnWA ', this.testBotOnWA)
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
       if (project) {
         this.projectID = project._id
 
       }
     });
   }
 
  getBots() {
    this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {
      console.log('[HOME-WA-WIZARD] - GET BOTS (OnInit) RES', bots);

      if (bots) {
        if (bots.length > 0) {
          this.thereIsALeastOneBot = true;
          console.log('[HOME-WA-WIZARD] - GET BOTS (OnInit) THERE IS AT LEAST ONE BOT', this.thereIsALeastOneBot);
        } else {
          this.thereIsALeastOneBot = false;
          console.log('[HOME-WA-WIZARD] - GET BOTS (OnInit) THERE IS AT LEAST ONE BOT', this.thereIsALeastOneBot);
          
        }
      }

    }, (error) => {
      console.error('[HOME-WA-WIZARD] - GET BOTS (OnInit) - ERROR ', error);

    }, () => {
      console.log('[HOME-WA-WIZARD] - GET BOTS (OnInit) * COMPLETE *');
    });
  }

 

  // background-color: rgba(0,0,0,.4);
  connectWatsapp() {
    const elemHomeMainContent = <HTMLElement>document.querySelector('.home-main-content');
    console.log('[HOME-WA-WIZARD] elemHomeMainContent ', elemHomeMainContent)
    const elemHomeMainContentHeight = elemHomeMainContent.offsetHeight;
    console.log('[HOME-WA-WIZARD] elemHomeMainContent Height', elemHomeMainContentHeight)
  }

  presentModalConnectWAfirstStep() {
    // this.goToConnectWA.emit()

    console.log('[HOME-WA-WIZARD] - presentModalConnectWAfirstStep ');
    const dialogRef = this.dialog.open(HomeWhatsappAccountWizardModalComponent, {
      width: '600px',
      data: {
        calledBy: 'step1'
      },
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result:`, result);

      if (result === 'go-to-next-step') {
        this.goToConnectWA.emit()
      }
    });
  }

  presentModalCreateChatbotOnWaChannel() {
    this.goToCreateChatbot.emit()
    console.log('[HOME-WA-WIZARD] - presentModalCreateChatbotOnWaChannel ');
    // const dialogRef = this.dialog.open(HomeWhatsappAccountWizardModalComponent, {
    //   width: '600px',
    //   data: {
    //     calledBy: 'step2',
    //     waDeptName: this.wadepartmentName
    //   },
    // })

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result:`, result);

    //   if (result === 'go-to-next-step') {
    //     this.goToCreateChatbot.emit()
    //   }
    // });
  }


  presentModalTestWABot() {
    console.log('[HOME-WA-WIZARD] - presentModalTestWABot ');
    this.testItOutWABot()
    // const dialogRef = this.dialog.open(HomeWhatsappAccountWizardModalComponent, {
    //   width: '600px',
    //   data: {
    //     calledBy: 'step3',
    //     waBotId: this.waBotId
    //   },
    // })

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result:`, result);

    //   if (result === 'go-to-next-step') {
    //     // this.goToCreateChatbot.emit()
    //   }
    // });
  }

  testItOutWABot() {
    this.hasTestedBotOnWa.emit()
    this.testBotOnWA = true;
    let tiledesk_phone_number = this.appConfigService.getConfig().tiledeskPhoneNumber;
    console.log('[HOME-WHATSAPP-ACCOUNT-WIZARD] TEST IT OUT ' )
    let info = {
      project_id: this.projectID,
      bot_id: this.waBotId
    }

    console.log("[HOME-WHATSAPP-ACCOUNT-WIZARD] TEST IT OUT WA BOT: ", info)

    this.multichannelService.getCodeForWhatsappTest(info).then((response: any) => {
      console.log("[HOME-WHATSAPP-ACCOUNT-WIZARD]  GET CODE FOR WA TEST : ", response);
      // let code = "%23td" + response.short_uid;
      let text = "%23td" + response.short_uid + " Send me to start testing your bot";
      const testItOutOnWhatsappUrl = `https://api.whatsapp.com/send/?phone=${tiledesk_phone_number}&text=${text}&type=phone_number&app_absent=0`
      let left = (screen.width - 815) / 2;
      var top = (screen.height - 727) / 4;
      let params = `toolbar=no,menubar=no,width=815,height=727,left=${left},top=${top}`;
      window.open(testItOutOnWhatsappUrl, 'blank', params);
    }).catch((err) => {
     console.error("[HOME-WHATSAPP-ACCOUNT-WIZARD] error getting testing code from whatsapp: ", err);
    })
  }


  goToBookADemo() {
    console.log('[HOME-WHATSAPP-ACCOUNT-WIZARD] goToBookADemo ' )
   const url = "https://go.oncehub.com/Jovana1"
   window.open(url, '_blank');
  }


}
