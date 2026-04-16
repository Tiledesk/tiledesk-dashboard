import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { AppConfigService } from './app-config.service';
import { KB_DEFAULT_PARAMS } from 'app/utils/util';
import { LoggerService } from './logger/logger.service';

export interface UnansweredQuestion {
  id: string;
  text?: string;
  question?: string;
  /** Testo risposta (API kb/answered, campo `answer` sugli elementi di `questions`). */
  answer?: string;
  _id?: string;
  request_id?: string;
  requestId?: string;
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class UnansweredQuestionsService {
  SERVER_BASE_PATH: string;
  TOKEN: string;
  project: any;

  constructor(
    private _httpClient: HttpClient,
    private auth: AuthService,
    private appConfigService: AppConfigService,
    private logger: LoggerService,
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

  getUnansweredQuestions(
    id_project: string,
    namespace_id: string,
    limit?: number,
    page?: number,
    sortField?: string,
    direction?: number,
    search?: string
  ): Observable<UnansweredQuestion[]> {
    let url = `${this.SERVER_BASE_PATH}${id_project}/kb/unanswered/${namespace_id}`;

    const params: string[] = [];
    if (limit !== undefined) {
      params.push(`limit=${limit}`);
    }
    if (page !== undefined) {
      params.push(`page=${page}`);
    }
    if (sortField !== undefined) {
      params.push(`sortField=${encodeURIComponent(sortField)}`);
    }
    if (direction !== undefined) {
      params.push(`direction=${direction}`);
    }
    const searchTrimmed = search != null && String(search).trim() !== '' ? String(search).trim() : '';
    if (searchTrimmed) {
      params.push(`search=${encodeURIComponent(searchTrimmed)}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    this.logger.log('getUnansweredQuestions URL ', url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this._httpClient.get<UnansweredQuestion[]>(url, httpOptions);
  }

  getAnsweredQuestions(
    id_project: string,
    namespace_id: string,
    limit?: number,
    page?: number,
    sortField?: string,
    direction?: number,
    search?: string
  ): Observable<UnansweredQuestion[]> {
    let url = `${this.SERVER_BASE_PATH}${id_project}/kb/answered/${namespace_id}`;

    const params: string[] = [];
    if (limit !== undefined) {
      params.push(`limit=${limit}`);
    }
    if (page !== undefined) {
      params.push(`page=${page}`);
    }
    if (sortField !== undefined) {
      params.push(`sortField=${encodeURIComponent(sortField)}`);
    }
    if (direction !== undefined) {
      params.push(`direction=${direction}`);
    }
    const searchTrimmed = search != null && String(search).trim() !== '' ? String(search).trim() : '';
    if (searchTrimmed) {
      params.push(`search=${encodeURIComponent(searchTrimmed)}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    this.logger.log('getAnsweredQuestions URL ', url)
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

  /** DELETE /:projectid/kb/answered/:id — elimina una AnsweredQuestion per `_id`. */
  deleteAnsweredQuestion(id_project: string, answered_id: string): Observable<any> {
    const url = `${this.SERVER_BASE_PATH}${id_project}/kb/answered/${answered_id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this._httpClient.delete<any>(url, httpOptions);
  }


} 


