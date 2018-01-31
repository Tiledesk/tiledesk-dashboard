import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Request } from '../models/request-model';
// import { error } from 'util';
import { Observable } from 'rxjs/Observable';



@Component({
  selector: 'requests-list',
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
})
export class RequestsListComponent implements OnInit {

  requestList: Request[];
  showSpinner = true;

  constructor(
    private requestsService: RequestsService,
  ) { }

  ngOnInit() {

    this.getRequestList();
  }

  getRequestList() {
    // SUBSCIPTION TO snapshotChanges
    this.requestsService.getSnapshot().subscribe((data) => {
      this.requestList = data;
      console.log('REQUESTS-LIST.COMP: SUBSCRIPTION TO getSnapshot ', data);
      this.showSpinner = false;
    },
      (err) => {

        console.log('GET REQUEST LIST ERROR ', err);

      },
      () => {
        console.log('GET REQUEST LIST * COMPLETE *');
        // this.showSpinner = false;
      });

  }
}
