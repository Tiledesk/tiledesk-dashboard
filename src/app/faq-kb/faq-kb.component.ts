import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../services/faq-kb.service';
import { FaqKb } from '../models/faq_kb-model';
import { Router } from '@angular/router';


@Component({
  selector: 'faq-kb',
  templateUrl: './faq-kb.component.html',
  styleUrls: ['./faq-kb.component.scss'],
})
export class FaqKbComponent implements OnInit {

  faqkbList: FaqKb[];

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getFaqKb();
  }

  /**
   * GET FAQ KB (READ)
   */
  getFaqKb() {
    this.faqKbService.getMongDbFaqKb().subscribe((faqkb: any) => {
      console.log('MONGO DB FAQKB', faqkb);
      this.faqkbList = faqkb;
    });
  }

  goToEditAddPage_CREATE() {
    this.router.navigate(['/createfaqkb']);
  }

  goToFaqPage(idFaqKb: string) {
    console.log('ID OF FAQKB SELECTED ', idFaqKb);
    this.router.navigate(['/faq', idFaqKb]);
  }

}
