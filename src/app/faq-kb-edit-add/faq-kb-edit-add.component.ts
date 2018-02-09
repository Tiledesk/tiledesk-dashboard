import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../services/faq-kb.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private route: ActivatedRoute,
  ) {

  }

  ngOnInit() {

    // GET THE ID OF FAQ-KB PASSED BY FAQ-KB PAGE
    this.getFaqKbId();

    // GET THE DETAIL OF FAQ-KB BY THE ID AS ABOVE
    this.getFaqKbById();

    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ-KB PAGE) 'CREATE' OR 'EDIT'
    if (this.router.url === '/createfaqkb') {
      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;
    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
    }
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
    console.log('HAS CLICKED CREATE');
    console.log('Create Faq Kb - NAME ', this.faqKbName);
    console.log('Create Faq Kb - URL ', this.faqKbUrl);
    this.faqKbService.addMongoDbFaqKb(this.faqKbName, this.faqKbUrl)
      .subscribe((faqKb) => {
        console.log('POST DATA ', faqKb);

        // this.bot_fullname = '';

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
      (error) => {
        console.log('POST REQUEST ERROR ', error);
      },
      () => {
        console.log('POST REQUEST * COMPLETE *');

        this.router.navigate(['/faqkb']);
      });
  }

  edit() {
    console.log('FAQ KB NAME TO UPDATE ', this.faqKbNameToUpdate);
    console.log('FAQ KB URL TO UPDATE ', this.faqKbUrlToUpdate);

    this.faqKbService.updateMongoDbFaqKb(this.id_faq_kb,  this.faqKbNameToUpdate, this.faqKbUrlToUpdate).subscribe((data) => {
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

        this.router.navigate(['/faqkb']);
      });
  }

  goBackToFaqKbList() {
    this.router.navigate(['/faqkb']);
  }


}
