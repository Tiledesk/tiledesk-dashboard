import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {
  projectid: string
  constructor(
    private router: Router,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    this.getCurrentProject()
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
       
        this.projectid = project._id
        
      }
      // this.logger.log('[BOT-CREATE] 00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  goToDashboard() {
    this.router.navigate(['/project/' + this.projectid + '/home']);
  }

}
