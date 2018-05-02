import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-requests-msgs',
  templateUrl: './requests-msgs.component.html',
  styleUrls: ['./requests-msgs.component.scss']
})
export class RequestsMsgsComponent implements OnInit {

  id_request: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {

    this.getRequestId();
  }

  getRequestId() {
    this.id_request = this.route.snapshot.params['requestid'];
    console.log('REQUESTS-LIST COMP HAS PASSED REQUEST-ID ', this.id_request);
  }

  cut_support_group_from_request_id(request_id: string) {
    if (request_id) {
      return request_id.replace('support-group-', '');
    }
  }
}
