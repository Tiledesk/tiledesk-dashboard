    export interface Intent {
        text: string;
        attributes: {
            commands: Command[];
        };
    }

    export interface Command {
        type?: string;
        message?: {
            text: string;
            type?: string;
            attributes?: Attributes;
            metadata?: Metadata;
        };
        time?: number;
        waitTime?: number;
    }

    export interface Button {
        type: string;
        value: string;
        link: string;
        target: string;
    }
    
    export interface Metadata {
        src: string;
        width?: number;
        height?: number;
    }

    export interface Attributes {
        disableInputMessage?: boolean;
        inputMessagePlaceholder?: string;
        updateUserFullname?: string;
        updateUserEmail?: string;
        subtype?: string;
        action?: string;
        attachment?: {
            type: string;
            buttons: Button[];
        }
    }


    // CUSTOM MODEL //
    /** Class added after Json load */
    export interface Message {
        text?: string;
        waitTime?: number;
        attributes?: Attributes;
        metadata?: Metadata;
        buttons?: Button[];
    }
