import { Component, OnInit } from '@angular/core';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';
import { AuthService } from '../core/auth.service';
import { UsersService } from '../services/users.service';
@Component({
  selector: 'appdashboard-visitors',
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.scss']
})
export class VisitorsComponent implements OnInit {
  projectId: string;
  showSpinner = false;
  visitors: any;

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    private auth: AuthService,
    private usersService: UsersService,
  ) { }

  ngOnInit() {
    this.getCurrentProject();
    this.getVisitors();
    
  }



  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        this.logger.log('[VISITORS] project ID ', this.projectId)
      }
    });
  }



  getVisitors() {
    this.usersService.getProjectUsersByProjectId_GuestRole().subscribe((_visitors: any) => {
      this.logger.log('[VISITORS] - GET VISITOR RES: ', _visitors);
      if (_visitors) {
        this.visitors = _visitors;
      }
    }, error => {
      this.showSpinner = false;
      this.logger.error('[VISITORS] - GET VISITOR RES: - ERROR', error);
    }, () => {

      this.showSpinner = false;
      this.logger.log('[VISITORS] - GET VISITOR RES: - COMPLETE');


    });
  }


}
