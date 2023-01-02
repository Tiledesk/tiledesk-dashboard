import { MetadataOverride } from "@angular/core/testing";


    export class Intent {
        webhook_enabled?: boolean;
        enabled?: boolean;
        topic?: string;
        status?: string;
        id_faq_kb?: string;
        question?: string;
        answer?: string;
        form?: Form;
        actions?:Action[];
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

    export class Action {
        type: string;
        body: any;
    }


    export class ActionReply {
        text?: string;
        //attributes: Attributes;
        commands: Command[];
        constructor(text?: string, commands?: Command[]) {
            this.text = text?text:'';
            this.commands = [];
            if(commands && commands.length >0){
                this.commands = commands;
            }
            // this.attributes = attributes?attributes:new Attributes();
        }
    }

    export class ActionEmail {
        to: string;
        subject: string;
        text: string;
    }

    export class ActionAgent {
        goto: string;
    }



    // export class Attributes {
    //     commands: Command[];
    //     constructor(commands?: Command[]) {
    //         this.commands = [];
    //         if(commands && commands.length >0){
    //             this.commands = commands;
    //         }
    //     }
    // }

    export class Command {
        type: string;
        message?: Message;
        time?: number;
    }

    export class Message {
        text?: string;
        type: string;
        time?: number;
        attributes?: MessageAttributes;
        metadata?: Metadata;
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
        cancelCommands: string[];
        cancelReply: string;
        id: number;
        name: string;
        fields: Field[];
    }

    export class Field {
        name: string;
        type: string;
        label: string;
        regex: string;
        errorLabel: string;
    }
        

