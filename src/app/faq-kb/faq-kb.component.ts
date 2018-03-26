import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../services/faq-kb.service';
import { FaqKb } from '../models/faq_kb-model';
import { Router } from '@angular/router';
import { MongodbFaqService } from '../services/mongodb-faq.service';

import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';


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

  HAS_FAQ_RELATED = false;

  project: Project;

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private mongodbFaqService: MongodbFaqService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.getCurrentProject();

    // this.getFaqKb();
    this.getFaqKbByProjectId();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      if (this.project) {
        console.log('00 -> FAQKB COMP project ID from AUTH service subscription  ', this.project._id)
      }
    });
  }

  /**
   * GETS ONLY THE FAQ-KB WITH THE CURRENT PROJECT ID
   */
  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId(this.project._id).subscribe((faqKb: any) => {
      console.log('FAQs-KB GET BY PROJECT ID', faqKb);
      this.faqkbList = faqKb;
      // this.showSpinner = false;
    },
      (error) => {

        console.log('GET FAQ KB ERROR ', error);

      },
      () => {
        console.log('GET FAQ KB COMPLETE');

        // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
        this.getFaqByFaqKbId();

      });

  }


  /**
   * !!! NO MORE USED: NOW THE FAQ-KB ARE GET BY FILTERING FOR THE ID OF THE CURRENT PROJECT (see above)
   * GET ALL FAQ KB (READ)
   */
  // getFaqKb() {
  //   this.faqKbService.getMongDbFaqKb().subscribe((faqkb: any) => {
  //     console.log('MONGO DB FAQKB', faqkb);
  //     this.faqkbList = faqkb;
  //   },
  //     (error) => {

  //       console.log('GET FAQ KB ERROR ', error);

  //     },
  //     () => {
  //       console.log('GET FAQ KB COMPLETE');

  //       // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
  //       this.getFaqByFaqKbId();

  //     });
  // }

  getFaqByFaqKbId() {
    // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
    let i: number;
    for (i = 0; i < this.faqkbList.length; i++) {
      console.log('ID FAQ KB ', this.faqkbList[i]._id);
      this.faqKbId = this.faqkbList[i]._id;

      this.mongodbFaqService.getMongoDbFaqByFaqKbId(this.faqKbId).subscribe((faq: any) => {
        // console.log('MONGO DB FAQ ARRAY', faq);

        let j: number;
        for (j = 0; j < faq.length; j++) {
          // console.log('MONGO DB FAQ - FAQ ID', faq[j]._id);
          // console.log('MONGO DB FAQ - FAQ-KB ID', faq[j].id_faq_kb);
          console.log('WITH THE FAQ-KB ID ', faq[j].id_faq_kb, 'FOUND FAQ WITH ID ', faq[j]._id)
          this.faq_faqKbId = faq[j].id_faq_kb;

          for (const faqkb of this.faqkbList) {
            if (faqkb._id === this.faq_faqKbId) {
              // console.log('+> ID COINCIDONO');

              // set in the json the value true to the property has_faq
              faqkb.has_faq = true;
            }
          }

        }
      });
    }
  }

  getFaqByFaqKbIdForDeleteModal() {
    // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
    // let i: number;
    // for (i = 0; i < this.faqkbList.length; i++) {
    //   console.log('ID FAQ KB ', this.faqkbList[i]._id);
    //   this.faqKbId = this.faqkbList[i]._id;

    // '5a84754f7d70e79db67fb0da'
    this.mongodbFaqService.getMongoDbFaqByFaqKbId(this.id_toDelete).subscribe((faq: any) => {
      console.log('MONGO DB FAQ RETURNED BY getFaqByFaqKbIdForDeleteModal', faq);
      console.log('FAQ-KB ID TO DELETE (IN getFaqByFaqKbIdForDeleteModal)', this.id_toDelete);

      let j: number;
      for (j = 0; j < faq.length; j++) {
        // console.log('MONGO DB FAQ - FAQ ID', faq[j]._id);
        console.log('MONGO DB FAQ - THE FAQ-KB WITH ID', faq[j].id_faq_kb, ' HAS RELATED THE FAQ ' + faq[j]._id);
        this.faq_faqKbId = faq[j].id_faq_kb;

        for (const faqkb of this.faqkbList) {
          if (faqkb._id === this.faq_faqKbId) {
            // console.log('+> ID COINCIDONO');
            // this.HAS_FAQ_ASSOCIATED = true;
            // set in the json the value true to the property has_faq
            faqkb.has_faq = true;
          }
        }

      }
    });
    // }
  }

  /**
   * MODAL DELETE FAQ KB
   * @param id
   */
  openDeleteModal(id: string, HAS_FAQ_RELATED: boolean) {
    console.log('ON MODAL DELETE OPEN -> FAQ-KB ID ', id);
    console.log('ON MODAL DELETE OPEN -> HAS_FAQ_RELATED ', HAS_FAQ_RELATED);

    this.HAS_FAQ_RELATED = HAS_FAQ_RELATED;
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

      // SEARCH BY THE FAQ-KB ID THE RELATED FAQ TO DELETE
      this.mongodbFaqService.getMongoDbFaqByFaqKbId(this.id_toDelete).subscribe((faq: any) => {
        console.log(' ++ MONGO DB FAQ RETURNED WHEN CLOSE DELETE MODAL', faq);
        console.log(' ++ FAQ-KB ID TO DELETE WHEN CLOSE DELETE MODAL', this.id_toDelete);
        // if (faq.length > 0) {
        //   console.log('THE FAQ-KB TO DELETE HAS FAQ RELATED ')
        // }
        let w: number;
        for (w = 0; w < faq.length; w++) {
          console.log(' ++ faq lenght to delete ', faq.length)

          const relatedFaqIdToDelete = faq[w]._id
          console.log('RELATED FAQ ID TO DELETE ', relatedFaqIdToDelete)

          this.mongodbFaqService.deleteMongoDbFaq(relatedFaqIdToDelete).subscribe((faq_to_delete) => {
            console.log('DELETE RELATED FAQ ', faq_to_delete);
          });
        }

      });

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
    this.router.navigate(['project/' + this.project._id + '/createfaqkb']);
  }

  // GO TO THE COMPONENT FAQ-KB-EDIT-ADD
  goToEditAddPage_EDIT(idFaqKb: string) {
    this.router.navigate(['project/' + this.project._id + '/editfaqkb', idFaqKb]);
  }

  // GO TO FAQ-COMPONET (TO ADD OR EDIT FAQ)
  goToFaqPage_ADD_EDIT_FAQ(idFaqKb: string) {
    console.log('ID OF FAQKB SELECTED ', idFaqKb);

    this.router.navigate(['project/' + this.project._id + '/faq', idFaqKb]);
  }

}
