import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
// import {CdkTextareaAutosize} from '@angular/cdk/text-field';
// import {take} from 'rxjs/operators';

@Component({
  selector: 'appdashboard-text-response',
  templateUrl: './text-response.component.html',
  styleUrls: ['./text-response.component.scss']
})
export class TextResponseComponent implements OnInit {

  constructor(private _ngZone: NgZone) { }
  // @ViewChild('autosize') autosize: CdkTextareaAutosize;

  ngOnInit(): void {
    // https://material.angular.io/cdk/text-field/examples
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    // this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

}
