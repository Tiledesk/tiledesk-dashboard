import { Component, OnInit } from '@angular/core';
import { BotService } from '../services/bot.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FaqKbService } from '../services/faq-kb.service';
import { forEach } from '@angular/router/src/utils/collection';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'bot-edit-add',
  templateUrl: './bot-edit-add.component.html',
  styleUrls: ['./bot-edit-add.component.scss'],
})
export class BotEditAddComponent implements OnInit {

  faqKbList: any;
  faqKbId: string;

  selectedFaqKbId: any;
  selectedValue: string;
  selectedId: string;

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = true;
  bot_fullname: string;
  botFullNAme_toUpdate: string;
  id_bot: string;

  FAQKB_NOT_SELECTED = true;

  faqKbEdit: string;

  constructor(
    private botService: BotService,
    private router: Router,
    private route: ActivatedRoute,
    private faqKbService: FaqKbService,
  ) { }

  ngOnInit() {

    /**
     * *** GET ALL FAQ KB LIST ***
     * ARE SHOWED AS OPTIONS TO SELECT IN THE SELECTION FIELD (IN CREATE AND IN EDIT VIEW)
     */
    this.getFaqKb();

    /**
     * BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ PAGE) 'CREATE' OR 'EDIT'
     */
    if (this.router.url === '/createbot') {

      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;

    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;

      // *** GET BOT ID FROM URL PARAMS ***
      // IS USED TO GET THE BOT OBJECT ( THE ID IS PASSED FROM BOTS COMPONENT - goToEditAddPage_EDIT())
      this.getBotId();

      // this.getBotIdAndFaqKbId();

      if (this.id_bot) {
        this.getBotById();
      }

    }
  } // ./ OnInit

  getBotId() {
    this.id_bot = this.route.snapshot.params['botid'];
    console.log('BOT COMPONENT HAS PASSED id_bot ', this.id_bot);
  }

  // GET BOT ID AND FAQ-KB ID FROM URL PARAMS (PASSED BY BOTS COMPONENT goToEditAddPage_EDIT())
  // !!! NO MORE USED
  // getBotIdAndFaqKbId() {
  //   this.route.params.subscribe((params) => {
  //     this.id_bot = params.botid;
  //     this.faqKbId = params.faqkbid;
  //     // console.log(params);
  //     console.log('BOT ID ', this.id_bot);
  //     console.log('FAQ KB ID ', this.faqKbId);
  //   });
  // }

  /**
   * *** GET BOT OBJECT BY ID AND (THEN) GET FAQ-KB OBJECT BY ID ***
   * THE ID USED TO RUN THIS getMongDbBotById IS PASSED FROM BOTS LIST (BOTS COMPONENT goToEditAddPage_EDIT))
   * FROM THE BOT OBJECT IS USED:
   * THE BOT FULLNAME TO SHOW IN THE INPUT FIELD (OF THE EDIT VIEW)
   * THE FAQ-KB ID TO RUN A CALLBACK TO OBTAIN THE FAQ-KB OBJECT AND, FROM THIS,
   * THE FAQ-KB NAME THAT IS SHOWED AS OPTION SELECTED IN THE EDIT VIEW
   */
  getBotById() {
    this.botService.getMongDbBotById(this.id_bot).subscribe((bot: any) => {
      console.log('++ > GET BOT (DETAILS) BY ID - BOT OBJECT: ', bot);

      this.botFullNAme_toUpdate = bot.fullname;
      this.faqKbId = bot.id_faq_kb;

      console.log(' BOT FULLNAME TO UPDATE: ', this.botFullNAme_toUpdate);
      console.log(' FAQ-KB ID GET FROM BOT OBJECT: ', this.faqKbId);

    },
      (error) => {
        console.log('GET BOT BY ID - ERROR ', error);
        this.showSpinner = false;
      },
      () => {
        console.log('GET BOT BY ID - COMPLETE ');

        // MOVED IN getFaqKbById
        // this.showSpinner = false;

        if (this.faqKbId === 'undefined') {
          console.log(' !!! FAQ-KB ID UNDEFINED ', this.faqKbId);
          this.showSpinner = false;
          // this.selectedValue = 'Selezione FAQ KB';

        } else {
          this.getFaqKbById();
          console.log(' !!! FAQ-KB ID DEFINED ', this.faqKbId);
        }
      });

  }

  /**
   * *** GET FAQ-KB BY ID ***
   * THE ID OF THE FAQ-KB IS GET FROM THE BOT OBJECT (CALLBACK getBotById)
   * FROM THE FAQ-KB OBJECT IS USED:
   * THE FAQ-KB NAME THAT IS SHOWED AS OPTION SELECTED IN THE EDIT VIEW
   */
  getFaqKbById() {
    this.faqKbService.getMongDbFaqKbById(this.faqKbId).subscribe((faqKb: any) => {
      console.log('GET FAQ-KB (DETAILS) BY ID', faqKb);
      // NOW USED ONLY FOR DEBUG
      this.selectedValue = faqKb.name;
      this.selectedId = faqKb._id;
      // this.faqKbUrlToUpdate = faqKb.url;
      console.log(' ++ ++ FAQ-KB NAME', this.selectedValue);

    },
      (error) => {
        console.log('GET FAQ-KB BY ID - ERROR ', error);
        this.showSpinner = false;
      },
      () => {
        console.log('GET FAQ-KB ID - COMPLETE ');
        this.showSpinner = false;

      });

  }

