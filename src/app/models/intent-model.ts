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
    // reply?: Reply;
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
        //this.reply = new Reply();
    }

}

// export interface iIntent {
//     webhook_enabled?: boolean;
//     enabled?: boolean;
//     topic?: string;
//     status?: string;
//     id_faq_kb?: string;
//     question?: string;
//     answer?: string;
//     // form?: Form;
//     // actions?: Action[];
//     // reply?: Reply;
//     id_project?: string;
//     language?: string;
//     intent_display_name?: string;
//     createdBy?: string;
//     intent_id?: string;
//     createdAt?: Date;
//     updatedAt?: Date;
//     id?: string;
// }

// export class Question {
//     split(arg0: string) {
//       throw new Error('Method not implemented.');
//     }
//     type: string;
// }

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
    commands: Command[];
    constructor(commands?: Command[]) {
        this.commands = [];
        if(commands && commands.length>0){
            this.commands = commands;
        }
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


export class Command {
    type: string;
    message?: Message;
    time?: number;
    constructor(type: string) {
        this.type = type;
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




