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
import { BrandService } from '../brand.service';
import { TranslateService } from '@ngx-translate/core';
const Swal = require('sweetalert2')



@Injectable()
export class LogRequestsInterceptor implements HttpInterceptor {
  private supportEmail: string
  constructor(
    public brandService: BrandService,
    private translate: TranslateService
  ) {
    const brand = brandService.getBrand();
    this.supportEmail = brand['CONTACT_US_EMAIL'];
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // if (request.method === 'GET') {
    //   console.log('HTTP GET Request URL:', request.url);
    // }
    
    
   
    // return next.handle(request).pipe(
    //   tap(event => {
    //     console.log('HTTP GET Request event:', event);
    //     // Optionally handle the response or log it here
    //   })
    // );

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (request.method === 'GET') {
          // Handle GET request error
          console.error('[HTTP-INTERCEPTOR] GET request error:', error);
          // console.log('[HTTP-INTERCEPTOR] error status ', error.status) 
          if ( error.status === 429) {
            this.presentAlert()
          }
          // You can also use a notification service to display the error message to the user
        }
        return throwError(error);
      })
    );
  }
  


  presentAlert() {
    Swal.fire({
      title: this.translate.instant('QuotaExceededm'),
      text: this.translate.instant('PleaseContactSupport'), 
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('ContactUs'),
      confirmButtonColor: "var(--blue-light)",
      // cancelButtonColor: "var(--red-color)",
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => { 
      if (result.isConfirmed) { 
        window.open(`mailto:${this.supportEmail}?subject=Quota exceeded`);
      }
    })
  }

}


// vedi telegram 6 settembre 2023 quota-exceded
// se ti ritorna 429 mostri un alert : Quota exceded. Please contact support. con un pulsante Cancel
 
// se utente preme cancel può continuare a navigare sulla dashboard 
// ma sicuramente se continuerà a navigare usciranno altri alert

