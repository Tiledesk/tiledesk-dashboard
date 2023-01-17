import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cds-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {

  addClicked: boolean = false;
  constructor() { }

  ngOnInit(): void {

  }

  addNew(){
    console.log('add Ruless')
    this.addClicked = true;
  }

  ngOnDestroy(){
    this.addClicked = false;
  }

}
