import { AbstractControl } from '@angular/forms';

export class PasswordValidation {

    static MatchPassword(AC: AbstractControl) {
        const password = AC.get('password').value; // to get value in input tag
        const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
        if (password !== confirmPassword) {
            // console.log('PSW MACTH CONFIRM-PSW: false');
            AC.get('confirmPassword').setErrors({ MatchPassword: true })
        } else {
            // console.log('PSW MACTH CONFIRM-PSW: true');
            // return null
        }
    }
}
