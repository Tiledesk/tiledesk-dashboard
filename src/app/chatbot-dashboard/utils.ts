export enum TYPE_RESPONSE {
    TEXT = 'text', 
    RANDOM_TEXT = 'randomText', 
    IMAGE = 'image', 
    FORM = 'form', 
    VIDEO = 'video'
}

export enum TYPE_BUTTON {
    TEXT = 'text', 
    URL = 'url', 
    ACTION = 'action'
}

export enum TYPE_URL {
    BLANK = 'blank', 
    PARENT = 'parent', 
    SELF = 'self'
}

export enum TYPE_COMMAND {
    WAIT = 'wait', 
    MESSAGE = 'message',
}

export enum TYPE_MESSAGE {
    TEXT = 'text', 
    IMAGE = 'image',
    FRAME = 'frame'
}

export const MESSAGE_METADTA_WIDTH = '100%';
export const MESSAGE_METADTA_HEIGHT = '230px';

export const TIME_WAIT_DEFAULT = 500;
export const TEXT_CHARS_LIMIT = 300;
export const classCardButtonNoClose = 'card-buttons-no-close';
