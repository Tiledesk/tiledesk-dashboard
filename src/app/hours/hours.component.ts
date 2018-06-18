import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
@Component({
  selector: 'appdashboard-hours',
  templateUrl: './hours.component.html',
  styleUrls: ['./hours.component.scss']
})
export class HoursComponent implements OnInit {

  constructor(
    private auth: AuthService,
  ) { }

  ngOnInit() {
    this.auth.checkRole();

    
  }

}
