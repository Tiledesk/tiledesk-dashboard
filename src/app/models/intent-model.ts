import { TYPE_BUTTON, TYPE_OPERATOR, TYPE_URL } from './../chatbot-design-studio/utils';
import { TYPE_ACTION, TYPE_ATTACHMENT, TYPE_METHOD_REQUEST, TYPE_MATH_OPERATOR } from '../chatbot-design-studio/utils';
import { v4 as uuidv4 } from 'uuid';

export class Intent {
    webhook_enabled?: boolean;
    enabled?: boolean;
    topic?: string;
    status?: string;
    id_faq_kb?: string;
    question?: string;
    answer?: string;
    form?: Form;
    actions?: Action[];
    id_project?: string;
    language?: string;
    intent_display_name?: string;
    createdBy?: string;
    intent_id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    id?: string;
    constructor() {
        this.actions = [];
    }
}


export class Action {
    _tdActionType: string;
    _tdActionTitle: string = '';
    _tdActionId: any = uuidv4();
}

// export class ActionCondition extends Action {
//     condition: string;
//     trueIntent: string;
//     falseIntent: string;
//     stopOnConditionMet: boolean;
//     constructor() {
//         super();
//         this._tdActionType = TYPE_ACTION.CONDITION;
//     }
// }
/*
export class ActionAssignVariable extends Action {
    expression: string;
    assignTo: string;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.ASSIGN_VARIABLE;
    }
}
*/


export class Operation {
    operators?: Array<TYPE_MATH_OPERATOR>
    operands: Array<Operand>
}

export class Operand {
    value: string
    isVariable: boolean
    function?: any
}

export class ActionAssignVariable extends Action {
    destination: string;
    operation: Operation;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.ASSIGN_VARIABLE;
        this.operation = {
            operands: [{
                value: '',
                isVariable: false
            }],
            operators: []
        };
    }
}

export class ActionAssignFunction extends Action {
    functionName: string;
    assignTo: string;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.ASSIGN_FUNCTION;
        this.assignTo = '';
    }
}


export class ActionDeleteVariable extends Action {
    variableName: string
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.DELETE_VARIABLE;
    }
}

export class ActionOnlineAgent extends Action {
    trueIntent: string;
    falseIntent: string;
    trueIntentAttributes?: string;
    falseIntentAttributes?: string;
    stopOnConditionMet: boolean;
    constructor() {
        super();
        this.stopOnConditionMet = true;
        this._tdActionType = TYPE_ACTION.ONLINE_AGENTS;
    }
}

export class ActionOpenHours extends Action {
    trueIntent: string;
    falseIntent: string;
    trueIntentAttributes?: string;
    falseIntentAttributes?: string;
    stopOnConditionMet: boolean;
    constructor() {
        super();
        this.stopOnConditionMet = true;
        this._tdActionType = TYPE_ACTION.OPEN_HOURS;
    }
}

export class ActionHideMessage extends Action {
    text: string;
    attributes: {};
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.HIDE_MESSSAGE;
        this.attributes = {  subtype: "info"}
    }
}

export class ActionReply extends Action {
    text?: string;
    attributes: Attributes;
    constructor(text?: string, attributes?: Attributes) {
        super();
        // this.text = text ? text : '...';
        this._tdActionType = TYPE_ACTION.REPLY;
        this.attributes = new Attributes();
        if (attributes){
            this.attributes = attributes;
        }
    }
}

export class ActionRandomReply extends Action {
    text?: string;
    attributes: Attributes;
    constructor(text?: string, attributes?: Attributes) {
        super();
        // this.text = text ? text : '...';
        this._tdActionType = TYPE_ACTION.RANDOM_REPLY;
        this.attributes = new Attributes();
        if (attributes){
            this.attributes = attributes;
        }
    }
}

export class ActionWebRequest extends Action {
    method: string;
    url: string;
    headersString: any;
    jsonBody: string;
    assignTo: string;
    assignments: {}
    constructor(){
        super();
        this.url = '';
        this.headersString = {"Content-Type":"application/json", "Cache-Control":"no-cache", "User-Agent":"TiledeskBotRuntime", "Accept":"*/*"};
        this.jsonBody = JSON.stringify({});
        this.assignTo = '';
        this.assignments = {};
        this.method = TYPE_METHOD_REQUEST.GET;
        this._tdActionType = TYPE_ACTION.WEB_REQUEST;
    }
}

export class ActionReplaceBot extends Action {
    botName: string;
    constructor(){
        super();
        this._tdActionType = TYPE_ACTION.REPLACE_BOT;
    }
}

