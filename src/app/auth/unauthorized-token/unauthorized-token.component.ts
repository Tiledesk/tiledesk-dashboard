import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'appdashboard-unauthorized-token',
  templateUrl: './unauthorized-token.component.html',
  styleUrls: ['./unauthorized-token.component.scss']
})
export class UnauthorizedTokenComponent implements OnInit {

  constructor(
    public auth: AuthService,
    private router: Router
  ) { 
    
  }

  ngOnInit(): void {
  }


  goToLoginPage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.auth.signOut('unauthorized-token');
    } else { 
      this.router.navigate(['/login'])
    }
  }

}
