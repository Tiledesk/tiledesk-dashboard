import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { Location } from '@angular/common';


export interface Task {
  name: string;
  completed: boolean;
  subtasks?: Task[];
}

@Component({
  selector: 'appdashboard-users-new-role',
  templateUrl: './users-new-role.component.html',
  styleUrls: ['./users-new-role.component.scss']
})

export class UsersNewRoleComponent implements OnInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  IS_OPEN_SETTINGS_SIDEBAR: boolean
  isChromeVerGreaterThan100: boolean
  id_project: string;
  panelOpenState = false;
  newRoleName: string;

  task: Task = {
    name: 'Indeterminate',
    completed: false,
    subtasks: [
      { name: 'Primary', completed: false },
      { name: 'Accent', completed: false },
      { name: 'Warn', completed: false},
    ],
  };

   allComplete: boolean = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    public notify: NotifyService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    public location: Location
  ) { }

  ngOnInit(): void {
    this.listenSidebarIsOpened();
    this.getBrowserVersion();
    this.getCurrentProject()
    //  this.getOSCODE()
  }



  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {

          this.id_project = project._id;
          this.logger.log('[CREATE-NEW-ROLE] - GET CURRENT PROJECT -> project ID', this.id_project)
        }
      })
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[CREATE-NEW-ROLE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[CREATE-NEW-ROLE] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    })
  }

  goBack() {
    this.location.back();
  }

  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => (t.completed = completed));
  }

}
