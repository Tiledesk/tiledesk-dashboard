import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'cds-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  actionHideMessageFormGroup: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initialize();
  }
    
  private initialize(){
    this.actionHideMessageFormGroup = this.buildForm();
    this.actionHideMessageFormGroup.valueChanges.subscribe(form => {
      if(form && (form.text !== '')){
        this.data.name = Object.assign(this.data.name, this.actionHideMessageFormGroup.value);
      }
    })
  }


  
  private buildForm(): FormGroup{
    return this.formBuilder.group({
      text: ['', Validators.required]
    })
  }

  onAddCustomAttribute(): void {
    // console.log('onAddCustomAttribute');
    // this.dialogRef.close();
  }

  //RegExp(/^[a-zA-Z_]*[a-zA-Z_]+[a-zA-Z0-9_]*$/gm)

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onChange(){
    // verifico regex
  }


}
