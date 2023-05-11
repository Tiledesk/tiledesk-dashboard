import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'appdashboard-contact-custom-properties',
  templateUrl: './contact-custom-properties.component.html',
  styleUrls: ['./contact-custom-properties.component.scss']
})
export class ContactCustomPropertiesComponent implements OnInit {
  leadPropertyLabel: string;
  leadPropertyName: string;
  propertyNameIsValid: boolean
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ContactCustomPropertiesComponent>,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  onChangeleadPropertyLabel(event) {
    console.log('onChangeleadPropertyLabel', event)
    const propertyLabelSanitazed = event.replace(/[^a-zA-Z0-9 ]/g, '')
    console.log('propertyLabelSanitazed', propertyLabelSanitazed)
    const tempLeadPropertyName = propertyLabelSanitazed.replaceAll(' ', '_');
    this.leadPropertyName = tempLeadPropertyName.toLowerCase()
  }

  onChangeleadPropertyName(event) {
    console.log('onChangeleadPropertyName', event)
    this.propertyNameIsValid = this.isValid(event)
    console.log('onChangeleadPropertyName propertyNameIsValid isValid', this.propertyNameIsValid )
  }

  isValid(str) {

    if (str.match(/[^a-zA-Z0-9_-]/)) {
      
      return false
    } else {
      return true
    }
  }

  createContactProperty() {
    const lead_property = { label: this.leadPropertyLabel, internal_name: this.leadPropertyName }
    this.dialogRef.close(lead_property)
  }

}
