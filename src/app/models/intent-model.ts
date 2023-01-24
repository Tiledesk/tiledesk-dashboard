import { TYPE_ACTION } from '../chatbot-design-studio/utils';

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
}

export class ActionCondition extends Action {
    condition: string;
    trueIntent: string;
    falseIntent: string;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.CONDITION;
    }
}

export class ActionAssignVariable extends Action {
    expression: string;
    assignTo: string;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.ASSIGN_VARIABLE;
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
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.ONLINE_AGENGS;
    }
}

export class ActionOpenHours extends Action {
    trueIntent: string;
    falseIntent: string;
    constructor() {
        super();
        this._tdActionType = TYPE_ACTION.OPEN_HOURS;
    }
}

export class ActionReply extends Action {
    text?: string;
    attributes: Attributes;
    constructor(text?: string, attributes?: Attributes) {
        super();
        this.text = text ? text : '...';
        this._tdActionType = TYPE_ACTION.REPLY;
        this.attributes = new Attributes();
        if (attributes){
            this.attributes = attributes;
        }
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
    time?: number = 500;
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

export class ActionWait extends Action{
    millis:number = 500
    constructor() {
        super()
        this._tdActionType = TYPE_ACTION.WAIT;
    
    }
}




export class Message {
    text: string;
    type: string;
    time?: number;
    attributes?: MessageAttributes;
    metadata?: Metadata;
    constructor(type: string, text: string) {
        this.type = type;
        this.text = text;
    }
}



export class MessageAttributes {
    attachment: Attachment;
}

export class Metadata {
    name?: string;
    src: string;
    width?: string;
    height?: string;
    type?: string;
}

export class Attachment {
    type: string;
    buttons: Button[];
}

export interface Button {
    type: string,
    value: string,
    link?: string,
    target?: string,
    action?: string,
    show_echo?: boolean
}

export class Form {
    cancelCommands?: string[];
    cancelReply?: string;
    id?: number;
    name?: string;
    fields?: Field[];

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




