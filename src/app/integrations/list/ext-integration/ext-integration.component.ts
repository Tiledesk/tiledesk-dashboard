import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'ext-integration',
  templateUrl: './ext-integration.component.html',
  styleUrls: ['./ext-integration.component.scss']
})
export class ExtIntegrationComponent implements OnInit {

  @Input() id_project: string;
  @Input() renderUrl: string;

  URL: any;
  TOKEN: string;
  showSpinner: Boolean = true;

  constructor(
    private sanitizer: DomSanitizer,
    private auth: AuthService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    console.log("Starting External App Integration");


  }

  ngOnChanges(): void {
    
    this.showSpinner = true;
    console.log("id_project: ", this.id_project);
    console.log("renderUlr: ", this.renderUrl);

      this.auth.user_bs.subscribe((user) => {
        if (user) {
          this.TOKEN = user.token

          this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(this.renderUrl + "?project_id=" + this.id_project + "&token=" + this.TOKEN);
          console.log("URL: ", this.URL);

          //this.getIframeHasLoaded();


        } else {
          console.log("Get user token failed")
        }
      });
  }

  onIframeLoaded() {
    console.log("onIframeLoaded")
    this.showSpinner = false;
  }

  // getIframeHasLoaded() {
  //   // console.log("[APP-STORE-INSTALL] -  getIframeHasLoaded ")
  //   var self = this;
  //   var iframe = document.getElementById('i_frame') as HTMLIFrameElement;
  //   this.logger.log('[APP-STORE-INSTALL] GET iframe ', iframe)
  //   if (iframe) {
  //     iframe.addEventListener("load", function () {
  //       self.logger.log("[APP-STORE-INSTALL] GET - Finish");
  //       self.showSpinner = false;
  //       iframe.style.display = 'block';
  //     });
  //   }
  // }

}
