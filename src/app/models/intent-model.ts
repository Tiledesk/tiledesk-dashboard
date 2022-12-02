
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
        delay: number;
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

    


    
    
    
    
    
    
    
    
    // export interface Intent {
    //     text: string;
    //     attributes: {
    //         commands: Command[];
    //     };
    // }

    // export interface Command {
    //     type?: string;
    //     message?: {
    //         text: string;
    //         type?: string;
    //         attributes?: Attributes;
    //         metadata?: Metadata;
    //     };
    //     time?: number;
    //     waitTime?: number;
    // }

    // export interface Button {
    //     type: string;
    //     value: string;
    //     link: string;
    //     target: string;
    // }
    
    // export interface Metadata {
    //     src: string;
    //     width?: number;
    //     height?: number;
    // }

    // export interface Attributes {
    //     disableInputMessage?: boolean;
    //     inputMessagePlaceholder?: string;
    //     updateUserFullname?: string;
    //     updateUserEmail?: string;
    //     subtype?: string;
    //     action?: string;
    //     attachment?: {
    //         type: string;
    //         buttons: Button[];
    //     }
    // }


    // // CUSTOM MODEL //
    // /** Class added after Json load */
    // export interface Message {
    //     text?: string;
    //     waitTime?: number;
    //     attributes?: Attributes;
    //     metadata?: Metadata;
    //     buttons?: Button[];
    // }
