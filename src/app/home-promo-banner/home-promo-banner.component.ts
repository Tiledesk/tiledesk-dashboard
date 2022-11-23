import { Component, EventEmitter, Input, isDevMode, OnInit, Output } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { HomeService } from 'app/services/home.service';
import { LoggerService } from '../services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-promo-banner',
  templateUrl: './home-promo-banner.component.html',
  styleUrls: ['./home-promo-banner.component.scss']
})
export class HomePromoBannerComponent implements OnInit {
  dispayPromoBanner: boolean = true;
  promoBannerContent: any;
  promoBannerSyle: any;
  resPromoBanner: any;
  projectId: string;
  currentUserID: string;
  // @Output() dispayPromoBanner = new EventEmitter();
  @Output() showPromoBanner = new EventEmitter();
  constructor(
    public homeService: HomeService,
    public auth: AuthService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.getCurrentProject();
    this.getPromoBanner();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id;
        // this.logger.log('[PROJECT-SERV] project ID from AUTH service subscription ', this.projectID)
      }
    });
  }

  getLoggedUser() {
    this.auth.user_bs
      .subscribe((user) => {
        if (user) {
          this.currentUserID = user._id
        }
      });
  }

  getPromoBanner() {
    this.homeService.getPromoBanner().subscribe((res: any) => {
      this.logger.log('[HOME] GET PROMO BANNER res ', res);

      if (res) {
        this.resPromoBanner = res
        this.resPromoBanner['link'] = res.link.replace('$project_id', this.projectId).replace('$app_id', '6319fe155f9ced0018413a06')
        this.logger.log('[HOME-PROMO-BANNER] GET PROMO BANNER resPromoBanner ', this.resPromoBanner)
        // this.dispayPromoBanner.emit()
        this.dispayPromoBanner = true;
        this.promoBannerContent = res['left-title']

        this.logger.log('[HOME-PROMO-BANNER] GET PROMO BANNER promoBannerContent', this.promoBannerContent);
      }

    }, error => {
      this.logger.error('[HOME-PROMO-BANNER] GET PROMO BANNER - ERROR ', error)
      this.showPromoBanner.emit();
      this.dispayPromoBanner = false;

    }, () => {
      this.logger.log('[HOME-PROMO-BANNER] GET PROMO BANNER - COMPLETE')
    });
  }

  goToPromoBannerLink(promobannerlink, target) {
    this.logger.log('[HOME-PROMO-BANNER] GO TO PROMO BANNER LINK - promobannerlink', promobannerlink, ' target ', target)
    window.open(promobannerlink, target);
    if (!isDevMode()) {
    
        if (window['analytics']) {
          this.logger.log('[HOME-PROMO-BANNER] - track Home Banner button clicked')
          try {
            window['analytics'].track('Home Banner button clicked', {
              "userId": this.currentUserID,
            }, {
              "context": {
                "groupId": this.projectId
              }
            });
           
          } catch (err) {
            this.logger.error('[HOME-PROMO-BANNER] - track Home Banner button clicked - err', err);
          }
        }
    }
  }

}
