import { AbstractControl } from "@angular/forms";
import { ActionAssignVariable, Intent } from "app/models/intent-model";

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
    RANDOM_REPLY = 'randomreply',
    WEB_REQUEST = 'webrequest',
    AGENT = 'agent',
    CLOSE = 'close',
    EMAIL = 'email',
    WAIT = 'wait',
    INTENT = 'intent',
    // CONDITION = 'condition',
    ASSIGN_VARIABLE = 'setattribute',
    DELETE_VARIABLE = 'delete',
    REPLACE_BOT = 'replacebot',
    CHANGE_DEPARTMENT = 'department',
    ONLINE_AGENTS = 'ifonlineagents',
    OPEN_HOURS = 'ifopenhours',
    HIDE_MESSSAGE = 'hmessage',
    JSON_CONDITION = 'jsoncondition'
}

export enum TYPE_OPERATOR {
    equalAsNumbers = "equalAsNumbers",
    equalAsStrings = "equalAsStrings",
    notEqualAsNumbers = "notEqualAsNumbers",
    notEqualAsStrings = "notEqualAsStrings",
    greaterThan = "greaterThan",
    greaterThanOrEqual = "greaterThanOrEqual",
    lessThan = "lessThan",
    lessThanOrEqual = "lessThanOrEqual",
    AND = "AND",
    OR = "OR",
    startsWith = "startsWith",
    startsWithIgnoreCase = "startsWithIgnoreCase",
    contains = "contains",
    containsIgnoreCase = "containsIgnoreCase",
    endsWith = "endsWith",
    isEmpty = "isEmpty",
    matches = "matches"
}

export enum TYPE_ATTACHMENT {
    TEMPLATE = "template"
}

export enum TYPE_METHOD_REQUEST {
    GET = 'GET', 
    POST = 'POST', 
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE', 
    COPY = 'COPY', 
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS',
    LINK = 'LINK', 
    UNLINK = 'UNLINK', 
    PURGE = 'PURGE',
    LOCK = 'LOCK',
    UNLOCK = 'UNLOCK', 
    PROPFIND = 'PROPFIND', 
    VIEW = 'VIEW'
}



export const MESSAGE_METADTA_WIDTH = '100%';
export const MESSAGE_METADTA_HEIGHT = 230;
export const TIME_WAIT_DEFAULT = 500;
export const TEXT_CHARS_LIMIT = 1024;
export const classCardButtonNoClose = 'card-buttons-no-close';



export function calculatingRemainingCharacters(text: string, limit: number): number {
    if (text) {
        let numCharsText = text.length;
        let leftCharsText = limit - numCharsText;
        return leftCharsText;
    } else {
        return limit
    }
}

