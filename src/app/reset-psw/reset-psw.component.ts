import { Component, OnInit } from '@angular/core';
import {ReactiveFormsModule,  FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

type EmailField = 'email';
type EmailFormErrors = { [u in EmailField]: string };

type PswFields = 'password';
type PswFormErrors = { [u in PswFields]: string };

@Component({
  selector: 'appdashboard-reset-psw',
  templateUrl: './reset-psw.component.html',
  styleUrls: ['./reset-psw.component.scss']
})
export class ResetPswComponent implements OnInit {
  
  emailForm: FormGroup;

  pswForm: FormGroup;

  emailformErrors: EmailFormErrors = {
    'email': '',
  };
  emailvalidationMessages = {
    'email': {
      'required': 'Email is required.',
      'email': 'Email must be a valid email',
    }
  };

  pswformErrors: PswFormErrors = {
    'password': '',
  };
  paswvalidationMessages = {
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 6 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
    },
  };


  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.buildEmailForm();
    this.buildPswForm();
  }

  buildEmailForm() {
    this.emailForm = this.fb.group({
      'email': ['', [
        Validators.required,
        Validators.email,
      ]]
    });

    this.emailForm.valueChanges.subscribe((data) => this.onEmailValueChanged(data));
    this.onEmailValueChanged(); // reset validation messages
  }

  buildPswForm() {
    this.pswForm = this.fb.group({
      'password': ['', [
        // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
      ]],
    });

    this.pswForm.valueChanges.subscribe((data) => this.onPswValueChanged(data));
    this.onPswValueChanged(); // reset validation messages
  }

    // Updates validation state on form changes.
    onEmailValueChanged(data?: any) {
      if (!this.emailForm) { return; }
      const form = this.emailForm;
      for (const field in this.emailformErrors) {
        // tslint:disable-next-line:max-line-length
        if (Object.prototype.hasOwnProperty.call(this.emailformErrors, field) && (field === 'email')) {
          // clear previous error message (if any)
          this.emailformErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.emailvalidationMessages[field];
            if (control.errors) {
              for (const key in control.errors) {
                if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                  this.emailformErrors[field] += `${(messages as { [key: string]: string })[key]} `;
                }
              }
            }
          }
        }
      }
    }

    onPswValueChanged(data?: any) {
      if (!this.pswForm) { return; }
      const form = this.pswForm;
      for (const field in this.pswformErrors) {
        // tslint:disable-next-line:max-line-length
        if (Object.prototype.hasOwnProperty.call(this.pswformErrors, field) && (field === 'password')) {
          // clear previous error message (if any)
          this.pswformErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.paswvalidationMessages[field];
            if (control.errors) {
              for (const key in control.errors) {
                if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                  this.pswformErrors[field] += `${(messages as { [key: string]: string })[key]} `;
                }
              }
            }
          }
        }
      }
    }

}
