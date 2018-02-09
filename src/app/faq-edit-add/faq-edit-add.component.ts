import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MongodbFaqService } from '../services/mongodb-faq.service';

@Component({
  selector: 'faq-edit-add',
  templateUrl: './faq-edit-add.component.html',
  styleUrls: ['./faq-edit-add.component.scss'],
})
export class FaqEditAddComponent implements OnInit {

  question: string;
  answer: string;

  id_toUpdate: any;

  question_toUpdate: string;
  answer_toUpdate: string;

  CREATE_VIEW = false;
  EDIT_VIEW = false;

  showSpinner = true;

  id_faq_kb: string;
  id_faq: string;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mongodbFaqService: MongodbFaqService,
  ) { }

  ngOnInit() {



    this.getFaqById();

    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ PAGE) 'CREATE' OR 'EDIT'
    // if (this.router.url === '/createfaq') {
    if (this.router.url.indexOf('/createfaq') !== -1) {
      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;
      // GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
      this.getFaqKbId();
    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      // GET THE ID OF FAQ PASSED BY FAQ PAGE &
      // GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
      this.getFaqKbIdAndFaqId();

    }
  }

  getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    console.log('FAQ HAS PASSED id_faq_kb ', this.id_faq_kb);
  }

  getFaqKbIdAndFaqId() {
    this.route.params.subscribe((params) => {
      this.id_faq_kb = params.faqkbid;
      this.id_faq = params.faqid;
      // console.log(params);
      console.log('FAQ-KB ID ', this.id_faq_kb);
      console.log('FAQ ID ', this.id_faq );
    });
  }

  goBackToFaqList() {
    this.router.navigate(['/faq', this.id_faq_kb]);
  }

  /**
   * ADD FAQ
   */
  create() {
    console.log('MONGO DB CREATE FAQ QUESTION: ', this.question, ' ANSWER: ', this.answer, ' ID FAQ KB ', this.id_faq_kb);
    this.mongodbFaqService.addMongoDbFaq(this.question, this.answer, this.id_faq_kb)
      .subscribe((faq) => {
        console.log('POST DATA ', faq);

        // this.question = '';
        // this.answer = '';
        // RE-RUN GET FAQ TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
      (error) => {

        console.log('POST REQUEST ERROR ', error);

      },
      () => {
        console.log('POST REQUEST * COMPLETE *');

        this.router.navigate(['/faq', this.id_faq_kb]);
      });

  }

  /**
   * GET FAQ-KB BY ID
   */
  getFaqById() {
    this.mongodbFaqService.getMongDbFaqById('5a7dea60da18d4815661134d').subscribe((faq: any) => {
      console.log('MONGO DB FAQ GET BY ID', faq);
      this.question_toUpdate = faq.question;
      this.answer_toUpdate = faq.answer;
      console.log('MONGO DB FAQ QUESTION TO UPDATE', this.question_toUpdate);
      console.log('MONGO DB FAQ ANSWER TO UPDATE', this.answer_toUpdate);

      this.showSpinner = false;
    });
  }

  edit() {
    console.log('FAQ QUESTION TO UPDATE ', this.question_toUpdate);
    console.log('FAQ KB URL TO UPDATE ', this.answer_toUpdate);

    this.mongodbFaqService.updateMongoDbFaq(this.id_faq,  this.question_toUpdate, this.answer_toUpdate).subscribe((data) => {
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

        this.router.navigate(['/faq', this.id_faq_kb]);
      });
  }



}
