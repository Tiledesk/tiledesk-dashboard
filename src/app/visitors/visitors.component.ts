import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { UsersService } from '../services/users.service';
import { LoggerService } from '../services/logger/logger.service';
@Component({
  selector: 'appdashboard-visitors',
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.scss']
})
export class VisitorsComponent implements OnInit {
  projectId: string;
  showSpinner = false;
  visitors: any;
  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    private logger: LoggerService
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
