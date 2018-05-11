import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../services/faq-kb.service';
import { FaqKb } from '../models/faq_kb-model';
import { Router } from '@angular/router';
import { MongodbFaqService } from '../services/mongodb-faq.service';

import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { Location } from '@angular/common';


@Component({
  selector: 'faq-kb',
  templateUrl: './faq-kb.component.html',
  styleUrls: ['./faq-kb.component.scss'],
})
export class FaqKbComponent implements OnInit {

  faqkbList: FaqKb[];

  // set to none the property display of the modal
  display = 'none';
  displayDeleteInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;

  id_toDelete: string;

  faqKbId: string;
  faq_faqKbId: string;

  HAS_FAQ_RELATED = false;

  project: Project;
  showSpinner = true;

  NUMBER_OF_CICLE: number;

  DELETE_BOT_ERROR = false;

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private mongodbFaqService: MongodbFaqService,
    private auth: AuthService,
    private _location: Location
  ) { }

  ngOnInit() {
    this.auth.checkRole();
    this.getCurrentProject();

    // this.getFaqKb();
    this.getFaqKbByProjectId();

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      if (this.project) {
        // console.log('00 -> FAQKB COMP project ID from AUTH service subscription  ', this.project._id)
      }
    });
  }

  /**
   * GETS ONLY THE FAQ-KB WITH THE CURRENT PROJECT ID
   * NOTE: THE CURREN PROJECT ID IS OBTAINED IN THE FAQ-KB SERVICE
   */
  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      console.log('FAQs-KB GET BY PROJECT ID', faqKb);

      this.faqkbList = faqKb;
      this.showSpinner = false;
    },
      (error) => {

        console.log('GET FAQ KB ERROR ', error);
        this.showSpinner = false;
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

          // console.log('WITH THE FAQ-KB ID ', faq[j].id_faq_kb, 'FOUND FAQ WITH ID ', faq[j]._id)
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
    * ON CLOSE DELETE MODAL:
    * - SEARCH FOR ANY FAQ WITH THE ID of the FAQ-KB THAT THE USER INTENDS TO DELETE
    * - IF THERE ARE FAQs RELATED TO THE FAQ-KB, ARE FIRST DELETED THE FAQs AND THEN IS DELETED the FAQ-KB
    * - IF THERE ARE NO FAQ, THE FAQ-KB IS IMMEDIATELY DELETED
    * NOTE: THIS WF RESOLVES THE ISSUE 'FAQ-KB-ID NOT FOUND' WHEN IN CHAT21-SUPPORT-NODEJS-API ARE DELETED THE REMOTE FAQ
    */

  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.displayDeleteInfoModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;
    // this.faqKbService.deleteMongoDbFaqKb(this.id_toDelete).subscribe((data) => {
    //   console.log('DELETE DATA ', data);

    // SEARCH BY THE FAQ-KB ID THE RELATED FAQ TO DELETE
    this.mongodbFaqService.getMongoDbFaqByFaqKbId(this.id_toDelete)
      .subscribe((faq: any) => {
        console.log(' ++ MONGO DB FAQ RETURNED WHEN CLOSE DELETE MODAL', faq);
        console.log(' ++ FAQ-KB ID TO DELETE WHEN CLOSE DELETE MODAL', this.id_toDelete);

        if (faq.length > 0 && faq !== undefined) {
          console.log('THE FAQ-KB TO DELETE HAS FAQ RELATED ')

          let w: number;
          for (w = 0; w < faq.length; w++) {

            this.NUMBER_OF_CICLE = w
            console.log('NUMBER OF CICLE ', this.NUMBER_OF_CICLE);
            console.log(' ++ faq lenght to delete ', faq.length)

            // if ((this.NUMBER_OF_CICLE + 1) === faq.length) {
            //   console.log('**************************');
            // }

            const relatedFaqIdToDelete = faq[w]._id
            console.log('RELATED FAQ ID TO DELETE ', relatedFaqIdToDelete)

            this.mongodbFaqService.deleteMongoDbFaq(relatedFaqIdToDelete).subscribe((faq_to_delete) => {
              console.log('DELETE RELATED FAQ ', faq_to_delete);


            },
              (error) => {

                console.log('DELETE RELATED FAQ - ERROR ', error);

                this.SHOW_CIRCULAR_SPINNER = false;

              },
              () => {



                console.log('DELETE RELATED FAQ * COMPLETE *');

                this.deleteFaqKb();
              });

          }

        } else {

          this.deleteFaqKb();
        }

      },
        (error) => {

          console.log('GET FAQ BY FAQ-KB ID - ERROR ', error);

          this.SHOW_CIRCULAR_SPINNER = false;

          this.DELETE_BOT_ERROR = true;
        },
        () => {
          console.log('GET FAQ BY FAQ-KB * COMPLETE *');

          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
          }, 300);

          this.DELETE_BOT_ERROR = false;
        });

  }

  deleteFaqKb() {

    this.faqKbService.deleteMongoDbFaqKb(this.id_toDelete)
      .subscribe((data) => {
        console.log('DELETE FAQ-KB ', data);
      }, (error) => {
        console.log('DELETE FAQ-KB (BOT) REQUEST ERROR ', error);

        this.SHOW_CIRCULAR_SPINNER = false;
        this.DELETE_BOT_ERROR = true;
      },
        () => {
          console.log('DELETE FAQ-KB (BOT) REQUEST * COMPLETE *');
          // RE-RUN ngOnInit() TO UPDATE THE TABLE
          // this.ngOnInit()
          this.DELETE_BOT_ERROR = false;
        });

  }

  onCloseInfoModalHandled() {
    this.displayDeleteInfoModal = 'none';
    this.ngOnInit()
  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
    this.displayDeleteInfoModal = 'none';
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

  goToTestFaqPage(remoteFaqKbKey: string) {
    console.log('REMOTE FAQKB KEY SELECTED ', remoteFaqKbKey);

    this.router.navigate(['project/' + this.project._id + '/faq/test', remoteFaqKbKey]);
  }

}
