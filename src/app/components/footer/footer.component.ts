import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
// declare var require: any;
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  test: Date = new Date();
  // public version: string = require( '../../../../package.json').version;
  public version: string = environment.VERSION;

  constructor() { }

  ngOnInit() {
    console.log('version (footer.component)  ', this.version);
  }

}
