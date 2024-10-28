import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggerService } from './logger/logger.service';
import { KB } from 'app/models/kbsettings-model';
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class KnowledgeBaseService {
  public newKb: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)
  public editedAiSettings$: BehaviorSubject<[]> = new BehaviorSubject<[]>([])
  public previewKbClosed$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)

  SERVER_BASE_PATH: string;
  TOKEN: string;
  user: any;
  project_id: any;

  constructor(
    public appConfigService: AppConfigService,
    private auth: AuthService,
    private httpClient: HttpClient,
    private logger: LoggerService
  ) {
    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getCurrentProject();
    this.getAppConfig();
  }

  // ******************************************
  // ********** INITIALIZING SERVICE **********
  // ***************** START ******************
  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
    } else {
      this.logger.log('[OPENAIKBS.SERVICE] - No user signed in');
    }
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
  }

  getCurrentProject() {
    this.logger.log("get current project")
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id
      }
    }, (error) => {
      this.logger.log("get current project ERROR: ", error)
    }, () => {
      this.logger.log("*COMPLETE*")
    });
  }

  // ******************************************
  // ********** INITIALIZING SERVICE **********
  // ***************** END ********************


  areNewwKb(areNewKb: boolean) {
    this.logger.log("[KNOWLEDGE BASE SERVICE] - areNew ", areNewKb);
    this.newKb.next(areNewKb)
  }

  getAllNamespaces() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/namespace/all";
    this.logger.log("[KNOWLEDGE BASE SERVICE] - get all NAMESPACES URL ", url);
    return this.httpClient.get(url, httpOptions);
  }

  createNamespace(namespacename) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    let body = { name: namespacename }
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/namespace/"
    this.logger.log("[KNOWLEDGE BASE SERVICE] - add NAMESPACES URL ", url);
    return this.httpClient.post(url, JSON.stringify(body), httpOptions);
  }

  updateNamespace(body: string, namespaceid: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    // let body = {name: namespacename}
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/namespace/" + namespaceid;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - upadateNamespace URL ", url);
    return this.httpClient.put(url, body, httpOptions);
  }

  public uploadFaqCsv(formData: any, namespaceid) {
   

    const options = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/csv?namespace=" + namespaceid;
    this.logger.log('[KNOWLEDGE BASE SERVICE] UPLOAD FAQS CSV - URL ', url);

    return this.httpClient
      .post(url, formData, options)
  }

  getListOfKb(params?) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb" + params;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - get settings URL ", url);
    return this.httpClient.get(url, httpOptions);
  }

  saveKbSettings(kb_settings) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/" + kb_settings._id;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - save settings URL ", url);
    return this.httpClient.put(url, kb_settings, httpOptions);
  }

  addSitemap(body: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/sitemap";
    this.logger.log("[KNOWLEDGE BASE SERVICE] - add new kb URL ", url);
    return this.httpClient.post(url, JSON.stringify(body), httpOptions);
  }

  addKb(body: any) {
    this.logger.log('addKb body ', body)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb";
    this.logger.log("[KNOWLEDGE BASE SERVICE] - add new kb URL (/KB) ", url);
    return this.httpClient.post(url, JSON.stringify(body), httpOptions);
  }

  addMultiKb(body: any, namespaceid: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/multi?namespace=" + namespaceid;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - add new kb URL (/MULTI) ", url);
    return this.httpClient.post(url, JSON.stringify(body), httpOptions);
  }

  getChatbotsUsingNamespace(namespace_id) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    // /kb/namespace/{namespace_id}/chatbots
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/namespace/" + namespace_id + "/chatbots";
    this.logger.log("[KNOWLEDGE BASE SERVICE] - get Chatbot using namespace ", url);
    return this.httpClient.get(url, httpOptions);
  }

  getContentChuncks(id_project: string, namespaceid: string, contentid: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    
    const url = this.SERVER_BASE_PATH + id_project + "/kb/namespace/" + namespaceid + "/chunks/" + contentid;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - get content chunks URL ", url);
    return this.httpClient.get(url, httpOptions);
  }

  deleteKb(data: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      }),
    }
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/" + data.id;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - delete kb URL ", url);
    return this.httpClient.delete(url, httpOptions);
  }


  deleteNamespace(namespace_id: string, removeAlsoNamespace) {
    this.logger.log('[KNOWLEDGE BASE SERVICE] deleteNamespace removeAlsoNamespace ', removeAlsoNamespace)
    this.logger.log('[KNOWLEDGE BASE SERVICE] deleteNamespace namespace_id ', namespace_id)
    let queryString = ''
    if (!removeAlsoNamespace) {
      queryString = "?contents_only=true"
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/namespace/" + namespace_id + queryString;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - delete namsespace url", url);
    return this.httpClient.delete(url, httpOptions);
  }

  hasChagedAiSettings(aisetting){
    this.logger.log("[KNOWLEDGE BASE SERVICE] - hasChagedAiSettings", aisetting);
    this.editedAiSettings$.next(aisetting)
  }

  modalPreviewKbHasBeenClosed() {
    this.logger.log("[KNOWLEDGE BASE SERVICE] - modalPreviewKbHasBeenClosed (clicking backdrop)");
    this.previewKbClosed$.next(true)
  }


  // DEPRECATED FUNCTIONS - START

  getKbSettingsPrev() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kb";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings";
    this.logger.log("[KNOWLEDGE BASE SERVICE] - get settings URL ", url);
    return this.httpClient.get(url, httpOptions);
  }

  addNewKbPrev(settings_id: string, body: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/" + settings_id;
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kb";
    this.logger.log("[KNOWLEDGE BASE SERVICE] - add new kb URL ", url);
    return this.httpClient.post(url, JSON.stringify(body), httpOptions);
  }

  deleteKbPrev(settings_id: string, id: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      }),
      //body: JSON.stringify(data)
    }
    // https://api.tiledesk.com/v3/649007cf2b0ceb0013adb39a/kbsettings/6581af98e677a60013cdccbe/65c4abc25fc7b7001300069a

    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/" + settings_id + "/" + id;
    // const url = this.SERVER_BASE_PATH + this.project_id + "/kb/"+data.id;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - delete kb URL ", url);
    return this.httpClient.delete(url, httpOptions);
  }

  saveKbSettingsPrev(kb_settings) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kb/" + kb_settings._id;
    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/" + kb_settings._id;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - save settings URL ", url);
    return this.httpClient.put(url, kb_settings, httpOptions);
  }

  // DEPRECATED FUNCTIONS - END


  // COMMENTED FUNCTIONS - START

  // getKbSettings() {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Authorization': this.TOKEN
  //     })
  //   }
  //   const url = this.SERVER_BASE_PATH + this.project_id + "/kb";
  //   //const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings";
  //   this.logger.log("[KNOWLEDGE BASE SERVICE] - get settings URL ", url);
  //   return this.httpClient.get(url, httpOptions);
  // }



  // deleteKb(settings_id: string, kb_id: string){
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Authorization': this.TOKEN
  //     })
  //   }
  //   //const url = this.SERVER_BASE_PATH + this.project_id + "/kb/" + kb_id;
  //   const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/" + settings_id + "/" + kb_id;
  //   this.logger.log("[KNOWLEDGE BASE SERVICE] - delete kb URL ", url);
  //   return this.httpClient.delete(url, httpOptions);
  // }



  // getListOfKb() {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Authorization': this.TOKEN
  //     })
  //   }
  //   const url = this.SERVER_BASE_PATH + this.project_id + "/kb";
  //   //const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings";
  //   this.logger.log("[KNOWLEDGE BASE SERVICE] - get settings URL ", url);
  //   return this.httpClient.get(url, httpOptions);
  // }


  // COMMENTED FUNCTIONS - END
}
