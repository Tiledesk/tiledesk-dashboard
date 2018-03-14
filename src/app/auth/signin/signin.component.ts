import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
// import { User } from '../../models/user-model';

type UserFields = 'email' | 'password';
type FormErrors = {[u in UserFields]: string };


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  public signin_errormsg = '';
  display = 'none';

  userForm: FormGroup;
  // newUser = false; // to toggle login or signup form
  // passReset = false; // set to true when password reset is triggered
  formErrors: FormErrors = {
    'email': '',
    'password': '',
  };
  validationMessages = {
    'email': {
      'required': 'Email is required.',
      'email': 'Email must be a valid email',
    },
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 6 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
    },
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.userForm = this.fb.group({
      'email': ['', [
        Validators.required,
        Validators.email,
      ]],
      'password': ['', [
        // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
      ]],


    });
  }

  signin() {
    // this.auth.emailLogin(
    this.auth.signin(this.userForm.value['email'], this.userForm.value['password'])
      .subscribe((signinResponse) => {
        console.log('POST DATA ', signinResponse);

        // this.auth.user = signinResponse.user;
        // this.auth.user.token = signinResponse.token

        // console.log('SIGNIN TOKEN ', this.auth.user.token)

        if (signinResponse['success'] === true) {
          this.router.navigate(['/home']);

        }
      },
      (error) => {
        if (error) {
          const signin_errorbody = JSON.parse(error._body)
          this.signin_errormsg = signin_errorbody['msg']
          this.display = 'block';
          // console.log('SIGNIN USER - POST REQUEST ERROR ', error);
          // console.log('SIGNIN USER - POST REQUEST BODY ERROR ', signin_errorbody);

          console.log('SIGNIN USER - POST REQUEST MSG ERROR ', this.signin_errormsg);
        }
      },
      () => {
        console.log('SIGNIN USER  - POST REQUEST COMPLETE ');
      });
  }

  dismissAlert() {
    console.log('DISMISS ALWRT CLICKED')
    this.display = 'none';
  }

}
