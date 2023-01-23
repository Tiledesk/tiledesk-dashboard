import { element } from 'protractor';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';
import { timeStamp } from 'console';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cds-sidebar',
  templateUrl: './cds-sidebar.component.html',
  styleUrls: ['./cds-sidebar.component.scss']
})
export class CdsSidebarComponent implements OnInit {

  @Input() extendedWidth: boolean;
  @Input() projectID: string
  @Output() onClickItemList = new EventEmitter<string>()
  USER_ROLE:any
  IS_OPEN: boolean = true

  private unsubscribe$: Subject<any> = new Subject<any>();
  
  constructor(
    private logger: LoggerService,
    private auth: AuthService,
    private usersService: UsersService,
  ) { }

  ngOnInit(): void {
    this.getUserRole();
    this.goTo('intents')
  }


  getUserRole() {
    this.usersService.project_user_role_bs.pipe( takeUntil(this.unsubscribe$)).subscribe((userRole) => {
         console.log('[CDS-SIDEBAR] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  listenSidebarIsOpened() {
    this.auth.tilebotSidebarIsOpened.subscribe((isopened) => {
      this.logger.log('[CDS-SIDEBAR] CDS-SIDEBAR is opened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN = isopened
    })
  }

  toggletilebotSidebar(IS_OPEN) {
    // console.log('[SETTINGS-SIDEBAR] IS_OPEN ', IS_OPEN)
    this.IS_OPEN = IS_OPEN;
    this.auth.toggletilebotSidebar(IS_OPEN)
  }

  goTo(section: "intents" | "fulfillment" | "training" | "rules" | "settings") {
    this.logger.log('[CDS-SIDEBAR] goTo item ', section)

    let elements = Array.from(document.getElementsByClassName('section is_active'));
    if (elements.length != 0) {
      elements.forEach((el) => {
        el.classList.remove('is_active');
      })
    }

    const element = document.getElementById(section);
    console.log('[CDS-SIDEBAR] go to element ', element) 
    element.classList.toggle("is_active");

    this.onClickItemList.emit(section)
  }

  

}
