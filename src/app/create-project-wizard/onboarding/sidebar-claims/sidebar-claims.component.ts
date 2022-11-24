import { Component, OnInit } from '@angular/core';
 
@Component({
  selector: 'appdashboard-sidebar-claims',
  templateUrl: './sidebar-claims.component.html',
  styleUrls: ['./sidebar-claims.component.scss']
})
export class SidebarClaimsComponent implements OnInit {

  claims = [];
  stars = [];
  claimVisible: number;
  // claimHidden: number;
  id;
  timeIntevalSeconds: 10000; 
 


  constructor() { 
    // is empty
  }

  ngOnInit(): void {
    this.claims = [
      { stars: 5, message: 'El mejor chatbot que uso, sencillo de manejar',  author:'Alberto P.', role:'CEO'},
      { stars: 6, message: 'We love what Tiledesk is today. But the best has yet to come',  author:'Andrea Sponziello', role:'Tiledesk CEO'},
      { stars: 5, message: 'Great product, great support, excited to see more businesses using Tiledesk in the future',  author:'Michael R.', role:'CTO'},
      { stars: 5, message: 'The best open source live chat, especially with its bot replies',  author:'Peter X.', role:'Co-Founder'},
      { stars: 5, message: 'Great system with lots of features',  author:'Richard M.', role:'CTO'}
    ];
    this.claimVisible = 0;
    this.stars = Array(this.claims[this.claimVisible].stars);
    if(this.claims.length > 1 ){
      this.id = setInterval(() => {
        this.randomClaim(); 
      }, 10000);
    }
   
    
  }
  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
  }

  /** */
  randomClaim(){
    let arrayIndex = Array.from(Array(this.claims.length).keys());
    //console.log('this.arrayIndex::: ', arrayIndex);
    arrayIndex = arrayIndex.filter((item) => item != this.claimVisible);
    // console.log('-----> arrayIndex - this.claimActive :::: ', arrayIndex);
    // this.claimVisible = Math.floor(Math.random()*(arrayIndex.length+1));
    // this.claimHidden = this.claimVisible;
    this.claimVisible = arrayIndex[Math.floor(Math.random()*arrayIndex.length)];
    // console.log('this.claimVisible::: ', this.claimVisible);
    // console.log('this.claimHidden::: ', this.claimHidden);
    this.stars = Array(this.claims[this.claimVisible].stars);
  }


}
