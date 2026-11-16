import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from './logger/logger.service';

export interface KbSourceProvider {
  id: string;
  available: boolean;
}

export interface KbSourceProviders {
  providers: KbSourceProvider[];
  kb_max_file_size: number;
  supported_extensions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class KbSourcesService {

  SERVER_BASE_PATH: string;
  TOKEN: string;
  project_id: string;

  constructor(
    private appConfigService: AppConfigService,
    private auth: AuthService,
    private httpClient: HttpClient,
    private logger: LoggerService,
  ) {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token;
      }
    });
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id;
      }
    });
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
  }

  private get baseUrl(): string {
    return this.SERVER_BASE_PATH + this.project_id + '/kb/sources';
  }

  private get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
  }

  /** Admin-only: available providers plus the server KB file limit and extensions. */
  getProviders(): Observable<KbSourceProviders> {
    const url = this.baseUrl + '/providers';
    this.logger.log('[KB-SOURCES.SERVICE] - get providers URL ', url);
    return this.httpClient.get<KbSourceProviders>(url, this.httpOptions);
  }
}