export const ACTIONS_LIST= {
    REPLY : { name: 'Reply', type: TYPE_ACTION.REPLY, src:"assets/cds/images/actions/reply.svg", description: ''},
    RANDOM_REPLY : { name: 'Random Reply', type: TYPE_ACTION.RANDOM_REPLY, src:"assets/cds/images/actions/random_reply.svg", description: 'Create some replies that will be randomly selected'},
    WEB_REQUEST : { name: 'Web Request', type: TYPE_ACTION.WEB_REQUEST, src:"assets/cds/images/actions/web_request.svg", description: ''},
    AGENT : { name: 'Agent Handoff', type: TYPE_ACTION.AGENT, src:"assets/cds/images/actions/agent_handoff.svg", description: 'This action replaces the current chatbot with an agent.<br>The upcoming agent is assigned to the conversation following the department rules'},
    CLOSE : { name: 'Close', type: TYPE_ACTION.CLOSE, src:"assets/cds/images/actions/close.svg", description: 'This action instantly closes the current conversation'},
    EMAIL : { name: 'Send email', type: TYPE_ACTION.EMAIL, src:"assets/cds/images/actions/send_email.svg", description: 'This action send an email to the specified users group or email addresses.<br>You can use a comma sepatated addresses list.<br>i.e. “andrea@tiledesk.com, gab@tiledesk.com"<br>You can use the special tag “@everyone” to send an email to each of the Tiledesk’s project teamates.<br><br>You can also use the name of a single user group using the group name. i.e. “sales”'},
    WAIT : { name: 'Wait', type: TYPE_ACTION.WAIT, src:"assets/cds/images/actions/wait.svg", description: 'This action waits the specified amount of milliseconds before moving to the next one along the block actions-pipeline'},
    INTENT : { name: 'Connect block', type: TYPE_ACTION.INTENT, src:"assets/cds/images/actions/connect_intent.svg", description: 'This action moves the flow to the specified block.<br> Keep in mind that if there are other actions in the current block actions-pipeline they will be executed too, generating a parallel-execution of all the branches affering to each block triggered through this Connect-block action.'},
    // CONDITION : { name: 'Condition', type: TYPE_ACTION.CONDITION, src:"assets/cds/images/actions/condition.svg"},
    ASSIGN_VARIABLE: { name: 'Set attribute', type: TYPE_ACTION.ASSIGN_VARIABLE, src: "assets/cds/images/actions/assign_var.svg" },
    DELETE_VARIABLE: { name: 'Delete attribute', type: TYPE_ACTION.DELETE_VARIABLE, src: "assets/cds/images/actions/delete_var.svg" },
    REPLACE_BOT: { name: 'Replace bot', type: TYPE_ACTION.REPLACE_BOT, src: "assets/cds/images/actions/replace_bot.svg", description: "Choose a chatbot to replace the current one in the conversation" },
    CHANGE_DEPARTMENT: { name: 'Change dept', type: TYPE_ACTION.CHANGE_DEPARTMENT, src: "assets/cds/images/actions/change_department.svg" },
    ONLINE_AGENTS: { name: 'If Online Agent', type: TYPE_ACTION.ONLINE_AGENTS, src: "assets/cds/images/actions/online_agents.svg", description: 'This action moves the flow to different blocks, based on the agents’ availability.<br>If the are agents available the TRUE block will be triggered.<br>If the are no agents available the FALSE block will be triggered.<br>One of the two options can be unset. The flow will optionally stop only when a block-populated condition is met.<br>To optionally stop the flow set “Stop on met condition”. To always continue unset Stop on met condition.' },
    OPEN_HOURS: { name: 'Operating Hours', type: TYPE_ACTION.OPEN_HOURS, src: "assets/cds/images/actions/open_hours.svg", description: 'This action moves the flow to different blocks, based on the operating hours status.<br>During working hours the TRUE block will be triggered.<br>During offline hours the FALSE block will be triggered.<br>One of the two options can be unset. The flow will optionally stop only when a block-populated condition is met.<br>To optionally stop the flow set “Stop on met condition”. To always continue unset the same option.' },
    HIDE_MESSSAGE: { name: 'Hidden message', type: TYPE_ACTION.HIDE_MESSSAGE, src: "assets/cds/images/actions/hidden_message.svg" },
    JSON_CONDITION: { name: 'Condition', type: TYPE_ACTION.JSON_CONDITION, src: "assets/cds/images/actions/condition.svg" }
}


