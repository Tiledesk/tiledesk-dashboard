
    export interface Intent {
        webhook_enabled: boolean;
        enabled: boolean;
        topic: string;
        status: string;
        _id: string;
        id_faq_kb: string;
        question: string;
        questions: string[];
        answer: string;
        answers: Answer[];
        id_project: string;
        language: string;
        intent_display_name: string;
        createdBy: string;
        intent_id: string;
        createdAt: Date;
        updatedAt: Date;
        __v: number;
        form: Form;
        id: string;
    }
    
    export interface Answer {
        messages: string[];
        time: number;
        buttons: Button[];
    }

    


    export interface Field {
        name: string;
        type: string;
        label: string;
        regex: string;
        errorLabel: string;
    }

    export interface Form {
        cancelCommands: string[];
        cancelReply: string;
        id: number;
        name: string;
        fields: Field[];
    }

    


    export interface Intent {
        webhook_enabled: boolean;
        enabled: boolean;
        topic: string;
        status: string;
        _id: string;
        id_faq_kb: string;
        question: string;
        answer: string;
        reply: Reply;
        id_project: string;
        language: string;
        intent_display_name: string;
        createdBy: string;
        intent_id: string;
        createdAt: Date;
        updatedAt: Date;
        __v: number;
        id: string;
    }

    export interface Reply {
        text: string;
        attributes: Attributes;
    }

    export interface Attributes {
        commands: Command[];
    }

    export interface Command {
        type: string;
        message: Message;
        time?: number;
    }

    export interface Message {
        text: string;
        type: string;
        time?: number;
        attributes?: MessageAttributes;
    }

    export interface MessageAttributes {
        attachment: Attachment;
    }

    export interface Attachment {
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
        
