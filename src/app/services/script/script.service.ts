import { Injectable } from '@angular/core';
// import { ScriptStore } from "./script.store";
// import { ScriptStoreT } from "./script.store";
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '../../services/logger/logger.service';
declare var document: any;

// https://stackoverflow.com/questions/34489916/how-to-load-external-scripts-dynamically-in-angular

@Injectable()
export class ScriptService {

  script: any;

  private scripts: any = {};

  constructor(
    private _httpClient: HttpClient,
    private logger: LoggerService
  ) {
    this.logger.log('[SCRIPT-SERV] Hello !!!')

    if (environment.remoteConfig === false) {

      if (environment.hasOwnProperty("globalRemoteJSSrc")) {

        const isEmptyGlobalRemoteJSSrc = this.isEmpty(environment['globalRemoteJSSrc'])

        if (!isEmptyGlobalRemoteJSSrc) {

          const scriptString = environment['globalRemoteJSSrc']
          this.logger.log('[SCRIPT-SERV] globalRemoteJSSrc scriptString', scriptString);

          this.buildScriptArray(scriptString)
        } else {
          this.logger.log('[SCRIPT-SERV] REMOTE CONFIG FALSE - ENV has the property globalRemoteJSSrc but IT IS EMPTY');
        }
      } else {
        this.logger.log('[SCRIPT-SERV] REMOTE CONFIG FALSE - ENV not has the property globalRemoteJSSrc');
      }
    } else {

      this.loadRemoteConfig(environment['remoteConfigUrl'])

    }
  }



  async loadRemoteConfig(remoteConfigUrl) {
    const res = await this._httpClient.get(remoteConfigUrl).toPromise();
    this.logger.log('[SCRIPT-SERV] REMOTE CONFIG TRUE - GET RES', res);
   
    // ----------------------------------------------------
    // Used with the angular http service
    // ----------------------------------------------------
    // const remoteCONFIG = JSON.parse(res['_body'])
    // this.logger.log('[SCRIPT-SERV] REMOTE CONFIG TRUE - remoteCONFIG', remoteCONFIG);

    const remoteCONFIG = res
    if (remoteCONFIG.hasOwnProperty("globalRemoteJSSrc")) {

      const isEmptyGlobalRemoteJSSrc = this.isEmpty(remoteCONFIG['globalRemoteJSSrc'])

      if (!isEmptyGlobalRemoteJSSrc) {

        const scriptString = remoteCONFIG['globalRemoteJSSrc']
        this.logger.log('[SCRIPT-SERV] globalRemoteJSSrc scriptString', scriptString);

        this.buildScriptArray(scriptString)

      } else {
        this.logger.log('[SCRIPT-SERV] REMOTE CONFIG TRUE - remoteCONFIG has the property globalRemoteJSSrc but IT IS EMPTY');
      }

    } else {
      this.logger.log('[SCRIPT-SERV] REMOTE CONFIG TRUE - remoteCONFIG not has the property globalRemoteJSSrc');
    }
  }

  buildScriptArray(scriptString) {
    var scriptArray = scriptString.split(",");
    this.logger.log('[SCRIPT-SERV] scriptArray', scriptArray);

    let count = 0;
    this.scripts = []
    const scriptArrayKeyValue = []
    scriptArray.forEach(scriptSrc => {
      count = count + 1;
      // this.logger.log('ScriptService  scriptArray', scriptSrc);
      scriptArrayKeyValue.push({ name: 'custom_script_' + count, src: scriptSrc })
      this.scripts.push('custom_script_' + count);
    });

    this.logger.log('[SCRIPT-SERV]  scriptArrayKeyValue', scriptArrayKeyValue);
    this.logger.log('[SCRIPT-SERV]  scripts_name', this.scripts);


    scriptArrayKeyValue.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });

    this.logger.log('[SCRIPT-SERV] ScriptStore scripts', this.scripts);

    this.load()
  }



  // load(...scripts: string[]) {
  load() {
    this.logger.log('[SCRIPT-SERV] load ...scripts ', this.scripts)
    var promises: any[] = [];
    this.scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises)
      .catch((err) => {
        // log that I have an error, return the entire array;
        this.logger.error('A promise failed to resolve', err);

      });
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      //resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
      else {
        //load script
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  //IE
          script.onreadystatechange = () => {
            if (script.readyState === "loaded" || script.readyState === "complete") {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {  //Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }



  isEmpty(url: string) {
    return (url === undefined || url == null || url.length <= 0) ? true : false;
  }




}
