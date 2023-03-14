// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'cds-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  // actionHideMessageFormGroup: FormGroup;
  // textInput: string;
  btnDisabled: boolean = true;
  
  constructor(
    // private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // this.initialize();
  }
    
  // private initialize(){
  //   let that = this;
  //   this.textInput = this.data.text;
  //   this.actionHideMessageFormGroup = this.buildForm();
  //   this.actionHideMessageFormGroup.valueChanges.subscribe(form => {
  //     console.log('actionHideMessageFormGroup: ', that.actionHideMessageFormGroup);
  //     if(form && (form.text !== '') && that.actionHideMessageFormGroup.status === 'VALID'){
  //       // console.log('assegno!!', this.actionHideMessageFormGroup);
  //       Object.assign(that.textInput, that.actionHideMessageFormGroup.value);
  //       that.btnDisabled = false;
  //     } else {
  //       that.btnDisabled = true;
  //     }
  //   })
  // }


  // private buildForm(): FormGroup {
  //   //RegExp(/^[a-zA-Z_]*[a-zA-Z_]+[a-zA-Z0-9_]*$/gm)
  //   const regexPattern = "^[a-zA-Z0-9_]*$";
  //   return this.formBuilder.group({
  //     text: ['', [Validators.required, Validators.pattern(new RegExp(regexPattern))]]
  //   })
  // }


  

  onChangeTextInput($event):void {
    console.log('onChangeTextInput', $event);
    const regexPattern = "/^[a-zA-Z0-9_]*$/";
    let REGEX = new RegExp(regexPattern.replace(/\//gi, ''));
    // this.logger.log('[TILEBOT-EDIT-ADD] checkFields nameRGEX REGEX ', REGEX)
    if(REGEX.test(this.data.text) && this.data.text !== ''){
      console.log('ok');
      this.btnDisabled = false;
    } else {
      console.log('error');
      this.btnDisabled = true;
    }
  }

  onAddCustomAttribute(): void {
    // console.log('onAddCustomAttribute');
    // this.dialogRef.close();
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }


}
