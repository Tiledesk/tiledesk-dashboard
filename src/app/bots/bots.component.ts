import { Component, OnInit } from '@angular/core';
import { BotService } from '../services/bot.service';
import { Bot } from '../models/bot-model';
import { Router } from '@angular/router';

@Component({
  selector: 'bots',
  templateUrl: './bots.component.html',
  styleUrls: ['./bots.component.scss'],
})
export class BotsComponent implements OnInit {

  bots: Bot[];

  bot_fullname: string;

  // SWITCH DISPLAYED DATA IN THE MODAL DEPENDING ON WHETHER THE
  // USER CLICK ON DELETE BTN OR ON EDIT BUTTON
  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;

  // set to none the property display of the modal
  display = 'none';

  botFullNAme_toUpdate: string;
  id_toUpdate: string;

  botFullNAme_toDelete: string;
  id_toDelete: string;
  id_faq_kb: string;

  constructor(
    private botService: BotService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getBots();
  }

  /**
   * GET BOTS (READ)
   */
  getBots() {
    this.botService.getMongDbBots().subscribe((bots: any) => {
      console.log('GET BOTS ', bots);
      this.bots = bots;
    });
  }

    // GO TO  BOT-EDIT-ADD COMPONENT
    goToEditAddPage_CREATE() {
      this.router.navigate(['/createbot']);
    }

  // GO TO BOT-EDIT-ADD COMPONENT AND PASS THE BOT ID (RECEIVED FROM THE VIEW)
  goToEditAddPage_EDIT(bot_id: string) {
    console.log('BOT ID ', bot_id);
    this.router.navigate(['/editbot', bot_id]);
  }

  /**
   * ADD BOT
   * !!! NO MORE USED IN THIS COMPONENT: MOVED IN BOT-EDIT-ADD
   */
  // createBot() {
  //   console.log('MONGO DB BOT-FULLNAME DIGIT BY USER ', this.bot_fullname);
  //   this.botService.addMongoDbBots(this.bot_fullname)
  //     .subscribe((bot) => {
  //       console.log('POST DATA ', bot);

  //       this.bot_fullname = '';

  //       // RE-RUN GET CONTACT TO UPDATE THE TABLE
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
   * MODAL DELETE BOT
   * @param id
   * @param botFullName
   * @param hasClickedDeleteModal
   */
  openDeleteModal(id: string, botFullName: string, hasClickedDeleteModal: boolean) {
    console.log('HAS CLICKED OPEN DELETE MODAL TO CONFIRM BEFORE TO DELETE ', hasClickedDeleteModal);
    console.log('ON OPEN DELETE MODAL -> BOT ID ', id);
    this.DISPLAY_DATA_FOR_DELETE_MODAL = hasClickedDeleteModal;
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = false;

    if (hasClickedDeleteModal) {
      this.display = 'block';
    }

    this.id_toDelete = id;
    this.botFullNAme_toDelete = botFullName;
  }

  /**
   * DELETE BOT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)
   */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.botService.deleteMongoDbBot(this.id_toDelete).subscribe((data) => {
      console.log('DELETE DATA ', data);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getDepartments();
      this.ngOnInit();

    },
      (error) => {

        console.log('DELETE REQUEST ERROR ', error);

      },
      () => {
        console.log('DELETE REQUEST * COMPLETE *');
      });

  }

  /**
   * MODAL UPDATE BOT
   * @param id
   * @param botFullName
   * @param hasClickedUpdateModal
   */
  openUpdateModal(id: string, botFullName: string, hasClickedUpdateModal: boolean) {
    // display the modal windows (change the display value in the view)
    console.log('HAS CLICKED OPEN MODAL TO UPDATE BOT DATA ', hasClickedUpdateModal);
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = hasClickedUpdateModal;
    this.DISPLAY_DATA_FOR_DELETE_MODAL = false;

    if (hasClickedUpdateModal) {
      this.display = 'block';
    }

    console.log('ON MODAL OPEN -> BOT ID ', id);
    console.log('ON MODAL OPEN -> BOT FULL-NAME TO UPDATE', botFullName);

    this.id_toUpdate = id;
    this.botFullNAme_toUpdate = botFullName;
  }

/**
 * UPDATE BOT (WHEN THE 'SAVE' BUTTON IN MODAL IS CLICKED)
 * !!! NO MORE USED IN THIS COMPONENT: MOVED IN BOT-EDIT-ADD
 */
  // onCloseUpdateModalHandled() {
  //   // HIDE THE MODAL
  //   this.display = 'none';

  //   console.log('ON MODAL UPDATE CLOSE -> BOT ID ', this.id_toUpdate);
  //   console.log('ON MODAL UPDATE CLOSE -> BOT FULL-NAME UPDATED ', this.botFullNAme_toUpdate);
  //   this.botService.updateMongoDbBot(this.id_toUpdate, this.botFullNAme_toUpdate).subscribe((data) => {
  //     console.log('PUT DATA ', data);

  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getDepartments();
  //     this.ngOnInit();
  //   },
  //     (error) => {

  //       console.log('PUT REQUEST ERROR ', error);

  //     },
  //     () => {
  //       console.log('PUT REQUEST * COMPLETE *');
  //     });

  // }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
  }
}
