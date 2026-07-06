import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WsMsgsService } from 'app/services/websocket/ws-msgs.service';
import { avatarPlaceholder, getColorBck } from 'app/utils/util';

@Component({
  selector: 'appdashboard-contact-request-messages-dialog',
  templateUrl: './contact-request-messages-dialog.component.html',
  styleUrls: ['./contact-request-messages-dialog.component.scss']
})
export class ContactRequestMessagesDialogComponent implements OnInit {
  request: any;
  requester_id: string;
  fillColour: string;
  requester_fullname_initial: string;
  requestFirstText: string;
  msgsArray: any[] = [];
  loading = true;
  error = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ContactRequestMessagesDialogComponent>,
    private wsMsgsService: WsMsgsService,
  ) {
    this.request = data?.request;
    this.requester_id = data?.requester_id;
    this.fillColour = data?.fillColour;
    this.requester_fullname_initial = data?.requester_fullname_initial;
    this.requestFirstText = data?.requestFirstText || '';
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    if (!this.request?.request_id) {
      this.loading = false;
      this.msgsArray = [];
      return;
    }
    this.loading = true;
    this.error = false;
    this.wsMsgsService.geRequestMsgs(this.request.request_id).subscribe(
      (msgs: any) => {
        this.loading = false;
        if (!msgs) {
          this.msgsArray = [];
          return;
        }
        const msgsArray = Array.isArray(msgs) ? [...msgs] : [];
        this.msgsArray = msgsArray.sort((a, b) => {
          if (a?.createdAt < b?.createdAt) {
            return -1;
          }
          if (a?.createdAt > b?.createdAt) {
            return 1;
          }
          return 0;
        });
      },
      () => {
        this.loading = false;
        this.error = true;
      }
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  isRequesterMessage(message: any): boolean {
    return this.requester_id === message?.sender;
  }

  isTextOrFileMessage(message: any): boolean {
    if (!message?.type) {
      return !!message?.text;
    }
    if (message.type === 'image' || message.type === 'frame') {
      return false;
    }
    if (message.type === 'text') {
      return true;
    }
    if (message.type === 'file') {
      return !message?.metadata?.type?.includes('audio');
    }
    return false;
  }

  isAudioMessage(message: any): boolean {
    return message?.type === 'file'
      && message?.metadata?.type
      && message.metadata.type.includes('audio');
  }

  isImageMessage(message: any): boolean {
    return message?.type === 'image';
  }

  isFrameMessage(message: any): boolean {
    return message?.type === 'frame';
  }

  senderInitial(name: string): string {
    return avatarPlaceholder(name || '');
  }

  senderColor(name: string): string {
    return getColorBck(name || '');
  }

  openImage(src: string): void {
    if (src) {
      window.open(src, '_blank');
    }
  }
}
