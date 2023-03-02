import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';
import { AuthService } from '../../core/auth.service';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'appdashboard-payment-canceled-page',
  templateUrl: './payment-canceled-page.component.html',
  styleUrls: ['./payment-canceled-page.component.scss']
})
export class PaymentCanceledPageComponent implements OnInit {

  contact_us_email: string;
  id_project: string;

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(  
    private router: Router,
    private auth: AuthService,
    public brandService: BrandService
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
        this.logger.log('[PRICING - PAYMENT-CANCELED] - CurrentProject ID ', this.id_project)
      }
    });
  }


  goToHome() {
    this.router.navigate(['/project/' + this.id_project + '/home']);
  }


}
