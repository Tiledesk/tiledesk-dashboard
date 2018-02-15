import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../services/faq-kb.service';
import { FaqKb } from '../models/faq_kb-model';
import { Router } from '@angular/router';
import { MongodbFaqService } from '../services/mongodb-faq.service';


@Component({
  selector: 'faq-kb',
  templateUrl: './faq-kb.component.html',
  styleUrls: ['./faq-kb.component.scss'],
})
export class FaqKbComponent implements OnInit {

  faqkbList: FaqKb[];

  // set to none the property display of the modal
  display = 'none';
  id_toDelete: string;

  faqKbId: string;
  faq_faqKbId: string;

  HAS_FAQ_ASSOCIATED = false;

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private mongodbFaqService: MongodbFaqService,
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
    },
      (error) => {

        console.log('GET FAQ KB ERROR ', error);

      },
      () => {
        console.log('GET FAQ KB COMPLETE');

        // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
        // this.getFaqByFaqKbId();

      });
  }
  getFaqByFaqKbId() {
    // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
    let i: number;
    for (i = 0; i < this.faqkbList.length; i++) {
      console.log('ID FAQ KB ', this.faqkbList[i]._id);
      this.faqKbId = this.faqkbList[i]._id;

      this.mongodbFaqService.getMongoDbFaqByFaqKbId(this.faqKbId).subscribe((faq: any) => {
        console.log('MONGO DB FAQ', faq);

        let j: number;
        for (j = 0; j < faq.length; j++) {
          console.log('MONGO DB FAQ - FAQ ID', faq[j]._id);
          console.log('MONGO DB FAQ - FAQ-KB ID', faq[j].id_faq_kb);
          this.faq_faqKbId = faq[j].id_faq_kb;

          for (const faqkb of this.faqkbList) {
            if (faqkb._id === this.faq_faqKbId) {
              console.log('+> ID COINCIDONO');
              this.HAS_FAQ_ASSOCIATED = true;
              // set in the json the value true to the property has_faq
              faqkb.has_faq = true;
            }
          }

        }
      });
    }
  }

  /**
   * MODAL DELETE FAQ KB
   * @param id
   */
  openDeleteModal(id: string) {
    console.log('ON MODAL DELETE OPEN -> FAQ-KB ID ', id);

    this.display = 'block';

    this.id_toDelete = id;
  }

  /**
   * DELETE FAQ (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)
   */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.faqKbService.deleteMongoDbFaqKb(this.id_toDelete).subscribe((data) => {
      console.log('DELETE DATA ', data);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      this.ngOnInit();

    },
      (error) => {

        console.log('DELETE REQUEST ERROR ', error);

      },
      () => {
        console.log('DELETE REQUEST * COMPLETE *');
      });

  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
  }

  // GO TO THE COMPONENT FAQ-KB-EDIT-ADD
  goToEditAddPage_CREATE() {
    this.router.navigate(['/createfaqkb']);
  }

  // GO TO THE COMPONENT FAQ-KB-EDIT-ADD
  goToEditAddPage_EDIT(idFaqKb: string) {
    this.router.navigate(['/editfaqkb', idFaqKb]);
  }

  // GO TO FAQ-COMPONET (TO ADD OR EDIT FAQ)
  goToFaqPage_ADD_EDIT_FAQ(idFaqKb: string) {
    console.log('ID OF FAQKB SELECTED ', idFaqKb);
    this.router.navigate(['/faq', idFaqKb]);
  }

}