export const OPERATORS_LIST: { [key: string]: { name: string, type: TYPE_OPERATOR, src?: string } } = {
    "equalAsNumbers": { name: "equal As Numbers", type: TYPE_OPERATOR.equalAsNumbers, src: "assets/cds/images/operators/equal.svg" },
    "equalAsStrings": { name: "equal As Strings", type: TYPE_OPERATOR.equalAsStrings, src: "assets/cds/images/operators/equal.svg" },
    "notEqualAsNumbers": { name: "not Equal As Numbers", type: TYPE_OPERATOR.notEqualAsNumbers, src: "assets/cds/images/operators/not-equal.svg" },
    "notEqualAsStrings": { name: "not Equal As Strings", type: TYPE_OPERATOR.notEqualAsStrings, src: "assets/cds/images/operators/not-equal.svg" },
    "greaterThan": { name: "greater Than", type: TYPE_OPERATOR.greaterThan, src: "assets/cds/images/operators/grather.svg" },
    "greaterThanOrEqual": { name: "greater Than Or Equal", type: TYPE_OPERATOR.greaterThanOrEqual, src: "assets/cds/images/operators/gratherEqual.svg" },
    "lessThan": { name: "less Than", type: TYPE_OPERATOR.lessThan, src: "assets/cds/images/operators/less.svg" },
    "lessThanOrEqual": { name: "less Than Or Equal", type: TYPE_OPERATOR.lessThanOrEqual, src: "assets/cds/images/operators/lessEqual.svg" },
    "AND": { name: "AND", type: TYPE_OPERATOR.AND },
    "OR": { name: "OR", type: TYPE_OPERATOR.OR },
    "startsWith": { name: "starts With", type: TYPE_OPERATOR.startsWith },
    "startsWithIgnoreCase": { name: "starts With Ignore Case", type: TYPE_OPERATOR.startsWithIgnoreCase },
    "endsWith": { name: "ends With", type: TYPE_OPERATOR.endsWith },
    "contains": { name: "contains", type: TYPE_OPERATOR.contains },
    "containsIgnoreCase": { name: "contains Ignore Case", type: TYPE_OPERATOR.containsIgnoreCase },
    "isEmpty": { name: "is Empty", type: TYPE_OPERATOR.isEmpty },
    "matches": { name: "matches", type: TYPE_OPERATOR.matches }
}


export function OperatorValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value in TYPE_OPERATOR) {
        return null;
    }
    return { invalidType: true };
}

export function getEmbedUrl(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
        ? 'https://www.youtube.com/embed/' + match[2]
        : url;
}

export var variableList = {
    userDefined: [],
    systemDefined: [
        { name: 'Department ID', value: 'department_id', src: '', icon: 'domain' },
        { name: 'Department name', value: 'department_name', src: '', icon: 'domain' },
        { name: 'Project ID', value: 'project_id', src: '', icon: 'domain' },
        { name: 'Last message ID', value: 'last_message_id', src: '', icon: 'textsms' },
        { name: 'Conversation ID', value: 'conversation_id', src: '', icon: 'textsms' },
        { name: 'Last user text', value: 'last_user_text', src: '', icon: 'send' },
        { name: 'Chatbot Name', value: 'chatbot_name', src: '', icon: 'person' },
        { name: 'User ID', value: 'user_id', src: '', icon: 'person' },
        { name: 'User agent', value: 'user_agent', src: '', icon: 'person' },
        { name: 'Source', value: 'user_source_page', src: '', icon: 'language' },
        { name: 'Language', value: 'user_language', src: '', icon: 'language' },
        { name: 'URL', value: 'chat_url', src: '', icon: 'laptop' },
        { name: 'IP', value: 'user_ip_address', src: '', icon: 'laptop' },
        { name: 'Country', value: 'user_country', src: '', icon: 'language' },
        { name: 'City', value: 'user_city', src: '', icon: 'language' },

    ]
}

export function retriveListOfVariables(intents: Array<Intent>) {
    variableList.userDefined = []
    intents.forEach(intent => {
        intent.actions.filter(action => action._tdActionType === TYPE_ACTION.ASSIGN_VARIABLE).forEach(((actionAssignVariable: ActionAssignVariable) => {
            if(!actionAssignVariable.hasOwnProperty('assignTo')) return; 
            if(actionAssignVariable.assignTo === null || actionAssignVariable.assignTo === '') return;
            if(variableList.userDefined.some(el => el.value === actionAssignVariable.assignTo)) return;
            if(variableList.systemDefined.some(el => el.value === actionAssignVariable.assignTo)) return;
            variableList.userDefined.push({ name: actionAssignVariable.assignTo, value: actionAssignVariable.assignTo })
        }))
    })
}