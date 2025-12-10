import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContactsService } from 'app/services/contacts.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-add-new-contact-modal',
  templateUrl: './add-new-contact-modal.component.html',
  styleUrls: ['./add-new-contact-modal.component.scss']
})
export class AddNewContactModalComponent implements OnInit {
  
  public contactFullName: string
  public contactCreated: boolean = false
  public createdContact: any = null

  constructor(
     @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<AddNewContactModalComponent>,
      private logger: LoggerService,
      private contactsService: ContactsService
  ) { }

  ngOnInit(): void {
  }


  onOkPresssed(){
    this.createProjectUserAndThenNewLead();
  }

 createProjectUserAndThenNewLead() {
   
    console.log('[ADD-NEW-CONTACT] - NAME  ', this.contactFullName);
    // this.logger.log('[ADD-NEW-CONTACT] - CREATE-NEW-USER email ', this.new_user_email);


    this.contactsService.createNewProjectUserToGetNewLeadID().subscribe(res => {
      console.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-PROJECT-USER ', res);
      this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-PROJECT-USER UUID ', res['uuid_user']);
      if (res) {
        if (res['uuid_user']) {
          let new_lead_id = res['uuid_user']
          this.createNewContact(new_lead_id, this.contactFullName)
        }
      }
    }, error => {

      this.logger.error('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-PROJECT-USER - ERROR: ', error);
    }, () => {

      this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-PROJECT-USER - COMPLETE');
    });
  }

  createNewContact(lead_id: string, lead_name: string, lead_email?: string) {
    this.contactsService.createNewLeadWithoutEmail(lead_id, lead_name).subscribe(lead => {
      console.log('[ADD-NEW-CONTACT] - CREATE-NEW-LEAD -  RES ', lead);
      this.logger.log('[ADD-NEW-CONTACT] - CREATE-NEW-LEAD -  RES ', lead);
      
      // Salva il contatto creato e imposta lo stato di successo
      this.createdContact = lead;
      this.contactCreated = true;
    
    }, error => {
      this.logger.error('[ADD-NEW-CONTACT] - CREATE-NEW-LEAD - ERROR: ', error);
    }, () => {
      this.logger.log('[ADD-NEW-CONTACT] - CREATE-NEW-LEAD * COMPLETE *');
    });
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkAfterSuccess(): void {
    // Restituisce il contatto creato quando si chiude il dialog
    this.dialogRef.close(this.createdContact);
  }

}
