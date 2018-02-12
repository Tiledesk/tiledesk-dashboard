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

}
