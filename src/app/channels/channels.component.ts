import { Component, OnInit } from '@angular/core';

import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../services/brand.service';


@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss']
})
export class ChannelsComponent implements OnInit {
  // tparams = brand;
  tparams: any;
  project: Project;
  project_name: string;

  constructor(
    public auth: AuthService,
    public brandService: BrandService
  ) {
    const brand = brandService.getBrand();
    this.tparams = brand;
   }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getCurrentProject()
  }
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> CHANNELS project from AUTH service subscription  ', this.project)

      if (this.project) {
        this.project_name = this.project.name;
      }

    });
  }
}
