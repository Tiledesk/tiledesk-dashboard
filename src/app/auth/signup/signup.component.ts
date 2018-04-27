import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';

type UserFields = 'email' | 'password' | 'firstName' | 'lastName';
type FormErrors = {[u in UserFields]: string };

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  showSpinnerInLoginBtn = false;
  public signin_errormsg = '';
  display = 'none';

  userForm: FormGroup;
  // newUser = false; // to toggle login or signup form
  // passReset = false; // set to true when password reset is triggered
  formErrors: FormErrors = {
    'email': '',
    'password': '',
    'firstName': '',
    'lastName': '',
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
    'firstName': {
      'required': 'First Name is required.',
    },
    'lastName': {
      'required': 'Last Name is required.',
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

  signup() {
    this.showSpinnerInLoginBtn = true;

    this.auth.signup(
      this.userForm.value['email'],
      this.userForm.value['password'],
      this.userForm.value['firstName'],
      this.userForm.value['lastName'])
      .subscribe((signupResponse) => {
        console.log('SIGNUP Email ', this.userForm.value['email']);
        console.log('SIGNUP Password ', this.userForm.value['password']);
        console.log('SIGNUP Firstname ', this.userForm.value['firstName']);
        console.log('SIGNUP Lastname ', this.userForm.value['lastName']);
        console.log('POST DATA ', signupResponse);
        if (signupResponse['success'] === true) {
          // this.router.navigate(['/welcome']);

          this.autoSignin();

        } else {
          console.log('SIGNUP ERROR MSG', signupResponse['msg']);

          this.signin_errormsg = signupResponse['msg'];
          this.display = 'block';

          this.showSpinnerInLoginBtn = false;
        }
      },
        (error) => {
          console.log('CREATE NEW USER - POST REQUEST ERROR ', error);

          this.showSpinnerInLoginBtn = false;
        },
        () => {
          console.log('CREATE NEW USER  - POST REQUEST COMPLETE ');
        });
  }


  autoSignin() {

    // this.auth.emailLogin(
    const self = this;
    // this.auth.signin(this.userForm.value['email'], this.userForm.value['password'])
    //   .subscribe((error) => {
    this.auth.signin(this.userForm.value['email'], this.userForm.value['password'], function (error) {
      console.log('1. POST DATA ', error);
      // this.auth.user = signinResponse.user;
      // this.auth.user.token = signinResponse.token
      // console.log('SIGNIN TOKEN ', this.auth.user.token)
      // tslint:disable-next-line:no-debugger
      // debugger
      if (!error) {

        self.router.navigate(['/projects']);

      } else {
        self.showSpinnerInLoginBtn = false;

        const signin_errorbody = JSON.parse(error._body)
        self.signin_errormsg = signin_errorbody['msg']
        self.display = 'block';
        // console.log('SIGNIN USER - POST REQUEST ERROR ', error);
        // console.log('SIGNIN USER - POST REQUEST BODY ERROR ', signin_errorbody);
        console.log('SIGNIN USER - POST REQUEST MSG ERROR ', self.signin_errormsg);
      }
      // tslint:disable-next-line:no-debugger
      // debugger
    });


  }

  // autoSignin() {

  //   const self = this;
  //   this.auth.signin(this.userForm.value['email'], this.userForm.value['password'])
  //     .subscribe((signinResponse) => {
  //       console.log('1. POST DATA ', signinResponse);
  //       // this.auth.user = signinResponse.user;
  //       // this.auth.user.token = signinResponse.token
  //       // console.log('SIGNIN TOKEN ', this.auth.user.token)

  //       if (signinResponse['success'] === true) {

  //         self.auth.firebaseSignin(self.userForm.value['email'], self.userForm.value['password']).subscribe(token => {

  //           console.log('2. FIREBASE SIGNIN RESPO ', token)
  //           if (token) {

  //             // Firebase Sign in using custom token
  //             firebase.auth().signInWithCustomToken(token)
  //               .then(data => {
  //                 console.log('3. FIREBASE CUSTOM AUTH DATA ', data)

  //                 // this.router.navigate(['/home']);
  //                 this.router.navigate(['/projects']);

  //               })
  //               .catch(function (error) {
  //                 // Handle Errors here.
  //                 const errorCode = error.code;
  //                 console.log('FIREBASE CUSTOM AUTH ERROR CODE ', errorCode)
  //                 const errorMessage = error.message;
  //                 console.log('FIREBASE CUSTOM AUTH ERROR MSG ', errorMessage)
  //               });
  //           }

  //         },
  //           (error) => {
  //             if (error) {
  //               this.showSpinnerInLoginBtn = false;

  //               const signin_errorbody = JSON.parse(error._body)
  //               this.signin_errormsg = signin_errorbody['msg']
  //               this.display = 'block';
  //               // console.log('SIGNIN USER - POST REQUEST ERROR ', error);
  //               // console.log('SIGNIN USER - POST REQUEST BODY ERROR ', signin_errorbody);
  //               console.log('SIGNIN USER - POST REQUEST MSG ERROR ', this.signin_errormsg);
  //             }
  //           });
  //       }
  //     },
  //       (error) => {
  //         if (error) {
  //           this.showSpinnerInLoginBtn = false;

  //           const signin_errorbody = JSON.parse(error._body)
  //           this.signin_errormsg = signin_errorbody['msg']
  //           this.display = 'block';
  //           // console.log('SIGNIN USER - POST REQUEST ERROR ', error);
  //           // console.log('SIGNIN USER - POST REQUEST BODY ERROR ', signin_errorbody);

  //           console.log('SIGNIN USER - POST REQUEST MSG ERROR ', this.signin_errormsg);
  //         }
  //       },
  //       () => {
  //         console.log('SIGNIN USER  - POST REQUEST COMPLETE ');
  //       });
  // }




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
      'displayName': ['', []
      ],
      'firstName': ['', [
        Validators.required,
      ]],
      'lastName': ['',
        [
          Validators.required,
        ]],
    });
    this.userForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.userForm) { return; }
    const form = this.userForm;
    for (const field in this.formErrors) {
      // tslint:disable-next-line:max-line-length
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'password' || field === 'firstName' || field === 'lastName')) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          if (control.errors) {
            for (const key in control.errors) {
              if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                this.formErrors[field] += `${(messages as { [key: string]: string })[key]} `;
              }
            }
          }
        }
      }
    }
  }

  dismissAlert() {
    console.log('DISMISS ALERT CLICKED')
    this.display = 'none';
  }

  goToTileDeskDotCom() {
    const url = 'http://tiledesk.com/'
    window.open(url);
    // , '_blank'
  }

}