  // GO BACK TO FAQ COMPONENT
  goBackToBotList() {
    this.router.navigate(['/bots']);
  }

  /**
   * *** GET ALL FAQ KB LIST ***
   */
  getFaqKb() {
    this.faqKbService.getMongDbFaqKb().subscribe((faqkb: any) => {
      console.log('GET FAQ-KB LIST (TO SHOW IN SELECTION FIELD) ', faqkb);
      this.faqKbList = faqkb;
    },
      (error) => {
        console.log('GET FAQ-KB LIST - ERROR ', error);

      },
      () => {
        console.log('GET FAQ-KB LIST - COMPLETE ');

      });
  }

  // WHEN THE USER EDITS A BOT CAN SELECT A FAQ-KB TO CORRELATE AT THE BOT
  // WHEN THE BTN 'EDIT BOT' IS PRESSED THE VALUE OF THE ID OF THE SELECTED FAQ-KB IS MODIFIED IN THE BOT'S FIELD id_faq_kb
  setSelectedFaqKb(id: any): void {
    this.selectedFaqKbId = id;
    console.log('FAQ-KB ID SELECTED: ', this.selectedFaqKbId);

    // IN THE CREATE VIEW IF IS NOT SELECTET ANY FAQ-KB THE BUTTON 'CREATE BOT' IS DISABLED
    if (this.selectedFaqKbId !== 'FAQKB_NOT_SELECTED') {
      this.FAQKB_NOT_SELECTED = false;
    }
    // let i: any;
    // for (i = 0; i < this.faqKbList.length; i++) {
    //   this.faqKbId = this.faqKbList[i]._id;
    //   if (this.selectedFaqKbId === this.faqKbId) {
    //     this.selectedValue = this.faqKbList[i].name;
    //     console.log('SELECTED VALUE ', this.faqKbList[i].name);

    //   }
    // }
    // Match the selected ID with the ID's in array
    // const curFaqKb = this.faqKbList.filter((value: any) => value.id === parseInt(id[0], 10));
    // console.log(curFaqKb);
  }

  /**
   * ADD BOT
   */
  createBot() {
    console.log('CREATE BOT - BOT-FULLNAME DIGIT BY USER ', this.bot_fullname);
    console.log('CREATE BOT - FAQ-KB ID', this.selectedFaqKbId);
    this.botService.addMongoDbBot(this.bot_fullname, this.selectedFaqKbId)
      .subscribe((bot) => {
        console.log('POST DATA ', bot);

        // this.bot_fullname = '';

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
      (error) => {
        console.log('CREATE BOT - POST REQUEST ERROR ', error);
      },
      () => {
        console.log('CREATE BOT - POST REQUEST COMPLETE ');

        this.router.navigate(['/bots']);
      });
  }

  // WHEN IS PRESSES EDIT THE DATA PASSED TO THE FUNCTION updateMongoDbBot() ARE
  // * this.id_bot: IS PASSED BY BOT COMPONENT VIA URL (see getBotId())
  // * botFullNAme_toUpdate: IS RETURNED BY THE BOT OBJECT (see getBotById)
  edit() {
    console.log('BOT ID WHEN EDIT IS PRESSED ', this.id_bot);
    console.log('BOT FULL-NAME WHEN EDIT IS PRESSED ', this.botFullNAme_toUpdate);
    console.log('BOT FAQ-KB WHEN EDIT IS PRESSED IF USER HAS SELECT ANOTHER FAQ-KB', this.faqKbId);
    console.log('BOT FAQ-KB WHEN EDIT IS PRESSED IF USER ! DOES NOT SELECT A ANOTHER FAQ-KB', this.faqKbId);

    // selectedFaqKbId
    // IF THE USER, WHEN EDIT THE BOT, DOESN'T SELECT ANY NEW FAQ-KB this.selectedFaqKbId IS UNDEFINED
    // SO SET this.faqKbEdit EQUAL TO THE FAQ-KB ID RETURNED BY getBotById
    if (this.selectedFaqKbId === undefined) {

      this.faqKbEdit = this.faqKbId

    } else {
      this.faqKbEdit = this.selectedFaqKbId
    }
    this.botService.updateMongoDbBot(this.id_bot, this.botFullNAme_toUpdate, this.faqKbEdit).subscribe((data) => {
      console.log('PUT DATA ', data);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getDepartments();
      // this.ngOnInit();
    },
      (error) => {
        console.log('PUT REQUEST ERROR ', error);
      },
      () => {
        console.log('PUT REQUEST * COMPLETE *');

        this.router.navigate(['/bots']);
      });

  }

}
