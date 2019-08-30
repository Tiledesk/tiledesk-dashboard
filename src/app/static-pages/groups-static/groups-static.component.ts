import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'appdashboard-groups-static',
  templateUrl: './groups-static.component.html',
  styleUrls: ['./groups-static.component.scss']
})
export class GroupsStaticComponent implements OnInit {
  projectId: string;

  imageUrlArray = [
    { url: 'assets/img/static_group.png' , backgroundSize: 'contain'},
    { url: 'assets/img/groups_static_2_v2.png' , backgroundSize: 'contain'}
   ];

  constructor(
    private router: Router,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.getCurrentProject();
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!!! ANALYTICS STATIC - project ', project)

      if (project) {
        this.projectId = project._id
      }
    });
  }

  goToPricing() {
    console.log('goToPricing projectId ', this.projectId);
    this.router.navigate(['project/' + this.projectId + '/pricing']);
  }

}
