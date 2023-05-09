import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-sidebar-claims',
  templateUrl: './sidebar-claims.component.html',
  styleUrls: ['./sidebar-claims.component.scss']
})
export class SidebarClaimsComponent implements OnInit {

  claims = [];
  stars = [];
  claimVisible: number;
  id;
  timeIntevalSeconds: 10000; 
  langDashboard = 'en';
 


  constructor(
    private httpClient: HttpClient,
    public translate: TranslateService
  ) { 
    // is empty
  }

  ngOnInit(): void {
    this.langDashboard = this.translate.getBrowserLang();
    // if(this.translate.currentLang){
    //   this.langDashboard = this.translate.currentLang;
    // }  
    this.claims = [
      { stars: 5, message: 'El mejor chatbot que uso, sencillo de manejar',  author:'Alberto P.', role:'CEO'},
      { stars: 6, message: 'We love what Tiledesk is today. But the best has yet to come',  author:'Andrea Sponziello', role:'Tiledesk CEO'},
      { stars: 5, message: 'Great product, great support, excited to see more businesses using Tiledesk in the future',  author:'Michael R.', role:'CTO'},
      { stars: 5, message: 'The best open source live chat, especially with its bot replies',  author:'Peter X.', role:'Co-Founder'},
      { stars: 5, message: 'Great system with lots of features',  author:'Richard M.', role:'CTO'}
    ];
    this.loadJsonClaim();
  }

  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
  }

  private loadJsonClaim(){
    let onboardingConfig = 'assets/config/onboarding-claims.json';
    // let jsonSteps: any;
    this.httpClient.get(onboardingConfig).subscribe(data => {
      let jsonString = JSON.stringify(data);
      let jsonParse = JSON.parse(jsonString);
      if (jsonParse) {
        this.claims = [];
        //jsonSteps = jsonParse['claims'];
        jsonParse.forEach(claim => {
          this.claims.push(claim);
        });
        this.setClaims();
      }
    });
  }

  setArrayClaims(){
    try {
      const langClaims = this.claims.filter((item) => item.lang === this.langDashboard.toUpperCase());
      const otherClaims = this.claims.filter((item) => item.lang !== this.langDashboard.toUpperCase());
      otherClaims.sort(() => Math.random() - 0.5);
      langClaims.sort(() => Math.random() - 0.5);
      this.claims = langClaims.concat(otherClaims);
      let index = 0;
      this.claimVisible = index;
      this.stars = Array(this.claims[index].stars);
    } catch (error) {
      // error
    }
    // console.log('setClaims::: ',  this.langDashboard, this.claims);
  }

  setClaims(){
    this.setArrayClaims();
    let index = 1;
    this.id = setInterval(() => {
      if(index < this.claims.length) {
        this.claimVisible = index;
        this.stars = Array(this.claims[index].stars);
        index++;
      } else {
        index = 1;
        this.setArrayClaims();
      }
      //this.randomClaim(this.claims); 
    }, 10000);
  }

  /** */
  // randomClaim(claims){
  //   console.log('randomClaim::: ');
  //   let arrayIndex = Array.from(Array(claims.length).keys());
  //   //console.log('this.arrayIndex::: ', arrayIndex);
  //   arrayIndex = arrayIndex.filter((item) => item != this.claimVisible);
  //   // console.log('-----> arrayIndex - this.claimActive :::: ', arrayIndex);
  //   // this.claimVisible = Math.floor(Math.random()*(arrayIndex.length+1));
  //   // this.claimHidden = this.claimVisible;
  //   this.claimVisible = arrayIndex[Math.floor(Math.random()*arrayIndex.length)];
  //   // console.log('this.claimVisible::: ', this.claimVisible);
  //   // console.log('this.claimHidden::: ', this.claimHidden);
  //   this.stars = Array(claims[this.claimVisible].stars);
  // }


}
