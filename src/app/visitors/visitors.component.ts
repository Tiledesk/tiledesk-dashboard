import { Component, OnInit } from '@angular/core';
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
  constructor(
    private auth: AuthService,
    private usersService: UsersService
  ) { }

  ngOnInit() {

    this.getCurrentProject();
    this.getVisitors();
  }



  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        // console.log('00 -> !!!! CONTACTS project ID from AUTH service subscription  ', this.projectId)
      }
    });
  }



  getVisitors() {
    this.usersService.getProjectUsersByProjectId_GuestRole().subscribe((_visitors: any) => {
      console.log('»» VISITOR COMP - GET VISITOR RES: ', _visitors);
      if (_visitors) {
        this.visitors = _visitors;
      }
    }, error => {
      this.showSpinner = false;
      console.log('»» VISITOR COMP - GET VISITOR RES: - ERROR', error);
    }, () => {

      this.showSpinner = false;
      console.log('»» VISITOR COMP - GET VISITOR RES: - COMPLETE');


    });
  }


}
