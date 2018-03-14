import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

type UserFields = 'email' | 'password' | 'firstName' | 'lastName';
type FormErrors = {[u in UserFields]: string };

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

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
          this.router.navigate(['/welcome']);
        } else {
          console.log('SIGNUP ERROR MSG', signupResponse['msg'])
        }
      },
      (error) => {
        console.log('CREATE NEW USER - POST REQUEST ERROR ', error);
      },
      () => {
        console.log('CREATE NEW USER  - POST REQUEST COMPLETE ');
      });
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

}
