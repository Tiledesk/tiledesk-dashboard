import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-news-feed-modal',
  templateUrl: './home-news-feed-modal.component.html',
  styleUrls: ['./home-news-feed-modal.component.scss']
})
export class HomeNewsFeedModalComponent implements OnInit {

  video_url:  SafeResourceUrl = null
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeNewsFeedModalComponent>,
    public dialog: MatDialog,
    private logger: LoggerService,
    private sanitizer: DomSanitizer
  ) { 
    this.logger.log('[NEWS FEED MODAL] data ', data)
    this.video_url = this.sanitizer.bypassSecurityTrustResourceUrl(data.videoURL)
  }

  ngOnInit(): void {
  }

}
