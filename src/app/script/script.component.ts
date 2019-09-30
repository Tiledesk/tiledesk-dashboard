import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.scss']
})
export class ScriptComponent implements OnInit {

  constructor(
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
  }

}
