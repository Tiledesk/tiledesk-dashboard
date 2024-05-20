import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogRequestsInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.method === 'GET') {
      console.log('[INTERCEPTOR] HTTP GET Request URL:', request.url);
    }

    return next.handle(request).pipe(
      tap(event => {
        // Optionally handle the response or log it here
        console.log('[INTERCEPTOR] HTTP GET Request event:', event);
        // vedi telegram 6 settembre 2023
        // se ti ritorna 429 mostri un alert : Quota exceded. Please contact support. con un pulsante Cancel

        // se utente preme cancel può continuare a navigare sulla dashboard

        // ma sicuramente se continuerà a navigare usciranno altri alert
      })
    );
  }
}
