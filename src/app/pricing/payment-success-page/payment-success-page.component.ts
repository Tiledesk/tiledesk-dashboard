import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';


@Component({
  selector: 'appdashboard-payment-success-page',
  templateUrl: './payment-success-page.component.html',
  styleUrls: ['./payment-success-page.component.scss']
})
export class PaymentSuccessPageComponent implements OnInit {
  
  // contact_us_email = brand.contact_us_email;
  contact_us_email: string;
  id_project: string;

  constructor(
    private router: Router,
    private auth: AuthService,
    public brandService: BrandService,
    private logger: LoggerService
  ) {
    const brand = brandService.getBrand();
    this.contact_us_email = brand['contact_us_email'];
   }

  ngOnInit() {
    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        this.logger.log('[PRICING - PAYMENT-SUCCESS] - CurrentProject ID ', this.id_project)
      }
    });
  }

  goToHome() {
    this.router.navigate(['/project/' + this.id_project + '/home']);
  }

}
