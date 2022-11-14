import { Component, OnInit } from '@angular/core';
 
@Component({
  selector: 'appdashboard-sidebar-claims',
  templateUrl: './sidebar-claims.component.html',
  styleUrls: ['./sidebar-claims.component.scss']
})
export class SidebarClaimsComponent implements OnInit {

  claims = [];
  stars = [];
  selected: any;
  timeIntevalSeconds: 5000; 
  id;
  constructor() { }

  ngOnInit(): void {
    // let claim;
    // claim = { stars: 6, message: 'We love what Tiledesk is today. But the best has yet to come',  author:'Andrea Sponziello', role:'Tiledesk CEO'};
    // this.claims.push(claim);
    // claim = { stars: 5, message: 'El mejor chatbot que uso, sencillo de manejar',  author:'Alberto P.', role:'CEO'};
    // this.claims.push(claim);
    // claim = { stars: 5, message: 'Great product, great support, excited to see more businesses using Tiledesk in the future',  author:'Michael R.', role:'CTO'};
    // this.claims.push(claim);
    // claim = { stars: 5, message: 'The best open source live chat, especially with its bot replies',  author:'Peter X.', role:'Co-Founder'};
    // this.claims.push(claim);
    // claim = { stars: 5, message: 'Great system with lots of features',  author:'Richard M.', role:'CTO'};
    // this.claims.push(claim);
    this.claims = [
      { stars: 6, message: 'We love what Tiledesk is today. But the best has yet to come',  author:'Andrea Sponziello', role:'Tiledesk CEO'},
      { stars: 5, message: 'El mejor chatbot que uso, sencillo de manejar',  author:'Alberto P.', role:'CEO'},
      { stars: 5, message: 'Great product, great support, excited to see more businesses using Tiledesk in the future',  author:'Michael R.', role:'CTO'},
      { stars: 5, message: 'The best open source live chat, especially with its bot replies',  author:'Peter X.', role:'Co-Founder'},
      { stars: 5, message: 'Great system with lots of features',  author:'Richard M.', role:'CTO'}
    ];

    this.id = setInterval(() => {
      this.randomClaim(); 
    }, 5000);
    
  }
  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
  }

  /** */
  randomClaim(){
    this.selected = this.claims[Math.floor(Math.random()*this.claims.length)];
    this.stars = Array(this.selected.stars);
  }


}
