import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../services/faq-kb.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'faq-kb-edit-add',
  templateUrl: './faq-kb-edit-add.component.html',
  styleUrls: ['./faq-kb-edit-add.component.scss']
})
export class FaqKbEditAddComponent implements OnInit {

  faqKbName: string;
  faqKbUrl: string;

  id_faq_kb: string;

  faqKbNameToUpdate: string;
  faqKbUrlToUpdate: string;

  CREATE_VIEW = false;
  EDIT_VIEW = false;

  showSpinner = true;

  project: Project;
  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {  }

  ngOnInit() {

    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ-KB PAGE) 'CREATE' OR 'EDIT'
    // if (this.router.url === '/createfaqkb') {
    if (this.router.url.indexOf('/createfaqkb') !== -1) {
      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;
    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;

      // GET THE ID OF FAQ-KB PASSED BY FAQ-KB PAGE
      this.getFaqKbId();

      // GET THE DETAIL OF FAQ-KB BY THE ID AS ABOVE
      this.getFaqKbById();
    }

    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    console.log('FAQ KB HAS PASSED id_faq_kb ', this.id_faq_kb);
  }

  /**
   * GET FAQ-KB BY ID
   */
  getFaqKbById() {
    this.faqKbService.getMongDbFaqKbById(this.id_faq_kb).subscribe((faqKb: any) => {
      console.log('MONGO DB FAQ-KB GET BY ID', faqKb);
      this.faqKbNameToUpdate = faqKb.name;
      this.faqKbUrlToUpdate = faqKb.url;
      console.log('MONGO DB FAQ-KB NAME', this.faqKbNameToUpdate);

      this.showSpinner = false;
    });
  }


  // CREATE (mongoDB)
  create() {
    console.log('HAS CLICKED CREATE NEW FAQ-KB');
    console.log('Create Faq Kb - NAME ', this.faqKbName);
    console.log('Create Faq Kb - URL ', this.faqKbUrl);
    console.log('Create Faq Kb - PROJ ID ', this.project._id);
    this.faqKbService.addMongoDbFaqKb(this.faqKbName, this.faqKbUrl)
      .subscribe((faqKb) => {
        console.log('CREATE FAQKB - POST DATA ', faqKb);

        // this.bot_fullname = '';

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
      (error) => {
        console.log('CREATE FAQKB - POST REQUEST ERROR ', error);
      },
      () => {
        console.log('CREATE FAQKB - POST REQUEST * COMPLETE *');

        // this.faqKbService.createFaqKbKey()
        // .subscribe((faqKbKey) => {

        //   console.log('CREATE FAQKB KEY - POST DATA ', faqKbKey);

        // });

        this.router.navigate(['project/' + this.project._id + '/faqkb']);
      });
  }

  edit() {
    console.log('FAQ KB NAME TO UPDATE ', this.faqKbNameToUpdate);
    console.log('FAQ KB URL TO UPDATE ', this.faqKbUrlToUpdate);

    this.faqKbService.updateMongoDbFaqKb(this.id_faq_kb, this.faqKbNameToUpdate, this.faqKbUrlToUpdate).subscribe((data) => {
      console.log('PUT DATA ', data);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getDepartments();
      this.ngOnInit();
    },
      (error) => {

        console.log('PUT REQUEST ERROR ', error);

      },
      () => {
        console.log('PUT REQUEST * COMPLETE *');

        this.router.navigate(['project/' + this.project._id + '/faqkb']);
      });
  }

  goBackToFaqKbList() {
    this.router.navigate(['project/' + this.project._id + '/faqkb']);
  }


}
