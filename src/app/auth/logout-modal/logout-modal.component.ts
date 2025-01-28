import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
@Component({
  selector: 'appdashboard-logout-modal',
  templateUrl: './logout-modal.component.html',
  styleUrls: ['./logout-modal.component.scss']
})
export class LogoutModalComponent implements OnInit {
  myAvailabilityCount: number;
  tparams: any;
  calledby: string
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LogoutModalComponent>,
    private logger: LoggerService,
    private projectService: ProjectService,
    public brandService: BrandService,
  ) { 
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.logger.log('[LOGOUT-MODAL] data ', data)
    if (data && data.calledby) {
      this.calledby = data.calledby
    }
  }

  ngOnInit(): void {
    this.getProjects()
  }

  getProjects() {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[LOGOUT-MODAL] - GET PROJECTS ', projects);

      if (projects) {
       
        let countOfcurrentUserAvailabilityInProjects = 0


        projects.forEach(project => {
          this.logger.log('[LOGOUT-MODAL] - SET PROJECT IN STORAGE > project ', project)
    
            /***  ADDED TO KNOW IF THE CURRENT USER IS AVAILABLE IN SOME PROJECT
             *    ID USED TO DISPLAY OR NOT THE MSG 'Attention, if you don't want to receive requests...' IN THE LOGOUT MODAL  ***/
            if (project.user_available === true) {
              countOfcurrentUserAvailabilityInProjects = countOfcurrentUserAvailabilityInProjects + 1;
            }
          // }
        });
        this.logger.log('[LOGOUT-MODAL] - GET PROJECTS AFTER', projects);

        this.myAvailabilityCount = countOfcurrentUserAvailabilityInProjects;
        this.projectService.countOfMyAvailability(this.myAvailabilityCount);
        this.logger.log('[LOGOUT-MODAL] - GET PROJECTS - I AM AVAILABLE IN # ', this.myAvailabilityCount, 'PROJECTS');
      }
    }, error => {
    
      this.logger.error('[LOGOUT-MODAL] - GET PROJECTS - ERROR ', error)
    }, () => {
      this.logger.log('[LOGOUT-MODAL] - GET PROJECTS * COMPLETE *')
    });
  }


  onOkPresssed(){
    // console.log('[MODAL-CHATBOT-NAME] chatbot ', this.chatbot)
    this.dialogRef.close(this.calledby);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
