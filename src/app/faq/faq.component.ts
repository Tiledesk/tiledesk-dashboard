import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MongodbFaqService } from '../services/mongodb-faq.service';
import { Faq } from '../models/faq-model';
import { Router, ActivatedRoute } from '@angular/router';
// import { ActivatedRoute } from '@angular/router';

import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FaqKbService } from '../services/faq-kb.service';
import { NotifyService } from '../core/notify.service';

// import $ = require('jquery');
// declare const $: any;
@Component({
  selector: 'faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  @ViewChild('editbotbtn') private elementRef: ElementRef;

  faq: Faq[];
  question: string;
  answer: string;

  id_toDelete: any;
  id_toUpdate: any;

  question_toUpdate: string;
  answer_toUpdate: string;

  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;
  // set to none the property display of the modal
  display = 'none';

  id_faq_kb: string;
  faq_kb_remoteKey: string;

  project: Project;

  displayInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  displayImportModal = 'none';
  csvColumnsDelimiter = ';'
  parse_done: boolean;
  parse_err: boolean;

  modalChoosefileDisabled: boolean;

  faqKb_name: string;
  faqKbUrlToUpdate: string;
  faqKb_id: string;
  faqKb_created_at: any;
  faq_lenght: number;
  showSpinner = true;
  is_external_bot: boolean;
  constructor(
    private mongodbFaqService: MongodbFaqService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private faqKbService: FaqKbService,
    private notify: NotifyService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();

    console.log('»»» HELLO FAQ COMP')

    this.clearSearchedQuestionStored();

    // GET ID_FAQ_KB FROM THE URL PARAMS (IS PASSED FROM THE FAQ-KB-COMPONENT WHEN THE USER CLICK ON EDIT FAQ IN THE TABLE )
    this.getFaqKbId();

    // GET ALL FAQ
    // this.getFaq();

    // GET ONLY THE FAQ WITH THE FAQ-KB ID
    this.getFaqByFaqKbId();

    this.getCurrentProject();
  }

  /**
   * ****** CLEAR SEARCHED QUESTION FROM LOCAL STORAGE ******
   * IN THE FAQ-TEST COMP, WHEN THE USER SEARCH FOR A QUESTION TO TEST
   * THE QUESTION IS SAVED IN THE STORAGE SO, IN THE EVENT THAT CLICK ON THE FAQ
   * TO EDIT IT, WHEN CLICK ON THE BACK BUTTON IN THE FAQ EDIT PAGE AND RETURN IN THE FAQ TEST PAGE, THE
   * TEST PAGE DISPLAY THE PREVIOUS RESULT OF RESEARCH.
   * WHEN THE USER RETURN IN THE EDIT BOT PAGE (THIS COMPONENT) THE RESEARCHED QUESTION IS RESETTED */
  clearSearchedQuestionStored() {
    // localStorage.setItem('searchedQuestion', '');
    localStorage.removeItem('searchedQuestion')
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> FAQ COMP project from AUTH service subscription  ', this.project)
    });
  }

  getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    // console.log('FAQ KB HAS PASSED id_faq_kb ', this.id_faq_kb);

    if (this.id_faq_kb) {

      this.getFaqKbById();

    }
  }

  /**
   * *** GET FAQ-KB BY ID (FAQ-KB DETAILS) ***
   * USED TO OBTAIN THE FAQ-KB REMOTE KEY NECESSARY TO PASS IT
   * TO THE FAQ-TEST COMPONENT WHEN THE USER PRESS ON THE "FAQ TEST" BUTTON
   * AND ALSO TO OBTAIN THE NAME of the FAQ-KB TO DISPLAY IT IN THE DIV navbar-brand
   * *** NEW IMPLENTATION ***
   * THE 'EDIT BOT' LOGIC HAS BEEN MOVED FROM THE COMPONENT editBotName TO THIS COMPONENT
   * SO THE DATA RETURNED FROM getFaqKbById ARE ALSO USED TO DISPLAY THE NAME OF THE BOT IN TH 'UPDATE BOT' SECTION
   * AND THE FAQ-KB ID, ID AND REMOTE ID IN THE 'BOT ATTRIBUTE' SECTION
   */
  getFaqKbById() {
    // this.botService.getMongDbBotById(this.botId).subscribe((bot: any) => { // NO MORE USED
    this.faqKbService.getMongDbFaqKbById(this.id_faq_kb).subscribe((faqkb: any) => {
      console.log('GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);

      this.faq_kb_remoteKey = faqkb.kbkey_remote
      console.log('GET FAQ-KB (DETAILS) BY ID - FAQKB REMOTE KEY ', this.faq_kb_remoteKey);

      this.faqKb_name = faqkb.name;
      console.log('GET FAQ-KB (DETAILS) BY ID - FAQKB NAME', this.faqKb_name);

      this.faqKb_id = faqkb._id;
      console.log('GET FAQ-KB (DETAILS) BY ID - FAQKB ID', this.faqKb_id);

      this.faqKb_created_at = faqkb.createdAt;
      console.log('GET FAQ-KB (DETAILS) BY ID - CREATED AT ', this.faqKb_created_at);

      this.is_external_bot = faqkb.external;
      console.log('GET FAQ-KB (DETAILS) BY ID - BOT IS EXTERNAL ', this.is_external_bot);

      if (faqkb.url !== 'undefined') {
        this.faqKbUrlToUpdate = faqkb.url;
        console.log('GET FAQ-KB (DETAILS) BY ID - BOT URL ', this.faqKbUrlToUpdate);
      } else {
        console.log('GET FAQ-KB (DETAILS) BY ID - BOT URL is undefined ', faqkb.url);
      }

    },
      (error) => {
        console.log('GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
        // this.showSpinner = false;
      },
      () => {
        console.log('GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
        // this.showSpinner = false;
      });

  }

  hasClickedExternalBot(externalBotselected: boolean) {
    this.is_external_bot = externalBotselected;
    console.log('hasClickedExternalBot - externalBotselected: ', this.is_external_bot);
  }

  /**
   * *** EDIT BOT ***
   * HAS BEEN MOVED in this COMPONENT FROM faq-kb-edit-add.component  */
  editBotName() {

    // RESOLVE THE BUG 'edit button remains focused after clicking'
    this.elementRef.nativeElement.blur();

    console.log('FAQ KB NAME TO UPDATE ', this.faqKb_name);
    this.faqKbService.updateMongoDbFaqKb(this.id_faq_kb, this.faqKb_name, this.faqKbUrlToUpdate, this.is_external_bot)
      .subscribe((faqKb) => {
        console.log('EDIT BOT - FAQ KB UPDATED ', faqKb);
      },
        (error) => {
          console.log('EDIT BOT -  ERROR ', error);
          // =========== NOTIFY ERROR ===========
          this.notify.showNotification('An error occurred while updating the bot', 4, 'report_problem');
        },
        () => {
          console.log('EDIT BOT - * COMPLETE *');
          // =========== NOTIFY SUCCESS===========
          this.notify.showNotification('bot successfully updated', 2, 'done');
        });
  }

  goToTestFaqPage() {
    console.log('GO TO TEST FAQ PAGE - REMOTE FAQKB KEY ', this.faq_kb_remoteKey);
    this.router.navigate(['project/' + this.project._id + '/faq/test', this.faq_kb_remoteKey, this.id_faq_kb]);
  }


  // GO TO FAQ-EDIT-ADD COMPONENT AND PASS THE FAQ-KB ID (RECEIVED FROM FAQ-KB COMPONENT)
  goToEditAddPage_CREATE() {
    console.log('ID OF FAQKB ', this.id_faq_kb);
    this.router.navigate(['project/' + this.project._id + '/createfaq', this.id_faq_kb]);
  }

  // GO TO FAQ-EDIT-ADD COMPONENT AND PASS THE FAQ ID (RECEIVED FROM THE VIEW) AND
  // THE FAQ-KB ID (RECEIVED FROM FAQ-KB COMPONENT)
  goToEditAddPage_EDIT(faq_id: string) {
    console.log('ID OF FAQ ', faq_id);
    this.router.navigate(['project/' + this.project._id + '/editfaq', this.id_faq_kb, faq_id]);
  }

  goBackToFaqKbList() {
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.router.navigate(['project/' + this.project._id + '/bots']);
  }

  /**
   * GET ALL FAQ
   * !! NO MORE USED: NOW GET ONLY THE FAQ WITH THE FAQ-KB ID (getFaqByFaqKbId()) OF THE FAQ KB SELECTED IN FAQ-KB COMP
   */
  // getFaq() {
  //   this.mongodbFaqService.getMongDbFaq().subscribe((faq: any) => {
  //     console.log('MONGO DB FAQ', faq);
  //     this.faq = faq;
  //   });
  // }

  /**
   * GET ONLY THE FAQ WITH THE FAQ-KB ID PASSED FROM FAQ-KB COMPONENT
   */
  getFaqByFaqKbId() {
    this.mongodbFaqService.getMongoDbFaqByFaqKbId(this.id_faq_kb).subscribe((faq: any) => {
      console.log('>> FAQs GOT BY FAQ-KB ID', faq);
      this.faq = faq;

      if (faq) {
        this.faq_lenght = faq.length
      }
    }, (error) => {
      this.showSpinner = false;
      console.log('>> FAQs GOT BY FAQ-KB ID - ERROR', error);

    }, () => {
      this.showSpinner = false;
      console.log('>> FAQs GOT BY FAQ-KB ID - COMPLETE');
    });
  }

  exportFaqsToCsv() {

    this.mongodbFaqService.exsportFaqsToCsv(this.id_faq_kb).subscribe((faq: any) => {
      console.log('FAQ COMP - EXPORT FAQ TO CSV - FAQS', faq)

      if (faq) {
        this.downloadFile(faq, 'faqs.csv');
      }
    }, (error) => {
      console.log('FAQ COMP - EXPORT FAQ TO CSV - ERROR', error);

    }, () => {
      console.log('FAQ COMP - EXPORT FAQ TO CSV - COMPLETE');
    });
  }

  //   var link = document.createElement("a");
  // link.id = "csvDwnLink";

  // document.body.appendChild(link);
  // window.URL = window.URL || window.webkitURL;
  // var csv = "\ufeff" + CSV,
  //     csvData = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csv),
  //     filename = 'filename.csv';
  // $("#csvDwnLink").attr({'download': filename, 'href': csvData});
  // $('#csvDwnLink')[0].click();
  // document.body.removeChild(link);

  downloadFile(data, filename) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    console.log('isSafariBrowser ', isSafariBrowser)
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');

      /**
       * *** FOR SAFARI TO UNCOMMENT AND TEST ***
       */
      // https://stackoverflow.com/questions/29799696/saving-csv-file-using-blob-in-safari/46641236
      // const link = document.createElement('a');
      // link.id = 'csvDwnLink';

      // document.body.appendChild(link);
      // window.URL = window.URL;
      // const csv = '\ufeff' + data,
      //   csvData = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csv),
      //   filename = 'filename.csv';
      // $('#csvDwnLink').attr({ 'download': filename, 'href': csvData });
      // $('#csvDwnLink')[0].click();
      // document.body.removeChild(link);
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename);
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  downloadExampleCsv() {
    const examplecsv = 'Question 1; Answer 1'
    this.downloadFile(examplecsv, 'example.csv');
  }



  /**
   * ADD FAQ
   */
  // createFaq() {
  //   console.log('MONGO DB CREATE FAQ QUESTION: ', this.question, ' ANSWER: ', this.answer, ' ID FAQ KB ', this.id_faq_kb);
  //   this.mongodbFaqService.addMongoDbFaq(this.question, this.answer, this.id_faq_kb)
  //     .subscribe((faq) => {
  //       console.log('POST DATA ', faq);

  //       this.question = '';
  //       this.answer = '';
  //       // RE-RUN GET FAQ TO UPDATE THE TABLE
  //       // this.getDepartments();
  //       this.ngOnInit();
  //     },
  //     (error) => {

  //       console.log('POST REQUEST ERROR ', error);

  //     },
  //     () => {
  //       console.log('POST REQUEST * COMPLETE *');
  //     });

  // }

  /**
   * MODAL DELETE FAQ
   * @param id
   * @param hasClickedDeleteModal
   */
  // deptName: string,
  openDeleteModal(id: string) {

    console.log('ON OPEN MODAL TO DELETE FAQ -> FAQ ID ', id);

    this.display = 'block';

    this.id_toDelete = id;
    // this.faq_toDelete = deptName;
  }

  /**
   * DELETE FAQ (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)  */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.mongodbFaqService.deleteMongoDbFaq(this.id_toDelete).subscribe((data) => {
      console.log('DELETE FAQ ', data);

      // RE-RUN GET FAQ BY FAQ KB ID TO UPDATE THE TABLE
      // this.getFaqByFaqKbId();
      this.ngOnInit();

      /* https://stackoverflow.com/questions/21315306/how-to-stop-window-scroll-after-specific-event */
      // const $window = $(window);
      // let previousScrollTop = 0;
      // const scrollLock = true;
      // console.log('»»» 1) SCROLL LOCK ', scrollLock)
      // $window.scroll(function (event) {
      //   if (scrollLock) {
      //     console.log('»»» 2)SCROLL LOCK ', scrollLock)
      //     $window.scrollTop(previousScrollTop);
      //   }

      //   previousScrollTop = $window.scrollTop();

      // });
    }, (error) => {

      console.log('DELETE FAQ ERROR ', error);
      // =========== NOTIFY ERROR ===========
      this.notify.showNotification('An error occurred while deleting the FAQ', 4, 'report_problem');
    }, () => {
      console.log('DELETE FAQ * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      this.notify.showNotification('FAQ successfully deleted', 2, 'done');
    });

  }

  /**
   * MODAL UPDATE FAQ
   * !!! NO MORE USED: THE ACTION UPDATE IS IN FAQ- EDIT-ADD COMPONENT
   * @param id
   * @param question
   * @param answer
   * @param hasClickedUpdateModal
   */
  openUpdateModal(id: string, question: string, answer: string, hasClickedUpdateModal: boolean) {
    // display the modal windows (change the display value in the view)
    console.log('HAS CLICKED OPEN MODAL TO UPDATE USER DATA ', hasClickedUpdateModal);
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = hasClickedUpdateModal;
    this.DISPLAY_DATA_FOR_DELETE_MODAL = false;

    if (hasClickedUpdateModal) {
      this.display = 'block';
    }

    console.log('ON MODAL OPEN -> FAQ ID ', id);
    console.log('ON MODAL OPEN -> FAQ QUESTION TO UPDATE', question);
    console.log('ON MODAL OPEN -> FAQ ANSWER TO UPDATE', answer);

    this.id_toUpdate = id;
    this.question_toUpdate = question;
    this.answer_toUpdate = answer;
  }

  /**
   * UPDATE FAQ (WHEN THE 'SAVE' BUTTON IN MODAL IS CLICKED)
   * !!! NO MORE USED: THE ACTION UPDATE IS IN FAQ- EDIT-ADD COMPONENT
   */
  onCloseUpdateModalHandled() {
    // HIDE THE MODAL
    this.display = 'none';

    console.log('ON MODAL UPDATE CLOSE -> FAQ ID ', this.id_toUpdate);
    console.log('ON MODAL UPDATE CLOSE -> FAQ QUESTION UPDATED ', this.question_toUpdate);
    console.log('ON MODAL UPDATE CLOSE -> FAQ ANSWER UPDATED ', this.answer_toUpdate);

    this.mongodbFaqService.updateMongoDbFaq(this.id_toUpdate, this.question_toUpdate, this.answer_toUpdate).subscribe((data) => {
      console.log('PUT DATA ', data);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getDepartments();
      this.ngOnInit();
    }, (error) => {

      console.log('PUT REQUEST ERROR ', error);

    }, () => {
      console.log('PUT REQUEST * COMPLETE *');
    });

  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
    this.displayInfoModal = 'none';
    this.displayImportModal = 'none';
  }

  openImportModal() {
    this.displayImportModal = 'block';
  }

  onCloseInfoModalHandledSuccess() {
    console.log('onCloseInfoModalHandledSuccess')
    this.displayInfoModal = 'none';
    this.ngOnInit();
  }
  onCloseInfoModalHandledError() {
    console.log('onCloseInfoModalHandledError')
    this.displayInfoModal = 'none';
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.ngOnInit();
  }

  countDelimiterDigit(event) {
    console.log(' # OF DIGIT ', this.csvColumnsDelimiter.length)
    if (this.csvColumnsDelimiter.length !== 1) {
      (<HTMLInputElement>document.getElementById('file')).disabled = true;
      this.modalChoosefileDisabled = true;
    } else {
      (<HTMLInputElement>document.getElementById('file')).disabled = false;
      this.modalChoosefileDisabled = false;
    }
  }
  // UPLOAD FAQ FROM CSV
  fileChange(event) {
    this.displayImportModal = 'none';
    this.displayInfoModal = 'block';

    this.SHOW_CIRCULAR_SPINNER = true;

    console.log('CSV COLUMNS DELIMITER ', this.csvColumnsDelimiter)
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.set('id_faq_kb', this.id_faq_kb);
      formData.set('delimiter', this.csvColumnsDelimiter);
      formData.append('uploadFile', file, file.name);
      console.log('FORM DATA ', formData)

      this.mongodbFaqService.uploadFaqCsv(formData)
        .subscribe(data => {
          console.log('UPLOAD CSV DATA ', data);
          if (data['success'] === true) {
            this.parse_done = true;
            this.parse_err = false;
          } else if (data['success'] === false) {
            this.parse_done = false;
            this.parse_err = true;
          }
        }, (error) => {
          console.log('UPLOAD CSV - ERROR ', error);
          this.SHOW_CIRCULAR_SPINNER = false;
        }, () => {
          console.log('UPLOAD CSV * COMPLETE *');
          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
          }, 300);
        });

    }
  }

  // public changeListener(files: FileList) {
  //   console.log(files);
  //   if (files && files.length > 0) {
  //     const file: File = files.item(0);
  //     console.log(file.name);
  //     console.log(file.size);
  //     console.log(file.type);
  //     const reader: FileReader = new FileReader();
  //     reader.readAsText(file);
  //     reader.onload = (e) => {
  //       const csv: string = reader.result;
  //       console.log(csv);
  //     }
  //   }
  // }

}
