export enum TYPE_INTENT_ELEMENT {
    QUESTION = 'question',
    RESPONSE = 'response', 
    FORM = 'form', 
    ACTION = 'action',
    ANSWER = 'answer'
}

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

export enum TYPE_ACTION {
    REPLY = 'reply', 
    AGENT = 'agent',
    CLOSE = 'close',
    EMAIL = 'email',
    WAIT = 'wait',
    INTENT = 'intent',
    CONDITION = 'condition',
    ASSIGN_VARIABLE = 'assign',
    DELETE_VARIABLE = 'delete',
    REPLACE_BOT = 'replacebot',
    CHANGE_DEPARTMENT = 'department',
    ONLINE_AGENTS = 'ifonlineagents',
    OPEN_HOURS = 'ifopenhours',
    HIDE_MESSSAGE = 'hmessage'
}

export enum TYPE_ATTACHMENT {
    TEMPLATE = "template"
}


export const MESSAGE_METADTA_WIDTH = '100%';
export const MESSAGE_METADTA_HEIGHT = '230px';
export const TIME_WAIT_DEFAULT = 500;
export const TEXT_CHARS_LIMIT = 300;
export const classCardButtonNoClose = 'card-buttons-no-close';



export function calculatingRemainingCharacters(text: string) {
    let numCharsText = text.length;
    let leftCharsText = TEXT_CHARS_LIMIT - numCharsText;
    return leftCharsText;
}

export const ACTIONS_LIST= {
    REPLY : { name: 'Reply', type: TYPE_ACTION.REPLY, src:"assets/cds/images/actions/reply.svg", description: ''},
    AGENT : { name: 'Agent Handoff', type: TYPE_ACTION.AGENT, src:"assets/cds/images/actions/agent_handoff.svg", description: 'This action replaces the current chatbot with an agent.<br><br>The upcoming agent is assigned to the conversation following the department rules'},
    CLOSE : { name: 'Close', type: TYPE_ACTION.CLOSE, src:"assets/cds/images/actions/close.svg", description: 'This action instantly closes the current conversation'},
    EMAIL : { name: 'Send email', type: TYPE_ACTION.EMAIL, src:"assets/cds/images/actions/send_email.svg", description: 'This action send an email to the specified users group or email addresses.<br><br>You can use a comma sepatated addresses list.<br><br>i.e. “andrea@tiledesk.com, gab@tiledesk.com"<br><br>You can use the special tag “@everyone” to send an email to each of the Tiledesk’s project teamates.<br><br>You can also use the name of a single user group using the group name. i.e. “sales”'},
    WAIT : { name: 'Wait', type: TYPE_ACTION.WAIT, src:"assets/cds/images/actions/wait.svg", description: 'This action waits the specified amount of milliseconds before moving to the next one along the intent actions-pipeline'},
    INTENT : { name: 'Connect intent', type: TYPE_ACTION.INTENT, src:"assets/cds/images/actions/connect_intent.svg", description: 'This action moves the flow to the specified intent. <br><br> Keep in mind that if there are other actions in the current intent actions-pipeline they will be executed to, generating a parallel-execution of all the branches affering to each intent triggered through this Connect-intent action.'},
    CONDITION : { name: 'Condition', type: TYPE_ACTION.CONDITION, src:"assets/cds/images/actions/condition.svg"},
    ASSIGN_VARIABLE : { name: 'Assign var', type: TYPE_ACTION.ASSIGN_VARIABLE, src:"assets/cds/images/actions/delete_var.svg"},
    DELETE_VARIABLE : { name: 'Delete var', type: TYPE_ACTION.DELETE_VARIABLE, src:"assets/cds/images/actions/hidden_message.svg"},
    REPLACE_BOT : { name: 'Replace bot', type: TYPE_ACTION.REPLACE_BOT, src:"assets/cds/images/actions/replace_bot.svg"},
    CHANGE_DEPARTMENT : { name: 'Change dept', type: TYPE_ACTION.CHANGE_DEPARTMENT, src:"assets/cds/images/actions/change_department.svg"},
    ONLINE_AGENTS : { name: 'Online Agent', type: TYPE_ACTION.ONLINE_AGENTS, src:"assets/cds/images/actions/online_agents.svg", description: 'This action moves the flow to different intents, based on the agents’ availability.<br>If the are agents available the TRUE intent will be triggered.<br>If the are no agents available the FALSE intent will be triggered.<br>One of the two options can be unset. The flow will optionally stop only when a intent-populated condition is met.<br>To optionally stop the flow set “Stop on met condition”. To always continue unset Stop on met condition.'},
    OPEN_HOURS : { name: 'Operating Hours', type: TYPE_ACTION.OPEN_HOURS, src:"assets/cds/images/actions/open_hours.svg", description: 'This action moves the flow to different intents, based on the operating hours status.<br>During working hours the TRUE intent will be triggered.<br>During offline hours the FALSE intent will be triggered.<br>One of the two options can be unset. The flow will optionally stop only when a intent-populated condition is met.<br>To optionally stop the flow set “Stop on met condition”. To always continue unset the same option.'},
    HIDE_MESSSAGE : { name: 'Hidden message', type: TYPE_ACTION.HIDE_MESSSAGE, src:"assets/cds/images/actions/condition.svg"}
}