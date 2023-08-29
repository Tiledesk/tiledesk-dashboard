import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class GptService {

  GPT_API_URL: string;

  constructor(
    private httpClient: HttpClient,
    private logger: LoggerService,
    private appConfigService: AppConfigService
  ) { 
    // this.GPT_API_URL = this.appConfigService.getConfig().gptApiUrl;
    // this.GPT_API_URL = "https://tiledesk-playground.azurewebsites.net/api";
    this.GPT_API_URL = "http://tiledesk-backend.h8dahhe4edc7cahh.francecentral.azurecontainer.io:8000/api"
  }

  startScraping(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    const url = this.GPT_API_URL + "/scrape";
    this.logger.log('[GPT.SERV] - GET *ALL* TEMPLATES - URL', url);

    return this.httpClient.post(url, data, httpOptions);

  }

  checkScrapingStatus(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    const url = this.GPT_API_URL + "/scrape/status";
    this.logger.log('[GPT.SERV] - GET *ALL* TEMPLATES - URL', url);

    return this.httpClient.post(url, data, httpOptions);
  }

}
