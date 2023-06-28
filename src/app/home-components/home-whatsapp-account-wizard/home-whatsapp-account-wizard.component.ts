import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HomeWhatsappAccountWizardModalComponent } from './home-whatsapp-account-wizard-modal/home-whatsapp-account-wizard-modal.component';


@Component({
  selector: 'appdashboard-home-whatsapp-account-wizard',
  templateUrl: './home-whatsapp-account-wizard.component.html',
  styleUrls: ['./home-whatsapp-account-wizard.component.scss']
})
export class HomeWhatsappAccountWizardComponent implements OnInit, OnChanges {
   
  @Output() goToConnectWA = new EventEmitter();
  @Output() goToCreateChatbot = new EventEmitter();
  @Input() whatsAppIsConnected: boolean; 
  @Input() wadepartmentName: string; 
  @Input() chatbotConnectedWithWA: boolean; 
  @Input() waBotId: string; 
  @Input() use_case_for_child: string; 
  @Input() solution_channel_for_child: string; 
  @Input() solution_for_child: string; 
  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log('[HOME-WA-WIZARD] whatsAppIsConnected ', this.whatsAppIsConnected)
    console.log('[HOME-WA-WIZARD] wadepartmentName ', this.wadepartmentName)
    console.log('[HOME-WA-WIZARD] chatbotConnectedWithWA ', this.chatbotConnectedWithWA)
    console.log('[HOME-WA-WIZARD] waBotId ', this.waBotId)
    console.log('[HOME-WA-WIZARD] use_case_for_child ', this.use_case_for_child)
    console.log('[HOME-WA-WIZARD] solution_channel_for_child ', this.solution_channel_for_child)
    console.log('[HOME-WA-WIZARD] solution_for_child ', this.solution_for_child)
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
    const dialogRef = this.dialog.open(HomeWhatsappAccountWizardModalComponent, {
      width: '600px',
      data: {
        calledBy: 'step3',
        waBotId: this.waBotId
      },
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result:`, result);

      if (result === 'go-to-next-step') {
        // this.goToCreateChatbot.emit()
      }
    });
  }

  
      

}
