import { Component, OnInit } from '@angular/core';
import { BotService } from '../services/bot.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'bot-edit-add',
  templateUrl: './bot-edit-add.component.html',
  styleUrls: ['./bot-edit-add.component.scss'],
})
export class BotEditAddComponent implements OnInit {

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
  ) { }

  ngOnInit() {
    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ PAGE) 'CREATE' OR 'EDIT'
    if (this.router.url === '/createbot') {
      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;

    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      this.getBotId();

      if (this.id_bot) {
        this.getBotById();
      }
    }
  }

  // GO BACK TO FAQ COMPONENT
  goBackToBotList() {
    this.router.navigate(['/bots']);
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
      console.log('MONGO DB FAQ GET BY ID', bot);
      this.botFullNAme_toUpdate = bot.fullname;

      console.log('MONGO DB BOT FULLNAME TO UPDATE', this.botFullNAme_toUpdate);
      this.showSpinner = false;
    });
  }

  getBotId() {
    this.id_bot = this.route.snapshot.params['botid'];
    console.log('BOT COMPONENT HAS PASSED id_bot ', this.id_bot);
  }

  edit() {
    console.log('BOT ID TO UPDATE ', this.id_bot);
    console.log('BOT FULL-NAME UPDATED ', this.botFullNAme_toUpdate);
    this.botService.updateMongoDbBot(this.id_bot, this.botFullNAme_toUpdate).subscribe((data) => {
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