export class ActionChangeDepartment extends Action {
    depName: string;
    constructor(){
        super();
        this._tdActionType = TYPE_ACTION.CHANGE_DEPARTMENT;
    }
}

export class ActionJsonCondition extends Action {
    trueIntent: string;
    falseIntent: string;
    stopOnConditionMet: boolean;
    groups: Array<Expression | Operator>;
    trueIntentAttributes?: string;
    falseIntentAttributes?: string;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.JSON_CONDITION;
        this.groups = [];
        this.stopOnConditionMet = true;
    }
}

export class Attributes {
    disableInputMessage: boolean;
    commands: Command[];
    constructor(commands?: Command[]) {
        this.disableInputMessage = false;
        this.commands = [];
        if(commands && commands.length>0){
            this.commands = commands;
        }
    }
}
export class Command {
    type: string;
    message?: Message;
    time?: number;
    constructor(type: string) {
        this.type = type;
    }
}

export class ActionIntentConnected extends Action {
    intentName: string;
    json_payload?: Object;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.INTENT;
    }
}

export class ActionEmail extends Action {
    to: string;
    subject: string;
    text: string;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.EMAIL;
    }
}

export class ActionWhatsappAttribute extends Action {
    attributeName: string;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.WHATSAPP_ATTRIBUTE;
    }
}

export class ActionWhatsappStatic extends Action {
    templateName: string;
    payload: WhatsappBroadcast;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.WHATSAPP_STATIC;
    }
}

export class WhatsappBroadcast {
    id_project: string;
    phone_number_id: string;
    template: {
        language: string;
        name: string;
    }
    receiver_list: Array<any>;
}

export class ActionAgent extends Action{
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.AGENT;
    }
}

export class ActionClose extends Action{
    constructor() {
        super()
        this._tdActionType = TYPE_ACTION.CLOSE;
    }
}

export class ActionWait extends Action {
    millis:number = 500
    constructor() {
        super()
        this._tdActionType = TYPE_ACTION.WAIT;
    
    }
}




export class Message {
    text: string;
    type: string;
    // time?: number;
    attributes?: MessageAttributes;
    metadata?: Metadata;
    _tdJSONCondition?: Expression;
    constructor(type: string, text: string, _tdJSONCondition?: Expression) {
        this.type = type;
        this.text = text;
        if(_tdJSONCondition)
            this._tdJSONCondition = _tdJSONCondition
    }
}

export class MessageWithWait extends Message {
    time?: number = 500;
    constructor(type: string, text: string, time: number, _tdJSONCondition?: Expression) {
        super(type,text, _tdJSONCondition);
        this.time = time?time:500;
    }
}

export class MessageAttributes {
    attachment: Attachment;
    constructor() {
        this.attachment = new Attachment();
    }
}

export class Metadata {
    name?: string;
    src: string;
    width?: number | string;
    height?: number | string; 
    type?: string;
    target?: string;
}

export class Attachment {
    type: string;
    buttons?: Button[];
    gallery?: GalleryElement[];
    constructor() {
        this.type = TYPE_ATTACHMENT.TEMPLATE;
        this.buttons = [];
    }
}

export interface Button {
    type: string,
    value: string,
    link?: string,
    target?: string,
    action?: string,
    attributes?: any,
    show_echo?: boolean
}

export interface GalleryElement{
    preview: Metadata;
    title: string;
    description: string;
    buttons: Button[]
}

export class Form {
    cancelCommands?: string[];
    cancelReply?: string;
    id?: number;
    name?: string;
    fields?: Field[];
    description?: string;
    to_JSON() {
        let json = {};
        if (this.cancelCommands) {
            json['cancelCommands'] = this.cancelCommands;
        } else {
            json['cancelCommands'] = []
        }

        if (this.cancelReply) {
            json['cancelReply'] = this.cancelReply;
        } else {
            json['cancelReply'] = ''
        }

        if (this.fields) {
            json['fields'] = JSON.parse(JSON.stringify(this.fields));
        }
        return json;
    }

}

export class Field {
    name: string;
    type: string;
    label: string;
    regex?: string;
    errorLabel?: string;
}


export class Expression {
    type: string = 'expression';
    conditions: Array<Condition | Operator>
    constructor(){
        // this.conditions = [ new Condition()]
        this.conditions = []
    }
}

export class Operator {
    type: string = 'operator'
    operator: "AND" | "OR" = "OR"
}

export class Condition {
    type: string = 'condition';
    operand1: string = ''
    operator: TYPE_OPERATOR;
    operand2: {
        type: "const" | "var",
        value?: string,
        name?: string
    }

}



