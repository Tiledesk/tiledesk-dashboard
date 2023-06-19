import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HomeWhatsappAccountWizardModalComponent } from './home-whatsapp-account-wizard-modal/home-whatsapp-account-wizard-modal.component';


@Component({
  selector: 'appdashboard-home-whatsapp-account-wizard',
  templateUrl: './home-whatsapp-account-wizard.component.html',
  styleUrls: ['./home-whatsapp-account-wizard.component.scss']
})
export class HomeWhatsappAccountWizardComponent implements OnInit {
   
  @Output() goToConnectWA = new EventEmitter();
  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  // background-color: rgba(0,0,0,.4);
  connectWatsapp() {
    const elemHomeMainContent = <HTMLElement>document.querySelector('.home-main-content');
    console.log('[HOME-WA-WIZARD] elemHomeMainContent ', elemHomeMainContent)
    const elemHomeMainContentHeight = elemHomeMainContent.offsetHeight;
    console.log('[HOME-WA-WIZARD] elemHomeMainContent Height', elemHomeMainContentHeight)
  }

  presentModalConnectWAfirstStep() {
    this.goToConnectWA.emit()


    

    // console.log('[CONTACT-INFO] - ADD CONTACT PROPERTY ');
    // const dialogRef = this.dialog.open(HomeWhatsappAccountWizardModalComponent, {
 
    // })

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result:`, result);

    //   if (result === 'go-to-next-step') {
    //     this.goToConnectWA.emit()
    //   }

    // });
  }
 
      

}
