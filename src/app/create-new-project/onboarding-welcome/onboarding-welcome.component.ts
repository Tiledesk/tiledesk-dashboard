import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BrandService } from 'app/services/brand.service';

@Component({
  selector: 'appdashboard-onboarding-welcome',
  templateUrl: './onboarding-welcome.component.html',
  styleUrls: ['./onboarding-welcome.component.scss']
})
export class OnboardingWelcomeComponent implements OnInit {
  company_name: string;
  companyNameParams: any
  constructor(
    private router: Router,
    public brandService: BrandService,
  ) { 
    const brand = brandService.getBrand();
    this.company_name = brand['company_name'];
    this.companyNameParams = { 'company_name': this.company_name }
  }

  ngOnInit(): void {
  }


  goToOnboadingSteps() {
    this.router.navigate(['/create-new-project']);
  }

}
