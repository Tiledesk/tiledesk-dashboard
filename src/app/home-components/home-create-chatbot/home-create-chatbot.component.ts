import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'appdashboard-home-create-chatbot',
  templateUrl: './home-create-chatbot.component.html',
  styleUrls: ['./home-create-chatbot.component.scss']
})
export class HomeCreateChatbotComponent implements OnInit {

  private unsubscribe$: Subject<any> = new Subject<any>();
  projectId: string;
  constructor(
    public auth: AuthService,
    private logger: LoggerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getCurrentProjectAndInit();
  }

  getCurrentProjectAndInit() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        console.log('[HOME-CREATE-CHATBOT] $UBSCIBE TO PUBLISHED PROJECT - RES  ', project)

        if (project) {
          
          this.projectId = project._id
        }
      }, (error) => {
        this.logger.error('[HOME-CREATE-CHATBOT] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-CREATE-CHATBOT] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }


  goToTemplates() {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/all']);
  }

  goToCommunityTemplates() {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/community']);
  }

  goToAddBotFromScratch() { 
    this.router.navigate(['project/' + this.projectId + '/bots/create/tilebot/blank']);
  }


}
