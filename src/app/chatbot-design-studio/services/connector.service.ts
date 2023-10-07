import { Injectable } from '@angular/core';
import { TiledeskConnectors } from 'app/../assets/cds/js/tiledesk-connectors.js';
import { StageService } from 'app/chatbot-design-studio/services/stage.service';
import { TYPE_ACTION, TYPE_BUTTON } from 'app/chatbot-design-studio/utils';
import { Intent } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';
/** CLASSE DI SERVICES PER GESTIRE I CONNETTORI **/


@Injectable({
  providedIn: 'root'
})

export class ConnectorService {
  listOfConnectors: any = {};
  tiledeskConnectors: any;
  connectorDraft: any = {};

  constructor(
    private stageService: StageService,
    private logger: LoggerService
  ) {}

  initializeConnectors(){
    this.tiledeskConnectors = new TiledeskConnectors("tds_drawer", {"input_block": "tds_input_block"}, []);
    this.tiledeskConnectors.mousedown(document);
  }

  resetConnectors(){}

  createConnectorDraft(detail){
    this.connectorDraft = {
      fromId: detail.fromId,
      fromPoint: detail.fromPoint,
      toPoint: detail.toPoint,
      menuPoint: detail.menuPoint,
      target: detail.target
    }
  }

  removeConnectorDraft(){
    this.connectorDraft = null;
    this.tiledeskConnectors.removeConnectorDraft();
  }




