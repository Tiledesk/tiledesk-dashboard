import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
@Component({
  selector: 'appdashboard-home-go-to-chat',
  templateUrl: './home-go-to-chat.component.html',
  styleUrls: ['./home-go-to-chat.component.scss']
})
export class HomeGoToChatComponent implements OnInit {
  CHAT_BASE_URL: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  current_prjct: any;
  constructor(
    public appConfigService: AppConfigService,
    private notify: NotifyService,
    private logger: LoggerService,
    public auth: AuthService,
    private projectService: ProjectService,
  ) { }

  ngOnInit(): void {
    this.getCurrentProject()
    this.getChatUrl()
  }

  ngOnDestroy() {
    // this.logger.log('HOME COMP - CALLING ON DESTROY')
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        // this.logger.log('[HOME-GO-TO-CHAT] $UBSCIBE TO PUBLISHED PROJECT - RES  --> ', project)

        if (project) {
          this.findCurrentProjectAmongAll(project._id)

        }
      }, (error) => {
        this.logger.error('[HOME-GO-TO-CHAT] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-GO-TO-CHAT] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }

  findCurrentProjectAmongAll(projectId: string) {

    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[HOME-GO-TO-CHAT] getProjects projects ', projects);
      if (projects) {

        projects = projects.filter((project: any) => {

          return project.id_project.status === 100;

        });
        this.logger.log('[HOME-GO-TO-CHAT] getProjects this.projects ', projects);
      }

      this.current_prjct = projects.find(prj => prj.id_project.id === projectId);
      // this.logger.log('[HOME-GO-TO-CHAT] - Find Current Project Among All current_prjct: ',  this.current_prjct);

    }, error => {
      this.logger.error('[HOME-GO-TO-CHAT] - Find Current Project Among All: ', error);
    }, () => {
      this.logger.log('[HOME-GO-TO-CHAT] - Find Current Project Among All * COMPLETE * ');

    });
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    this.logger.log('[HOME-GO-TO-CHAT] AppConfigService getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL);
  }

  openChat() {
    // const url = this.CHAT_BASE_URL;
    this.notify.publishHasClickedChat(true);
    // window.open(url, '_blank');

    // --- new
    localStorage.setItem('last_project', JSON.stringify(this.current_prjct))
    let baseUrl = this.CHAT_BASE_URL + '#/conversation-detail/'
    let url = baseUrl
    const myWindow = window.open(url, '_self', 'Tiledesk - Open Source Live Chat');
    myWindow.focus();


  }

}
