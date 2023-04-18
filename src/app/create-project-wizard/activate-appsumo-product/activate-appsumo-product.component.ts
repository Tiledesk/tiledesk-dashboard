import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';


@Component({
  selector: 'appdashboard-activate-appsumo-product',
  templateUrl: './activate-appsumo-product.component.html',
  styleUrls: ['./activate-appsumo-product.component.scss']
})
export class ActivateAppsumoProductComponent implements OnInit {
  user: any;
  projects:  Project[];
  projectname: string
  selectedProjectId: string
  public companyLogoBlack_Url: string;
  public tparams: any;
  public company_name: any;
  public company_site_url: any;
  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private logger: LoggerService,
    public brandService: BrandService,
  ) { 
    const brand = brandService.getBrand();
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
  }

  ngOnInit(): void {
   
      this.getProjects();
  }


  getLoggedUser() {
    this.auth.user_bs
      .subscribe((user) => {
        if (user) {
          this.user = user;
          // this.logger.log('[GET START CHATBOT FORK]  - user ', this.user)
        }
      });
  }

  getProjects() {
    this.projectService.getProjects().subscribe((projects: any) => {
      // this.logger.log('[GET START CHATBOT FORK] - GET PROJECTS ', projects);
      if (projects) {
        this.projects = projects;
        if (this.projects && this.projects.length === 1) {
          this.projectname = this.projects[0].id_project.name
          this.selectedProjectId = this.projects[0].id_project._id
        }
      }

    }, error => {

      this.logger.error('[GET START CHATBOT FORK] - GET PROJECTS - ERROR ', error)
    }, () => {
      this.logger.log('[GET START CHATBOT FORK] - GET PROJECTS * COMPLETE *')
    });
  }
}
