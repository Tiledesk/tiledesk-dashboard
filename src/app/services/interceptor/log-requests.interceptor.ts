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
import { MatSnackBar } from '@angular/material/snack-bar';




@Injectable()
export class LogRequestsInterceptor implements HttpInterceptor {
  private supportEmail: string
  constructor(
    private snackBar: MatSnackBar
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
            this.snackBar.open( `429 Too many requests`, '✕',
              { duration: 1500, 
                horizontalPosition: 'end',  // aligns to the right
                verticalPosition: 'top',    // aligns to the top
                panelClass: ['custom-error-snackbar'] // apply your own style 
              }
            );
          }
          if (error.status === 529) { 
            this.snackBar.open( `529 Server overloaded`,'✕',
              { duration: 1500, 
                horizontalPosition: 'end',  // aligns to the right
                verticalPosition: 'top',    // aligns to the top
                panelClass: ['custom-error-snackbar'] // apply your own style 
              }
            );
          }

          if ((error.status !== 529) && error.status >= 500 && error.status < 600) { 
            const errorMessage = `${error.status} ${error.error?.msg || 'Server Error'}`;
            this.snackBar.open( `${errorMessage} `, '✕',
              { duration: 1500, 
                horizontalPosition: 'end',  // aligns to the right
                verticalPosition: 'top',    // aligns to the top
                panelClass: ['custom-error-snackbar'] // apply your own style 
              }
            );
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

