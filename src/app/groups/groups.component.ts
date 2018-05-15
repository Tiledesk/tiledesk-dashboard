import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  showSpinner = true;

  constructor(
    private auth: AuthService,
    private groupsService: GroupService
  ) { }

  ngOnInit() {
    this.auth.checkRole();
  }


  /**
   * GETS ALL GROUPS WITH THE CURRENT PROJECT-ID
   */
  getFaqKbByProjectId() {
    this.groupsService.getGroupsByProjectId().subscribe((groups: any) => {
      console.log('GROUPS GET BY PROJECT ID', groups);

      // this.faqkbList = faqKb;
      this.showSpinner = false;
    },
      (error) => {

        console.log('GET GROUPS - ERROR ', error);

        this.showSpinner = false;
      },
      () => {
        console.log('GET GROUPS * COMPLETE');

      });

  }

}
