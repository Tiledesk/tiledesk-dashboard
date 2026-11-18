import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpStatsService } from '../http-stats.service';

interface EndpointStats {
  count: number;
  totalTime: number;
  avgTime: number;
}

/** error_code of the server when a credits project cannot pay for an operation */
const CREDITS_INSUFFICIENT = 13010;
const CREDITS_UNPRICED_MODEL = 13011;


@Injectable()
export class LogRequestsInterceptor implements HttpInterceptor {

  private stats: Record<string, EndpointStats> = {};
  private creditsAlertOpen = false;

  // TranslateService and Router are read lazily: the translations are loaded with HttpClient,
  // which needs this interceptor
  constructor(
    private httpStats: HttpStatsService,
    private injector: Injector,
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
    // this.snackBar.open( `529 Server overloaded`, '✕',
    //   { duration: 1500, 
    //     horizontalPosition: 'end',  // aligns to the right
    //     verticalPosition: 'top',    // aligns to the top
    //     panelClass: ['custom-error-snackbar'] // apply your own style 
    //   }
    // );
    const startTime = Date.now();
    const endpoint = request.url;
    const method = request.method;  

    return next.handle(request).pipe(
       tap(event => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - startTime;  // <-- Cambiato da performance.now() a Date.now()

          // USA IL SERVIZIO invece delle statistiche interne
         this.httpStats.updateStats(endpoint, method, elapsed);

          // Log in console (opzionale)
          // console.log(`HTTP-INTERCEPTOR [HTTP] ${request.method} ${request.url} - ${elapsed.toFixed(1)}ms`);
        }
      }),
      catchError((error: HttpErrorResponse) => {

      
          // console.log('[HTTP-INTERCEPTOR] Request URL in catchError:', request.url , ' method: ', request.method);
     
          // Handle request error
          // console.log('[HTTP-INTERCEPTOR] GET request error:', error);
          // console.log('[HTTP-INTERCEPTOR] error status ', error.status) 
          // console.log('[HTTP-INTERCEPTOR] GET request error msg:', error.error.msg);

          // if (error.status === 429) {
          //   this.snackBar.open( `429 Too many requests`, '✕',
          //     { duration: 1500, 
          //       horizontalPosition: 'end',  // aligns to the right
          //       verticalPosition: 'top',    // aligns to the top
          //       panelClass: ['custom-error-snackbar'] // apply your own style 
          //     }
          //   );
          // }

          // if (error.status === 529) { 
          //   // this.notify.showWidgetStyleUpdateNotification("529 Server overloaded", 4, 'report_problem');
          //   this.snackBar.open( `529 Server overloaded`,'✕',
          //     { duration: 1500, 
          //       horizontalPosition: 'end',  // aligns to the right
          //       verticalPosition: 'top',    // aligns to the top
          //       panelClass: ['custom-error-snackbar'] // apply your own style 
          //     }
          //   );
          // }

          // if ((error.status !== 529) && error.status >= 500 && error.status < 600) { 
          //   const errorMessage = `${error.status} ${error.error?.msg || 'Server Error'}`;
          //   this.snackBar.open( `${errorMessage} `, '✕',
          //     { duration: 1500, 
          //       horizontalPosition: 'end',  // aligns to the right
          //       verticalPosition: 'top',    // aligns to the top
          //       panelClass: ['custom-error-snackbar'] // apply your own style 
          //     }
          //   );
          // } 

        if (error.status === 403 && error.error && [CREDITS_INSUFFICIENT, CREDITS_UNPRICED_MODEL].includes(error.error.error_code)) {
          this.presentCreditsRefused(error.error);
        }
        return throwError(error);
      })
    );
    
  }

  /** The operation was refused for the credits: one alert at a time, with the way to the credits page */
  private presentCreditsRefused(body: { error_code: number }) {
    const router = this.injector.get(Router);
    const match = router.url.match(/\/project\/([^\/?#]+)/);
    if (this.creditsAlertOpen || !match) {
      return;
    }
    const translate = this.injector.get(TranslateService);
    const unpriced = body.error_code === CREDITS_UNPRICED_MODEL;
    this.creditsAlertOpen = true;
    Swal.fire({
      title: translate.instant(unpriced ? 'Credits.UnpricedRefusedTitle' : 'Credits.RefusedTitle'),
      text: translate.instant(unpriced ? 'Credits.UnpricedRefusedText' : 'Credits.RefusedText'),
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: translate.instant('Cancel'),
      confirmButtonText: translate.instant('Credits.SeeCosts'),
      reverseButtons: true,
    }).then((result) => {
      this.creditsAlertOpen = false;
      if (result.isConfirmed) {
        router.navigate(['/project', match[1], 'credits']);
      }
    });
  }
  /** Metodo per leggere le statistiche da un servizio o componente */
  getStats(): Record<string, EndpointStats> {
    return this.stats;
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

