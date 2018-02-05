import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';
@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  firebaseProjectId: any;
  constructor(public auth: AuthService) { }

  ngOnInit() {
    console.log('Hello HomeComponent! ');
    console.log(environment.firebaseConfig.projectId);
    this.firebaseProjectId = environment.firebaseConfig.projectId;
  }

}
