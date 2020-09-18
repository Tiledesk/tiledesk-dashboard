import { Injectable } from '@angular/core';
// import { ScriptStore } from "./script.store";
// import { ScriptStoreT } from "./script.store";
import { environment } from '../../../environments/environment';
import { Http, Headers } from '@angular/http';

declare var document: any;

// https://stackoverflow.com/questions/34489916/how-to-load-external-scripts-dynamically-in-angular

@Injectable()
export class ScriptService {

script: any;

  private scripts: any = {};


  http: Http;
  constructor(
    http: Http
  ) {

    this.http = http;

    console.log('ScriptService Hello !!!')

    if (environment.remoteConfig === false) {

      if (environment.hasOwnProperty("globalRemoteJSSrc")) {

        const isEmptyGlobalRemoteJSSrc = this.isEmpty(environment['globalRemoteJSSrc'])

        if (!isEmptyGlobalRemoteJSSrc) {

          const scriptString = environment['globalRemoteJSSrc']
          console.log('ScriptService globalRemoteJSSrc scriptString', scriptString);

          this.buildScriptArray(scriptString)
        } else {
          console.log('ScriptService REMOTE CONFIG FALSE - ENV has the property globalRemoteJSSrc but IT IS EMPTY');
        }
      } else {
        console.log('ScriptService REMOTE CONFIG FALSE - ENV not has the property globalRemoteJSSrc');
      }
    } else {

      this.loadRemoteConfig(environment['remoteConfigUrl'])

    }


    // ScriptStore.forEach((script: any) => {
    //   this.scripts[script.name] = {
    //     loaded: false,
    //     src: script.src
    //   };
    // });

    // console.log('ScriptService ScriptStore scripts', this.scripts);


  }



  async loadRemoteConfig(remoteConfigUrl) {
    const res = await this.http.get(remoteConfigUrl).toPromise();
    console.log('ScriptService REMOTE CONFIG TRUE - GET RES', res);

    const remoteCONFIG = JSON.parse(res['_body'])
    console.log('ScriptService REMOTE CONFIG TRUE - remoteCONFIG', remoteCONFIG);


    if (remoteCONFIG.hasOwnProperty("globalRemoteJSSrc")) {

      const isEmptyGlobalRemoteJSSrc = this.isEmpty(remoteCONFIG['globalRemoteJSSrc'])

      if (!isEmptyGlobalRemoteJSSrc) {

        const scriptString = remoteCONFIG['globalRemoteJSSrc']
        console.log('ScriptService globalRemoteJSSrc scriptString', scriptString);

        this.buildScriptArray(scriptString)

      } else {
        console.log('ScriptService REMOTE CONFIG TRUE - remoteCONFIG has the property globalRemoteJSSrc but IT IS EMPTY');
      }

    } else {
      console.log('ScriptService REMOTE CONFIG TRUE - remoteCONFIG not has the property globalRemoteJSSrc');
    }
  }

  buildScriptArray(scriptString) {

    var scriptArray = scriptString.split(",");
    console.log('ScriptService scriptArray', scriptArray);

    let count = 0;
    this.scripts = []
    const scriptArrayKeyValue = []
    scriptArray.forEach(scriptSrc => {
      count = count + 1;
      // console.log('ScriptService  scriptArray', scriptSrc);
      scriptArrayKeyValue.push({ name: 'custom_script_' + count, src: scriptSrc })
      this.scripts.push('custom_script_' + count);
    });

    console.log('ScriptService  scriptArrayKeyValue', scriptArrayKeyValue);
    console.log('ScriptService  scripts_name', this.scripts);


    scriptArrayKeyValue.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });

    console.log('ScriptService ScriptStore scripts', this.scripts);

    this.load()
  }



  // load(...scripts: string[]) {
    load() {
    console.log('ScriptService load ...scripts ', this.scripts)
    var promises: any[] = [];
    this.scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
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
