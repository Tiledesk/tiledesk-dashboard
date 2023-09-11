import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'cds-addkb-dialog',
  templateUrl: './addkb-dialog.component.html',
  styleUrls: ['./addkb-dialog.component.scss']
})
export class AddkbDialogComponent implements OnInit {

  disableSubmit: boolean = true;
  kbForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddkbDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    console.log("Add Knowledge base dialog - OPENED");
    this.kbForm = this.createConditionGroup();
  }

  onChangeInput(event, target):void {
    // console.log("----> event: ", event);

    // if (target === 'url') {
    //   const regexPattern = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    //   let REGEX = new RegExp(regexPattern.replace(/\//gi, ''));
    //   if (REGEX.test(event) && event !== '' && this.data.name !== ''){
    //     this.btnDisabled = false;
    //   } else {
    //     this.btnDisabled = true;
    //   }
    // }
    if (this.kbForm.valid) {
      this.disableSubmit = false;
    } else {
      this.disableSubmit = true;
    }
  }
  
  createConditionGroup(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      url:  ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
    })
  }

  onSubmitKb() {
    console.log("onSubmitKb: ", this.kbForm)
    if (this.kbForm.valid) {
      console.log("abilita il bottone")
      this.disableSubmit = false;
    } else {
      console.log("disabilita il bottone")
      this.disableSubmit = true;
    }
  }

  onCloseDialog(): void {
    // ADD CONTROLS!!!!
    // NOT NECESSARY???
    console.log("Add Knowledge base dialog - CLOSED");
    this.dialogRef.close();
  }

}
