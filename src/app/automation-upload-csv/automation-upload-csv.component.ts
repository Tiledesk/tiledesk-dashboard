import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AutomationsService } from 'app/services/automations.service';
import { LoggerService } from 'app/services/logger/logger.service';
@Component({
  selector: 'appdashboard-automation-upload-csv',
  templateUrl: './automation-upload-csv.component.html',
  styleUrls: ['./automation-upload-csv.component.scss']
})
export class AutomationUploadCsvComponent implements OnInit {
  csvOutput: any;
  selected_template_name: string;
  displayAfterUploadFromCSVSection: boolean = false;
  parse_err: boolean;
  csvColumnsDelimiter = ';'
  parsedData: any;
  file: File

  constructor(
     @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<AutomationUploadCsvComponent>,
      private logger: LoggerService,
      private automationsService:  AutomationsService
  ) { 
    console.log('[AUTOMATION-UPLOAD-CSV] data', data)
    this.csvOutput = data.csvOutput
    this.selected_template_name = data.selected_template_name + '.csv'
  }

  ngOnInit(): void {
  }

  downlaodCSV() {
    this.downloadFile( this.csvOutput, this.selected_template_name);

  }

  downloadFile(data, filename) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    // this.logger.log('[FAQ-COMP] isSafariBrowser ', isSafariBrowser)
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');

      /**
       * *** FOR SAFARI TO UNCOMMENT AND TEST ***
       */
      // https://stackoverflow.com/questions/29799696/saving-csv-file-using-blob-in-safari/46641236
      // const link = document.createElement('a');
      // link.id = 'csvDwnLink';

      // document.body.appendChild(link);
      // window.URL = window.URL;
      // const csv = '\ufeff' + data,
      //   csvData = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csv),
      //   filename = 'filename.csv';
      // $('#csvDwnLink').attr({ 'download': filename, 'href': csvData });
      // $('#csvDwnLink')[0].click();
      // document.body.removeChild(link);
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename);
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  // fileChangeUploadCSV(event) {
  //   this.logger.log('[AUTOMATION-UPLOAD-CSV] UPLOAD CSV DATA - parse_err', this.parse_err);
  //   this.displayAfterUploadFromCSVSection = true;
  //   console.log('[AUTOMATION-UPLOAD-CSV] CSV COLUMNS DELIMITER ', this.csvColumnsDelimiter)
  //   const fileList: FileList = event.target.files;
  //   if (fileList.length > 0) {
  //     const file: File = fileList[0];
  //     const formData: FormData = new FormData();
  //     formData.set('delimiter', this.csvColumnsDelimiter);
  //     formData.append('uploadFile', file, file.name);
  //     console.log('[AUTOMATION-UPLOAD-CSV] FORM DATA ', formData)
  //     this.parse_err = false;
  //     this.automationsService.uploadFaqCsv(formData)

  //       .subscribe(data => {
  //         console.log('[FAQ-COMP] UPLOAD CSV DATA ', data);
  //         if (data) {
  //           // this.parse_done = true;
  //         }
        
  //       }, (error) => {
  //         this.logger.error('[FAQ-COMP] UPLOAD CSV - ERROR ', error);
          
  //         // this.parse_done = false;

  //         this.parse_err = true;
  //       }, () => {
  //         this.logger.log('[FAQ-COMP] UPLOAD CSV * COMPLETE *');
  //         this.parse_err = false;
  //       });
  //    }
  // }
  fileChangeUploadCSV(event) {
  this.displayAfterUploadFromCSVSection = true;
  const fileList: FileList = event.target.files;

  if (fileList.length > 0) {
    const file: File = fileList[0];
    this.file = fileList[0];

    const reader = new FileReader();
    reader.onload = () => {
      const csvText = reader.result as string;
      this.parsedData = this.parseCSV(csvText);
      console.log('[AUTOMATION-UPLOAD-CSV] parsedData ', this.parsedData)
      this.parse_err = false;
      // 👇 Send the file + parsed data back to the parent
      // this.dialogRef.close({ file, parsedData });
    };

    reader.readAsText(file);
  }
}

parseCSV(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length === 0) return [];

  const headers = lines[0].split(';').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(';').map(v => v.trim());
    const rowObj: any = {};
    headers.forEach((header, i) => {
      rowObj[header] = values[i] || '';
    });
    return rowObj;
  });

  return rows;
}


  onDone() {
     this.dialogRef.close({ file: this.file, parsedData: this.parsedData });
  }

    
  onCloseBaseModal() {
    this.dialogRef.close();
  }

}
