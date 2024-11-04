import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';

@Component({
  selector: 'password-strength',
  templateUrl: './password-strength.component.html',
  styleUrls: ['./password-strength.component.scss']
})
export class PasswordStrengthComponent implements OnInit {
  //https://stackblitz.com/edit/angular-ivy-bnupgd?file=src%2Fapp%2Fstrength-bar%2Fstrength-bar.component.ts,src%2Fapp%2Fstrength-bar%2Fstrength-bar.component.html,src%2Fapp%2Fstrength-bar%2Fstrength-checker.component.ts,src%2Fapp%2Fapp.component.css
  constructor() { }

  ngOnInit(): void {
  }

  @Input() public passwordToCheck: string;
  @Output() passwordStrength = new EventEmitter<boolean>();
  bar0: string;
  bar1: string;
  bar2: string;
  bar3: string;

  msg = '';
  messageColor: string;

  regexSymbols  = /[$-/:-?{-~!"^@#`\[\]]/


  private colors = ['darkred', 'orangered', 'orange', 'yellowgreen'];

  private static checkStrength(p) {
    // console.log('checkStrength p ', p)
    let force = 0;
    const regex = /[$-/:-?{-~!"^@#`\[\]]/g;
    // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
    // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
    // const regex = /^[!@#$%^&*]+$/;

    const lowerLetters = /[a-z]+/.test(p);
    const upperLetters = /[A-Z]+/.test(p);
    const numbers = /[0-9]+/.test(p);
    const symbols = regex.test(p);


    const flags = [lowerLetters, upperLetters, numbers, symbols];
    const flagNames = ['Lower Letters', 'Upper Letters', 'Numbers', 'Symbols'];

    let passedMatches = 0;
    for (const flag of flags) {
      // console.log('flag ', flag)
      // console.log('flags ', flags)

      passedMatches += flag === true ? 1 : 0;

    }

    // flags.forEach((flag, index) => {
    //   if (flag) {
    //     console.log(`${flagNames[index]} is enabled.`);
    //   } else {
    //     console.log(`${flagNames[index]} is disabled.`);
    //   }
    // });



    force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
    force += passedMatches * 10;

    // short password
    force = (p.length <= 7) ? Math.min(force, 10) : force;

    // poor variety of characters
    force = (passedMatches === 1) ? Math.min(force, 10) : force;
    force = (passedMatches === 2) ? Math.min(force, 20) : force;
    force = (passedMatches === 3) ? Math.min(force, 30) : force;
    force = (passedMatches === 4) ? Math.min(force, 40) : force;

    // console.log('passedMatches 1 Uppercase' ,passedMatches === 1) 
    // console.log('passedMatches 2' ,passedMatches === 2) 
    // console.log('passedMatches 3' ,passedMatches === 3) 
    // console.log('passedMatches 4' ,passedMatches === 4) 

    return force;
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    const password = changes.passwordToCheck.currentValue;

    this.setBarColors(4, '#DDD');
    if (password) {
      const c = this.getColor(PasswordStrengthComponent.checkStrength(password));

      this.setBarColors(c.idx, c.col);

      const pwdStrength = PasswordStrengthComponent.checkStrength(password);
      pwdStrength === 40 ? this.passwordStrength.emit(true) : this.passwordStrength.emit(false);

      switch (c.idx) {
        case 1:
          this.msg = 'Very weak';
          break;
        case 2:
          this.msg = 'Weak';
          break;
        case 3:
          this.msg = 'Medium';
          break;
        case 4:
          this.msg = 'Strong';
          break;
      }
    } else {
      this.msg = '';
    }
  }


  private getColor(s) {
    let idx = 0;
    if (s <= 10) {
      idx = 0;
    } else if (s <= 20) {
      idx = 1;
    } else if (s <= 30) {
      idx = 2;
    } else if (s <= 40) {
      idx = 3;
    } else {
      idx = 4;
    }
    return {
      idx: idx + 1,
      col: this.colors[idx]
    };
  }

  private setBarColors(count, col) {
    for (let n = 0; n < count; n++) {
      this['bar' + n] = col;
      this.messageColor = col
    }
  }

}
