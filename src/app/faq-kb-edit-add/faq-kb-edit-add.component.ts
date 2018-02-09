import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../services/faq-kb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'faq-kb-edit-add',
  templateUrl: './faq-kb-edit-add.component.html',
  styleUrls: ['./faq-kb-edit-add.component.scss']
})
export class FaqKbEditAddComponent implements OnInit {

  faqKbName: string;
  faqKbUrl: string;

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
  ) {

  }

  ngOnInit() {
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
        this.ngOnInit();
      },
      (error) => {
        console.log('POST REQUEST ERROR ', error);
      },
      () => {
        console.log('POST REQUEST * COMPLETE *');

        this.router.navigate(['/faqkb']);
      });


  }

}
