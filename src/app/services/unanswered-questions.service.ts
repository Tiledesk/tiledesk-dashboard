import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { AppConfigService } from './app-config.service';
import { KB_DEFAULT_PARAMS } from 'app/utils/util';

export interface UnansweredQuestion {
  id: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class UnansweredQuestionsService {
  SERVER_BASE_PATH: string;
  TOKEN: string;
  project: any;

  constructor(
    private _httpClient: HttpClient,
    private auth: AuthService,
    private appConfigService: AppConfigService
  ) {
    this.getAppConfig();
    this.getToken();
    this.getCurrentProject();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
  }

  getToken() {
    const user = this.auth.user_bs.value;
    if (user) {
      this.TOKEN = user.token;
    }
  }

  getCurrentProject() {
    this.project = this.auth.project_bs.value;
  }

  _getUnansweredQuestions(id_project: string, namespace_id: string, LIMIT: KB_DEFAULT_PARAMS, page: number): Observable<UnansweredQuestion[]> {
    const url = `${this.SERVER_BASE_PATH}${id_project}/kb/unanswered/${namespace_id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this._httpClient.get<UnansweredQuestion[]>(url, httpOptions);
  }

  getUnansweredQuestions(id_project: string, namespace_id: string, limit?: number, page?: number): Observable<UnansweredQuestion[]> {
    let url = `${this.SERVER_BASE_PATH}${id_project}/kb/unanswered/${namespace_id}`;
    
    // Add pagination parameters if provided
    const params: string[] = [];
    if (limit !== undefined) {
      params.push(`limit=${limit}`);
    }
    if (page !== undefined) {
      params.push(`page=${page}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    console.log('getUnansweredQuestions URL ', url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this._httpClient.get<UnansweredQuestion[]>(url, httpOptions);
  }

  mock_getUnansweredQuestions(): Observable<UnansweredQuestion[]> {
    return of([
      { id: '1', text: 'How can I reset my password?' },
      { id: '2', text: 'What is the refund policy?' },
      { id: '3', text: 'How do I contact support?' },
      { id: '4', text: 'Where can I find my invoices?' }
    ]);
  }

  deleteUnansweredQuestion(id_project: string, question_id: string): Observable<any> {
    const url = `${this.SERVER_BASE_PATH}${id_project}/kb/unanswered/${question_id} `;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      }),
      body: { id: question_id }
    };
    return this._httpClient.delete<any>(url, httpOptions);
  }
} 