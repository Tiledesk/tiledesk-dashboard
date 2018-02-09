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

  // set to none the property display of the modal
  display = 'none';
  id_toDelete: string;

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
