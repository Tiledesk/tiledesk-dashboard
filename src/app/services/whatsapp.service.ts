import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from './logger/logger.service';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  WHATSAPP_API_URL: string;
  project: any;

  constructor(
    private auth: AuthService,
    private httpClient: HttpClient,
    private logger: LoggerService,
    private appConfigService: AppConfigService,
  ) {
    this.WHATSAPP_API_URL = this.appConfigService.getConfig().whatsappApiUrl;
    this.logger.log("WHATSAPP_API_URL: ", this.WHATSAPP_API_URL);

    this.getCurrentProject();

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
    })
  }

  getAllTemplates() {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    const url = this.WHATSAPP_API_URL + "/api/templates/" + this.project._id;
    this.logger.log('[WHATSAPP.SERV] - GET *ALL* TEMPLATES - URL', url);

    return this.httpClient.get<any[]>(url, httpOptions)
  }
}