  /**  create Connectors */
  createConnectors(intents){
    // this.deleteAllConnectors();
    this.logger.log('[CONNECTOR-SERV] -----> createConnectors::: ', intents);
    intents.forEach(intent => {
      if(intent.actions){
        intent.actions.forEach(action => {
          this.logger.log('[CONNECTOR-SERV] createConnectors:: ACTION ', action);
          /**  INTENT */
          if(action._tdActionType === TYPE_ACTION.INTENT){
            this.logger.log('[CONNECTOR-SERV] intent_display_name', intent.intent_display_name);
            if(action.intentName && action.intentName !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId;
              const idConnectorTo = action.intentName.replace("#", ""); ;
              this.logger.log('[CONNECTOR-SERV] -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
          }

          /**  REPLY  RANDOM_REPLY */
          if(action._tdActionType === TYPE_ACTION.REPLY || action._tdActionType === TYPE_ACTION.RANDOM_REPLY){
            
            var buttons = this.findButtons(action);
            // this.logger.log('buttons   ----- >', buttons);
            buttons.forEach(button => {
              this.logger.log('[CONNECTOR-SERV] button   ----- > ', button);
              if(button.type === TYPE_BUTTON.ACTION && button.action){
                const idConnectorFrom = button.__idConnector;
                var startIndex = button.action.indexOf('#') + 1;
                var endIndex = button.action.indexOf('{');
                let idConnectorTo = button.action.substring(startIndex);
                if(endIndex>-1){
                  idConnectorTo = button.action.substring(startIndex, endIndex);
                }
                this.logger.log('[CONNECTOR-SERV] -> idConnectorFrom', idConnectorFrom);
                this.logger.log('[CONNECTOR-SERV] -> idConnectorTo', idConnectorTo);
                if(idConnectorFrom && idConnectorTo){
                  this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
                }
              }
            });
          }

          /**  ONLINE_AGENTS */
          if(action._tdActionType === TYPE_ACTION.ONLINE_AGENTS){
            if(action.trueIntent && action.trueIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/true';
              const idConnectorTo = action.trueIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - ONLINE_AGENTS ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - ONLINE_AGENTS ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
            if(action.falseIntent && action.falseIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/false';
              const idConnectorTo = action.falseIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - ONLINE_AGENTS ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - ONLINE_AGENTS ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
          }

          /**  OPEN_HOURS */
          if(action._tdActionType === TYPE_ACTION.OPEN_HOURS){
            if(action.trueIntent && action.trueIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/true';
              const idConnectorTo = action.trueIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - OPEN_HOURS ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - OPEN_HOURS ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
            if(action.falseIntent && action.falseIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/false';
              const idConnectorTo = action.falseIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - OPEN_HOURS ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - OPEN_HOURS ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
          }

          /**  JSON-CONDITION */
          if(action._tdActionType === TYPE_ACTION.JSON_CONDITION){
            if(action.trueIntent && action.trueIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/true';
              const idConnectorTo =  action.trueIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - JSON_CONDITION ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - JSON_CONDITION ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
            if(action.falseIntent && action.falseIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/false';
              const idConnectorTo = action.falseIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - JSON_CONDITION ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - JSON_CONDITION ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
          }

          /**  ASKGPT */
          if(action._tdActionType === TYPE_ACTION.ASKGPT){
            if(action.trueIntent && action.trueIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/true';
              const idConnectorTo =  action.trueIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - ASKGPT ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - ASKGPT ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
            if(action.falseIntent && action.falseIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/false';
              const idConnectorTo = action.falseIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - ASKGPT ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - ASKGPT ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
          }

          /**  WEB-REQUEST-V2 */
          if(action._tdActionType === TYPE_ACTION.WEB_REQUESTV2){
            if(action.trueIntent && action.trueIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/true';
              const idConnectorTo =  action.trueIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - WEB-REQUEST-V2 ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - WEB-REQUEST-V2 ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
            if(action.falseIntent && action.falseIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId + '/false';
              const idConnectorTo = action.falseIntent.replace("#", "");
              this.logger.log('[CONNECTOR-SERV] - WEB-REQUEST-V2 ACTION -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] - WEB-REQUEST-V2 ACTION -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
          }

          /**  CAPTURE USER_REPLY */
          if(action._tdActionType === TYPE_ACTION.CAPTURE_USER_REPLY){
            this.logger.log('[CONNECTOR-SERV] intent_display_name', intent.intent_display_name);
            if(action.goToIntent && action.goToIntent !== ''){
              const idConnectorFrom = intent.intent_id+'/'+action._tdActionId;
              const idConnectorTo = action.goToIntent.replace("#", ""); ;
              this.logger.log('[CONNECTOR-SERV] -> idConnectorFrom', idConnectorFrom);
              this.logger.log('[CONNECTOR-SERV] -> idConnectorTo', idConnectorTo);
              this.tiledeskConnectors.createConnectorFromId(idConnectorFrom, idConnectorTo);
            }
          }

        });
      }
    });
  }


  private findButtons(obj) {
    var buttons = [];
    if(!obj) return buttons;
    // Verifica se l'oggetto corrente è un array
    if (Array.isArray(obj)) {
      // Itera sugli elementi dell'array
      for (var i = 0; i < obj.length; i++) {
        // Richiama la funzione findButtons in modo ricorsivo per ogni elemento
        buttons = buttons.concat(this.findButtons(obj[i]));
      }
    } else if (typeof obj === 'object') {
      // Verifica se l'oggetto corrente ha una proprietà "buttons"
      if (obj.hasOwnProperty('buttons')) {
        // Aggiungi l'array di pulsanti alla lista dei pulsanti trovati
        obj.buttons.forEach(button => {
          buttons.push(button);
        });
      }
      // Itera sulle proprietà dell'oggetto
      for (var key in obj) {
        // Richiama la funzione findButtons in modo ricorsivo per ogni proprietà
        buttons = buttons.concat(this.findButtons(obj[key]));
      }
    }
    return buttons;
  }

  /** */
  createNewConnector(fromId:string, toId:string){
    this.logger.log('[CONNECTOR-SERV] createNewConnector:: fromId:', fromId, 'toId:', toId);
    const elFrom = document.getElementById(fromId);
    const elTo = document.getElementById(toId);
    this.logger.log('[CONNECTOR-SERV] createNewConnector:: ', elFrom, elTo);
    if (elFrom && elTo) { 
      const fromPoint = this.tiledeskConnectors.elementLogicCenter(elFrom);
      const toPoint = this.tiledeskConnectors.elementLogicTopLeft(elTo);
      this.tiledeskConnectors.createConnector(fromId, toId, fromPoint, toPoint);
    }
  }
  

  /** */
  deleteAllConnectors(){
    this.logger.log('[CONNECTOR-SERV] deleteAllConnectors:: ');
    this.tiledeskConnectors.deleteAllConnectors();
  }


  /** deleteConnectorWithIDStartingWith 
   * elimino il connettore creato in precedenza sul sullo stesso punto
   * e lo sostituisco con il nuovo
  */
  deleteConnectorWithIDStartingWith(connectorID){
    this.logger.log('[CONNECTOR-SERV] deleteConnectorWithIDStartingWith:: ', this.tiledeskConnectors.connectors);
    const listOfConnectors = Object.keys(this.tiledeskConnectors.connectors)
    .filter(key => key.startsWith(connectorID))
    .reduce((filteredMap, key) => {
      filteredMap[key] = this.tiledeskConnectors.connectors[key];
      return filteredMap;
    }, {});
    for (const [key, connector] of Object.entries(listOfConnectors)) {
      // this.logger.log('delete connector :: ', key );
      this.tiledeskConnectors.deleteConnector(key);
    };
  }

  /** */
  deleteConnector(connectorID){
    this.logger.log('[CONNECTOR-SERV] deleteConnector::  connectorID ', connectorID)
    this.tiledeskConnectors.deleteConnector(connectorID);
  }

  deleteConnectorToList(connectorID){
    this.logger.log('[CONNECTOR-SERV] deleteConnectorToList::  connectorID ', connectorID)
    delete this.listOfConnectors[connectorID];
  }

  addConnectorToList(connector){
    this.listOfConnectors[connector.id] = connector;
    this.logger.log('[CONNECTOR-SERV] addConnector::  connector ', connector)
  }
  


  createConnectorFromId(fromId, toId){
    this.logger.log('[CONNECTOR-SERV] createConnectorFromId fromId ', fromId, ' toId ', toId)
    let intervalId = setInterval(async () => {
      const result = await this.tiledeskConnectors.createConnectorFromId(fromId, toId);
      if (result === true) {
        clearInterval(intervalId);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(intervalId);
    }, 1000);
  }
 

  // deleteINConnectorsOfBlock(intent_id){
  //   this.tiledeskConnectors.deleteINConnectorsOfBlock(intent_id);
  //   this.logger.log('[CONNECTOR-SERV] deleteINConnectorsOfBlock intent_id ' ,intent_id);
  // }

  deleteConnectorsOfBlock(intent_id){
    this.tiledeskConnectors.deleteConnectorsOfBlock(intent_id);
    this.logger.log('[CONNECTOR-SERV] deleteConnectorsOfBlock intent_id ' ,intent_id);
  }

  deleteConnectorFromAction(actionId, connId){
    this.tiledeskConnectors.deleteConnectorFromAction(actionId, connId);
    this.logger.log('[CONNECTOR-SERV] deleteConnectorFromAction actionId ' ,actionId ,' connId ', connId)
  }

  deleteConnectorsFromActionByActionId(actionId){
    this.tiledeskConnectors.deleteConnectorsFromActionByActionId(actionId);
    this.logger.log('[CONNECTOR-SERV] deleteConnectorsFromActionByActionId actionId ' ,actionId )
  }

  movedConnector(elementID){
    this.logger.log('[CONNECTOR-SERV] movedConnector elementID ' ,elementID )
    const elem = document.getElementById(elementID);
    if(elem){
      this.logger.log('aggiorno i connettori: ', elem);
      setTimeout(() => {
        this.tiledeskConnectors.updateConnectorsOutOfItent(elem);
      }, 0);
    }
  }


  moved(element, x, y){
    this.tiledeskConnectors.moved(element, x, y);
    // this.logger.log('[CONNECTOR-SERV] moved element ' ,element , ' x ' , x ,  'y ',  y )
  }

}
