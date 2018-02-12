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

  countries: string[] = ['USA', 'UK', 'Canada'];
  default = 'UK';
  countryForm: FormGroup;

  faqKbList: any;
  faqKbId: string;

  selectedFaqKbId: any;
  // selectedValue = null;
  selectedValue: string;



  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = true;
  bot_fullname: string;
  botFullNAme_toUpdate: string;
  id_bot: string;

  constructor(
    private botService: BotService,
    private router: Router,
    private route: ActivatedRoute,
    private faqKbService: FaqKbService,
  ) {
    // this.countryForm = new FormGroup({
    //   country: new FormControl(null),
    // });
    // this.countryForm.controls['country'].setValue(this.default, { onlySelf: true });
    // console.log('THIS DEFAULT ', this.default);
  }

  ngOnInit() {

    // this.selectedValue = 'Selezione FAQ KB';
    console.log('SELECTED VALUE ', this.selectedValue);
    if (this.selectedValue === undefined) {
      this.selectedValue = 'Selezione FAQ KB';
    }
    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ PAGE) 'CREATE' OR 'EDIT'
    if (this.router.url === '/createbot') {
      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;

    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      // this.getBotId();

      this.getBotIdAndFaqKbId();

      if (this.id_bot) {
        this.getBotById();
      }
      if (this.faqKbId ) {
        this.getFaqKbById();
      }

      // GET FAQ KB (READ) - TO SHOW IN SELECT > OPTION
      this.getFaqKb();

    }
  }

  /**
   * GET FAQ-KB BY ID
   */
  getFaqKbById() {
    this.faqKbService.getMongDbFaqKbById(this.faqKbId).subscribe((faqKb: any) => {
      console.log('MONGO DB FAQ-KB GET BY ID', faqKb);
      this.selectedValue = faqKb.name;
      // this.faqKbUrlToUpdate = faqKb.url;
      console.log(' ++ ++ MONGO DB FAQ-KB NAME', this.selectedValue);

    });
  }

  getBotId() {
    this.id_bot = this.route.snapshot.params['botid'];
    console.log('BOT COMPONENT HAS PASSED id_bot ', this.id_bot);
  }

  getBotIdAndFaqKbId() {
    this.route.params.subscribe((params) => {
      this.id_bot = params.botid;
      this.faqKbId = params.faqkbid;
      // console.log(params);
      console.log('BOT ID ', this.id_bot);
      console.log('FAQ KB ID ', this.faqKbId);
    });

  }

  // GO BACK TO FAQ COMPONENT
  goBackToBotList() {
    this.router.navigate(['/bots']);
  }

  /**
   * GET FAQ KB (READ) - TO SHOW IN SELECT > OPTION
   */
  getFaqKb() {
    this.faqKbService.getMongDbFaqKb().subscribe((faqkb: any) => {
      console.log('MONGO DB FAQKB', faqkb);
      this.faqKbList = faqkb;
    });
  }

  // WHEN THE USER EDITS A BOT CAN SELECT A FAQ-KB TO CORRELATE AT THE BOT
  // WHEN THE BTN EDIT IS PRESSED THE VALUE OF THE ID OF THE SELECTED FAQ-KB ID IS ADDED IN THE BOT'S FIELD id_faq_kb
  setSelectedFaqKb(id: any): void {
    this.selectedFaqKbId = id;
    console.log('SELECTED FAQ KB ID ', this.selectedFaqKbId);

    let i: any;
    for (i = 0; i < this.faqKbList.length; i++) {
      this.faqKbId = this.faqKbList[i]._id;
      // console.log('FAQ KB ID ', this.faqKbId);

      if (this.selectedFaqKbId === this.faqKbId) {
        // console.log('FAQ KB OBJECT SELECTED ', this.faqKbList[i]);
        // this.selectedValue = this.faqKbList[i].name;
        // console.log('NAME OF FAQ KB SELECTED ', this.faqKbList[i].name);
        this.selectedValue = this.faqKbList[i].name;
        console.log('SELECTED VALUE ', this.faqKbList[i].name);

      }
    }

    // Match the selected ID with the ID's in array
    // const curFaqKb = this.faqKbList.filter((value: any) => value.id === parseInt(id[0], 10));
    // console.log(curFaqKb);
  }

  /**
   * ADD BOT
   */
  createBot() {
    console.log('MONGO DB BOT-FULLNAME DIGIT BY USER ', this.bot_fullname);
    this.botService.addMongoDbBots(this.bot_fullname)
      .subscribe((bot) => {
        console.log('POST DATA ', bot);

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

        this.router.navigate(['/bots']);
      });
  }

  /**
   * GET BOT BY ID (GET THE DATA OF THE BOT BY THE ID PASSED FROM BOT LIST)
   * USED TO SHOW IN THE IMPUT FIELD THE BOT FULLNAME THAT USER WANT UPDATE
   */
  getBotById() {
    this.botService.getMongDbBotById(this.id_bot).subscribe((bot: any) => {
      console.log('MONGO DB BOT GET BY ID', bot);
      this.botFullNAme_toUpdate = bot.fullname;

      console.log('MONGO DB BOT FULLNAME TO UPDATE', this.botFullNAme_toUpdate);
      this.showSpinner = false;
    });
  }

  edit() {
    console.log('BOT ID TO UPDATE ', this.id_bot);
    console.log('BOT FULL-NAME UPDATED ', this.botFullNAme_toUpdate);
    this.botService.updateMongoDbBot(this.id_bot, this.botFullNAme_toUpdate, this.selectedFaqKbId).subscribe((data) => {
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
