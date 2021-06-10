import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'appdashboard-unauthorized-for-project',
  templateUrl: './unauthorized-for-project.component.html',
  styleUrls: ['./unauthorized-for-project.component.scss']
})
export class UnauthorizedForProjectComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  goToProjects() {
    console.log('HAS CLICCKED GO TO PROJECT ')
    this.router.navigate(['/projects']);
    // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
    this.auth.hasClickedGoToProjects();

}

}
