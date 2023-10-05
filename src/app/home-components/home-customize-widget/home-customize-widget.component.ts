import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-customize-widget',
  templateUrl: './home-customize-widget.component.html',
  styleUrls: ['./home-customize-widget.component.scss']
})
export class HomeCustomizeWidgetComponent implements OnInit {
@Output() trackUserAction = new EventEmitter()
 public project: any;
  constructor(
    private logger: LoggerService,
    private auth: AuthService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.getCurrentProject();
  }
  getCurrentProject() {
  
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      this.logger.log('[HOME-CUSTOMIZE-WIDGET] - SUBSCRIBE TO CURRENT PROJECT  ', this.project)
    })
  }

  goToWidgetSetUp() {
    this.trackUserAction.emit({action:'Customize widget',actionRes: null })
    this.router.navigate(['project/' + this.project._id + '/widget-set-up'])
  }

}
