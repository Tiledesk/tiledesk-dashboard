import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
// import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/notify.service';
// const Swal = require('sweetalert2')



@Injectable()
export class LogRequestsInterceptor implements HttpInterceptor {
  private supportEmail: string
  constructor(
 
    private translate: TranslateService,
     public notify: NotifyService,
  ) {
   
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // console.log('[HTTP-INTERCEPTOR] Request URL:', request.url , ' method: ', request.method);
    // if (request.method === 'GET') {
    //   console.log('[HTTP-INTERCEPTOR] Request URL:', request.url , ' method: ', request.method);
    // }
    
    // return next.handle(request).pipe(
    //   tap(event => {
    //     console.log('HTTP GET Request event:', event);
    //     // Optionally handle the response or log it here
    //   })
    // );

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // console.log('[HTTP-INTERCEPTOR] Request URL in catchError:', request.url , ' method: ', request.method);
        // if (request.method === 'GET') {
          // Handle request error
          // console.log('[HTTP-INTERCEPTOR] GET request error:', error);
          // console.log('[HTTP-INTERCEPTOR] error status ', error.status) 
          // console.log('[HTTP-INTERCEPTOR] GET request error msg:', error.error.msg);
          if (error.status === 429) {
            this.notify.showWidgetStyleUpdateNotification("429 Too many requests", 4, 'report_problem');
          }
          if (error.status === 529) { 
            this.notify.showWidgetStyleUpdateNotification("529 Server overloaded", 4, 'report_problem');
          }

          if ((error.status !== 529) && error.status >= 500 && error.status < 600) { 
            const errorMessage = `${error.status} ${error.error?.msg || 'Server Error'}`;
            this.notify.showWidgetStyleUpdateNotification(errorMessage, 4, 'report_problem')
          } 
      
        return throwError(error);
      })
    );
  }
  


  // presentAlert() {
  //   Swal.fire({
  //     title: '429 ' + this.translate.instant('TooManyRequests'),
  //     text: this.translate.instant('PleaseContactSupport'), 
  //     icon: "warning",
  //     showCloseButton: false,
  //     showCancelButton: true,
  //     confirmButtonText: this.translate.instant('ContactUs'),
  //     // confirmButtonColor: "var(--blue-light)",
  //     // cancelButtonColor: "var(--red-color)",
  //     focusConfirm: false,
  //     reverseButtons: true,
  //   }).then((result) => { 
  //     if (result.isConfirmed) { 
  //       window.open(`mailto:${this.supportEmail}?subject=Quota exceeded`);
  //     }
  //   })
  // }

}


// vedi telegram 6 settembre 2023 quota-exceded
// se ti ritorna 429 mostri un alert : Quota exceded. Please contact support. con un pulsante Cancel
 
// se utente preme cancel può continuare a navigare sulla dashboard 
// ma sicuramente se continuerà a navigare usciranno altri alert

