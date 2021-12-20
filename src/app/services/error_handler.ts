import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ErrorHandler {
    project_id: string;
    isRefreshingToken = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    constructor(
        private router: Router,
        private auth: AuthService
    ) {
        this.getCurrentProject();
    }

    getCurrentProject() {
        this.auth.project_bs.subscribe((project) => {
            if (project) {
                this.project_id = project._id
            }

            // console.log('00 -> DEPTS COMP project ID from AUTH service subscription  ', this.project._id)
        });
    }

    public handleError(err: any, next: HttpHandler, req: HttpRequest<any>) {
        // this.snackbar.open(err.message, 'close');
        // console.error('>>> ERROR HANDLER - ERR <<<< ', err)
        // console.error('>>> ERROR HANDLER - NEXT <<<< ', next)
        // console.error('>>> ERROR HANDLER - REQUEST <<<< ', req)
        // console.error('>>> ERROR HANDLER - ERROR STATUS <<<< ', err.status)
        if (err.status === 403) {

            this.router.navigate(['project/' + this.project_id + '/unauthorized']);

        } else if (err.status === 401) {

            if (!this.isRefreshingToken) {
                this.isRefreshingToken = true;

               const refreshToken = localStorage.getItem('refreshToken');
            //    console.error('>>> ERROR HANDLER - REFRESH TOKEN <<<< ', refreshToken);

               
            }
        }
    }
}
