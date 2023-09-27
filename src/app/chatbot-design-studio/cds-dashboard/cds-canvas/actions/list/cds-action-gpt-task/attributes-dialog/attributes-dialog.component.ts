import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-attributes-dialog',
  templateUrl: './attributes-dialog.component.html',
  styleUrls: ['./attributes-dialog.component.scss']
})
export class AttributesDialogComponent implements OnInit {

  btn_disabled: boolean = false;

  constructor(
    private logger: LoggerService,
    public dialogRef: MatDialogRef<AttributesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.logger.debug("[AttributesDialog] data: ", this.data);
    if (this.data.attributes.find(a => a.value === null || a.value === '')){
      this.btn_disabled = true;
    }
  }

  onCloseDialog(): void {
    this.logger.log("[AttributesDialog] - modal CLOSED");
    this.dialogRef.close();
  }

  onChangeInput() {
    this.btn_disabled = false;
    if (this.data.attributes.find(a => a.value === null || a.value === '')){
      this.btn_disabled = true;
    }
  }

  onGenerateClick() {
    this.data.attributes.forEach((attr) => {
      let old_value = "{{" + attr.name + "}}";
      this.data.question = this.data.question.replace(old_value, attr.value);
    })

    this.logger.log("[AttributesDialog] - onGenerateClick return data: ", this.data);
    this.dialogRef.close(this.data);
  }


  // createConditionGroup(): FormGroup {
  //   return this.formBuilder.group({
  //     attributes: this.formBuilder.array([
  //       this.createAttributesGroup()
  //     ])  
  //   })
  // }

  // createAttributesGroup(): FormGroup {
  //   return this.formBuilder.group({
  //     name: ['', Validators.required],
  //     value: ['', Validators.required]
  //   })
  // }

  // setFormValue() {
  //   let attributesControl = <FormArray>this.varsForm.controls.attributes;
  //   this.data.attributes.forEach((v) => {
  //     attributesControl.push(v)
  //     // this.varsForm.patchValue({ attributes: this.data.attributes });
  //   })
  //   console.log("varsForm: ", this.varsForm);
  // }

}
