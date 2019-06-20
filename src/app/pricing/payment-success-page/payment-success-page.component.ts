import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'appdashboard-payment-success-page',
  templateUrl: './payment-success-page.component.html',
  styleUrls: ['./payment-success-page.component.scss']
})
export class PaymentSuccessPageComponent implements OnInit {

  id_project: string;

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit() {

    this.getCurrentProject();
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.id_project = project._id
        console.log('PaymentSuccessPageComponent CurrentProject ID ', this.id_project)

      }
    });
  }

  goToHome() {

    this.router.navigate(['/project/' + this.id_project + '/home']);
  }

}
