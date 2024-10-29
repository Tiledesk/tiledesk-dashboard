import { AbstractControl } from "@angular/forms";
import { ActionAssignVariable, Intent } from "app/models/intent-model";
import { v4 as uuidv4 } from 'uuid';

export enum EXTERNAL_URL {
    getchatbotinfo = "https://tiledesk.com/community/getchatbotinfo/chatbotId/"
}


export enum TYPE_MATH_OPERATOR {
    addAsNumber = "addAsNumber",
    addAsString = "addAsString",
    subtractAsNumber = "subtractAsNumber",
    multiplyAsNumber = "multiplyAsNumber",
    divideAsNumber = "divideAsNumber"
}

export enum TYPE_FUNCTION_VAR {
    upperCaseAsString = "upperCaseAsString",
    lowerCaseAsString = "lowerCaseAsString",
    capitalizeAsString = "capitalizeAsString",
    absAsNumber = "absAsNumber",
    ceilAsNumber = "ceilAsNumber",
    floorAsNumber = "floorAsNumber",
    roundAsNumber = "roundAsNumber"
}

export enum TYPE_FUNCTION_FUNC {
    isOpenNowAsStrings = "openNow",
    availableAgentsAsStrings = "availableAgents"
}


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
    FRAME = 'frame',
    GALLERY = 'gallery',
    REDIRECT = 'redirect'
}

export enum TYPE_ACTION {
    REPLY = 'reply',
    RANDOM_REPLY = 'randomreply',
    WEB_REQUEST = 'webrequest',
    AGENT = 'agent',
    CLOSE = 'close',
    EMAIL = 'email',
    WHATSAPP_STATIC = 'whatsapp_static',
    WHATSAPP_ATTRIBUTE = 'whatsapp_attribute',
    WHATSAPP_SEGMENT = 'whatsapp_segment',
    WAIT = 'wait',
    INTENT = 'intent',
    // CONDITION = 'condition',
    ASSIGN_VARIABLE = 'setattribute',
    ASSIGN_FUNCTION = 'setfunction',
    DELETE_VARIABLE = 'delete',
    REPLACE_BOT = 'replacebot',
    CHANGE_DEPARTMENT = 'department',
    ONLINE_AGENTS = 'ifonlineagents',
    OPEN_HOURS = 'ifopenhours',
    HIDE_MESSSAGE = 'hmessage',
    JSON_CONDITION = 'jsoncondition'
}

// export enum TYPE_TD_ACTION_ID {
//     UUIDV4 = uuidv4()
// }

export enum TYPE_OPERATOR {
    equalAsNumbers = "equalAsNumbers",
    equalAsStrings = "equalAsStrings",
    notEqualAsNumbers = "notEqualAsNumbers",
    notEqualAsStrings = "notEqualAsStrings",
    greaterThan = "greaterThan",
    greaterThanOrEqual = "greaterThanOrEqual",
    lessThan = "lessThan",
    lessThanOrEqual = "lessThanOrEqual",
    startsWith = "startsWith",
    notStartsWith = 'notStartsWith',
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

export enum TYPE_METHOD_ATTRIBUTE {
    TEXT = 'text',
    INPUT = 'input'
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

export const ELEMENTS_LIST = [
    { name: 'Reply', type: TYPE_ACTION.REPLY, src:"assets/cds/images/actions/reply.svg", description: '<b>Pro tip</b>: Turn this block into a programmed proactive message. <a href=https://www.youtube.com/embed/SgDGwvVoqWE target=_blank>Here is how!</a> '},
    { name: 'Random Reply', type: TYPE_ACTION.RANDOM_REPLY, src:"assets/cds/images/actions/random_reply.svg", description: 'Create some replies that will be randomly selected'},
    { name: 'Web Request', type: TYPE_ACTION.WEB_REQUEST, src:"assets/cds/images/actions/web_request.svg", description: ''},
    { name: 'Agent Handoff', type: TYPE_ACTION.AGENT, src:"assets/cds/images/actions/agent_handoff.svg", description: 'This action replaces the current chatbot with an agent.<br>The upcoming agent is assigned to the conversation following the department rules'},
    { name: 'Close', type: TYPE_ACTION.CLOSE, src:"assets/cds/images/actions/close.svg", description: 'This action instantly closes the current conversation'},
    { name: 'Send email', type: TYPE_ACTION.EMAIL, src:"assets/cds/images/actions/send_email.svg", description: 'This action send an email to the specified users group or email addresses.<br>You can use a comma sepatated addresses list.<br>i.e. user1@tiledesk.com, user2@tiledesk.com"<br>You can use the special tag “@everyone” to send an email to each of the Tiledesk’s project teamates.<br><br>You can also use the name of a single user group using the group name. i.e. “sales”'},
    { name: 'WhatsApp Static', type: TYPE_ACTION.WHATSAPP_STATIC, src: "assets/cds/images/actions/whatsapp.svg", description: 'This action send an approved WhatsApp template' },
    { name: 'WhatsApp by Attribute', type: TYPE_ACTION.WHATSAPP_ATTRIBUTE, src: "assets/cds/images/actions/whatsapp.svg", description: 'This action send an approved WhatsApp template' },
    { name: 'WhatsApp by Segment', type: TYPE_ACTION.WHATSAPP_SEGMENT, src: "assets/cds/images/actions/whatsapp.svg", description: 'This action send an approved WhatsApp template' },
    { name: 'Wait', type: TYPE_ACTION.WAIT, src:"assets/cds/images/actions/wait.svg", description: 'This action waits the specified amount of milliseconds before moving to the next one along the block actions-pipeline'},
    { name: 'Connect block', type: TYPE_ACTION.INTENT, src:"assets/cds/images/actions/connect_intent.svg", description: 'This action moves the flow to the specified block.<br> Keep in mind that if there are other actions in the current block actions-pipeline they will be executed too, generating a parallel-execution of all the branches affering to each block triggered through this Connect-block action.'},
    { name: 'Set attribute', type: TYPE_ACTION.ASSIGN_VARIABLE, src: "assets/cds/images/actions/assign_var.svg"},
    { name: 'Set function', type: TYPE_ACTION.ASSIGN_FUNCTION, src: "assets/cds/images/actions/assign_var.svg"},
    { name: 'Delete attribute', type: TYPE_ACTION.DELETE_VARIABLE, src: "assets/cds/images/actions/delete_var.svg"},
    { name: 'Replace bot', type: TYPE_ACTION.REPLACE_BOT, src: "assets/cds/images/actions/replace_bot.svg", description: "Choose a chatbot to replace the current one in the conversation"},
    { name: 'Change dept', type: TYPE_ACTION.CHANGE_DEPARTMENT, src: "assets/cds/images/actions/change_department.svg"},
    { name: 'If Online Agent', type: TYPE_ACTION.ONLINE_AGENTS, src: "assets/cds/images/actions/online_agents.svg", description: 'This action moves the flow to different blocks, based on the agents’ availability.<br>If there are agents available the <b>TRUE block</b> will be triggered.<br>If there are no agents available the <b>FALSE block</b> will be triggered.<br>One of the two options can be unset. The flow will optionally stop only when a block-populated condition is met.<br>To optionally stop the flow set “Stop on met condition”. To always continue unset Stop on met condition.' },
    { name: 'If Operating Hours', type: TYPE_ACTION.OPEN_HOURS, src: "assets/cds/images/actions/open_hours.svg", description: 'This action moves the flow to different blocks, based on the operating hours status.<br>During working hours the <b>TRUE block</b> will be triggered.<br>During offline hours the <b>FALSE block</b> will be triggered.<br>One of the two options can be unset. The flow will optionally stop only when a block-populated condition is met.<br>To optionally stop the flow set “Stop on met condition”. To always continue unset the same option.'},
    { name: 'Hidden message', type: TYPE_ACTION.HIDE_MESSSAGE, src: "assets/cds/images/actions/hidden_message.svg"},
    { name: 'Condition', type: TYPE_ACTION.JSON_CONDITION, src: "assets/cds/images/actions/condition.svg"},
    { name: 'Form', type: TYPE_INTENT_ELEMENT.FORM, src: "assets/cds/images/form.svg", description: "Add a Form to ask user data"},
    { name: 'Answer', type: TYPE_INTENT_ELEMENT.ANSWER, src: "assets/cds/images/form.svg", description: "Add an Answer"},
    { name: 'Question', type: TYPE_INTENT_ELEMENT.QUESTION, src: "assets/cds/images/form.svg", description: "Add a Question"},
]


export const ACTIONS_LIST= {
    REPLY : { name: 'Reply', type: TYPE_ACTION.REPLY, src:"assets/cds/images/actions/reply.svg", description: '<b>Pro tip</b>: Turn this block into a programmed proactive message. <a href=https://www.youtube.com/embed/SgDGwvVoqWE target=_blank>Here is how!</a> '},
    RANDOM_REPLY : { name: 'Random Reply', type: TYPE_ACTION.RANDOM_REPLY, src:"assets/cds/images/actions/random_reply.svg", description: 'Create some replies that will be randomly selected'},
    WEB_REQUEST : { name: 'Web Request', type: TYPE_ACTION.WEB_REQUEST, src:"assets/cds/images/actions/web_request.svg", description: ''},
    AGENT : { name: 'Agent Handoff', type: TYPE_ACTION.AGENT, src:"assets/cds/images/actions/agent_handoff.svg", description: 'This action replaces the current chatbot with an agent.<br>The upcoming agent is assigned to the conversation following the department rules'},
    CLOSE : { name: 'Close', type: TYPE_ACTION.CLOSE, src:"assets/cds/images/actions/close.svg", description: 'This action instantly closes the current conversation'},
    EMAIL : { name: 'Send email', type: TYPE_ACTION.EMAIL, src:"assets/cds/images/actions/send_email.svg", description: 'This action send an email to the specified users group or email addresses.<br>You can use a comma sepatated addresses list.<br>i.e. “andrea@tiledesk.com, gab@tiledesk.com"<br>You can use the special tag “@everyone” to send an email to each of the Tiledesk’s project teamates.<br><br>You can also use the name of a single user group using the group name. i.e. “sales”'},
    WHATSAPP_STATIC: { name: 'WhatsApp Static', type: TYPE_ACTION.WHATSAPP_STATIC, src: "assets/cds/images/actions/whatsapp.svg", description: 'This action send an approved WhatsApp template' },
    WHATSAPP_ATTRIBUTE: { name: 'WhatsApp by Attribute', type: TYPE_ACTION.WHATSAPP_ATTRIBUTE, src: "assets/cds/images/actions/whatsapp.svg", description: 'This action send an approved WhatsApp template' },
    WHATSAPP_SEGMENT: { name: 'WhatsApp by Segment', type: TYPE_ACTION.WHATSAPP_SEGMENT, src: "assets/cds/images/actions/whatsapp.svg", description: 'This action send an approved WhatsApp template' },
    WAIT : { name: 'Wait', type: TYPE_ACTION.WAIT, src:"assets/cds/images/actions/wait.svg", description: 'This action waits the specified amount of milliseconds before moving to the next one along the block actions-pipeline'},
    INTENT : { name: 'Connect block', type: TYPE_ACTION.INTENT, src:"assets/cds/images/actions/connect_intent.svg", description: 'This action moves the flow to the specified block.<br> Keep in mind that if there are other actions in the current block actions-pipeline they will be executed too, generating a parallel-execution of all the branches affering to each block triggered through this Connect-block action.'},
    // CONDITION : { name: 'Condition', type: TYPE_ACTION.CONDITION, src:"assets/cds/images/actions/condition.svg"},
    ASSIGN_VARIABLE: { name: 'Set attribute', type: TYPE_ACTION.ASSIGN_VARIABLE, src: "assets/cds/images/actions/assign_var.svg" },
    ASSIGN_FUNCTION: { name: 'Set function', type: TYPE_ACTION.ASSIGN_FUNCTION, src: "assets/cds/images/actions/assign_var.svg" },
    DELETE_VARIABLE: { name: 'Delete attribute', type: TYPE_ACTION.DELETE_VARIABLE, src: "assets/cds/images/actions/delete_var.svg" },
    REPLACE_BOT: { name: 'Replace bot', type: TYPE_ACTION.REPLACE_BOT, src: "assets/cds/images/actions/replace_bot.svg", description: "Choose a chatbot to replace the current one in the conversation" },
    CHANGE_DEPARTMENT: { name: 'Change dept', type: TYPE_ACTION.CHANGE_DEPARTMENT, src: "assets/cds/images/actions/change_department.svg" },
    ONLINE_AGENTS: { name: 'If Online Agent', type: TYPE_ACTION.ONLINE_AGENTS, src: "assets/cds/images/actions/online_agents.svg", description: 'This action moves the flow to different blocks, based on the agents’ availability.<br>If there are agents available the <b>TRUE block</b> will be triggered.<br>If there are no agents available the <b>FALSE block</b> will be triggered.<br>One of the two options can be unset. The flow will optionally stop only when a block-populated condition is met.<br>To optionally stop the flow set “Stop on met condition”. To always continue unset Stop on met condition.' },
    OPEN_HOURS: { name: 'If Operating Hours', type: TYPE_ACTION.OPEN_HOURS, src: "assets/cds/images/actions/open_hours.svg", description: 'This action moves the flow to different blocks, based on the operating hours status.<br>During working hours the <b>TRUE block</b> will be triggered.<br>During offline hours the <b>FALSE block</b> will be triggered.<br>One of the two options can be unset. The flow will optionally stop only when a block-populated condition is met.<br>To optionally stop the flow set “Stop on met condition”. To always continue unset the same option.' },
    HIDE_MESSSAGE: { name: 'Hidden message', type: TYPE_ACTION.HIDE_MESSSAGE, src: "assets/cds/images/actions/hidden_message.svg" },
    JSON_CONDITION: { name: 'Condition', type: TYPE_ACTION.JSON_CONDITION, src: "assets/cds/images/actions/condition.svg" }
}


export const OPERATORS_LIST: { [key: string]: { name: string, type: TYPE_OPERATOR, src?: string } } = {
    "equalAsNumbers": { name: "equal As Numbers", type: TYPE_OPERATOR.equalAsNumbers, src: "assets/cds/images/operators/equal.svg" },
    "equalAsStrings": { name: "equal As Text", type: TYPE_OPERATOR.equalAsStrings, src: "assets/cds/images/operators/equal.svg" },
    "notEqualAsNumbers": { name: "not Equal As Numbers", type: TYPE_OPERATOR.notEqualAsNumbers, src: "assets/cds/images/operators/not-equal.svg" },
    "notEqualAsStrings": { name: "not Equal As Text", type: TYPE_OPERATOR.notEqualAsStrings, src: "assets/cds/images/operators/not-equal.svg" },
    "greaterThan": { name: "greater Than", type: TYPE_OPERATOR.greaterThan, src: "assets/cds/images/operators/grather.svg" },
    "greaterThanOrEqual": { name: "greater Than Or Equal", type: TYPE_OPERATOR.greaterThanOrEqual, src: "assets/cds/images/operators/gratherEqual.svg" },
    "lessThan": { name: "less Than", type: TYPE_OPERATOR.lessThan, src: "assets/cds/images/operators/less.svg" },
    "lessThanOrEqual": { name: "less Than Or Equal", type: TYPE_OPERATOR.lessThanOrEqual, src: "assets/cds/images/operators/lessEqual.svg" },
    "startsWith": { name: "starts With", type: TYPE_OPERATOR.startsWith },
    "notStartsWith": { name: "not starts With", type: TYPE_OPERATOR.notStartsWith },
    "startsWithIgnoreCase": { name: "starts With Ignore Case", type: TYPE_OPERATOR.startsWithIgnoreCase },
    "endsWith": { name: "ends With", type: TYPE_OPERATOR.endsWith },
    "contains": { name: "contains", type: TYPE_OPERATOR.contains },
    "containsIgnoreCase": { name: "contains Ignore Case", type: TYPE_OPERATOR.containsIgnoreCase },
    "isEmpty": { name: "is Empty", type: TYPE_OPERATOR.isEmpty },
    "matches": { name: "matches", type: TYPE_OPERATOR.matches }
}

export const TYPE_MATH_OPERATOR_LIST: { [key: string]: { name: string, type: TYPE_MATH_OPERATOR, src?: string } } = {
    "addAsNumbers": { name: "Add as numbers", type: TYPE_MATH_OPERATOR.addAsNumber, src: "assets/cds/images/operators/add.svg" },
    "addAsStrings": { name: "Add as text", type: TYPE_MATH_OPERATOR.addAsString, src: "assets/cds/images/operators/add.svg" },
    "substractAsNumbers": { name: "Substract", type: TYPE_MATH_OPERATOR.subtractAsNumber, src: "assets/cds/images/operators/substract.svg" },
    "multiplyAsNumbers": { name: "Multiply", type: TYPE_MATH_OPERATOR.multiplyAsNumber, src: "assets/cds/images/operators/multiply.svg" },
    "divideAsNumbers": { name: "Divide", type: TYPE_MATH_OPERATOR.divideAsNumber, src: "assets/cds/images/operators/divide.svg" },
}

export const TYPE_FUNCTION_LIST_FOR_VARIABLES: { [key: string]: { name: string, type: TYPE_FUNCTION_VAR, src?: string } } = {
    "upperCaseAsStrings": { name: "Upper case", type: TYPE_FUNCTION_VAR.upperCaseAsString, src: "assets/cds/images/operators/upperCase.svg" },
    "lowerCaseAsStrings": { name: "Lower case", type: TYPE_FUNCTION_VAR.lowerCaseAsString, src: "assets/cds/images/operators/lowerCase.svg" },
    "capitalizeAsStrings": { name: "Capitalize", type: TYPE_FUNCTION_VAR.capitalizeAsString, src: "assets/cds/images/operators/capitalize.svg" },
    "absAsNumbers": { name: "Absolute value", type: TYPE_FUNCTION_VAR.absAsNumber, src: "assets/cds/images/operators/abs.svg" },
    "roundAsNumbers": { name: "Round", type: TYPE_FUNCTION_VAR.roundAsNumber, src: "assets/cds/images/operators/round.svg" },
    "floorAsNumbers": { name: "Floor", type: TYPE_FUNCTION_VAR.floorAsNumber, src: "assets/cds/images/operators/floor.svg" },
    "ceilAsNumbers": { name: "Ceil", type: TYPE_FUNCTION_VAR.ceilAsNumber, src: "assets/cds/images/operators/ceil.svg" },
}
export const TYPE_FUNCTION_LIST_FOR_FUNCTIONS: { [key: string]: { name: string, type: TYPE_FUNCTION_FUNC, src?: string } } = {
    "isOpenNowAsStrings": { name: "Is open now", type: TYPE_FUNCTION_FUNC.isOpenNowAsStrings, src: "" },
    "availableAgentAsStrings": { name: "Available agents?", type: TYPE_FUNCTION_FUNC.availableAgentsAsStrings, src: "" },
}

export const CERTIFIED_TAGS: Array<{color: string, name: string}> = [
    { "color": "#a16300", "name": "Lead-Gen" },
    { "color": "#25833e", "name": "Support" }, 
    // { "color": "#00699e", "name": "Pre-Sale" }, 
    // { "color": "#0049bd", "name": "Self-serve" }, 
]


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
        { name: 'department_id', value: 'department_id', src: '', icon: 'domain' },
        { name: 'department_name', value: 'department_name', src: '', icon: 'domain' },
        { name: 'project_id', value: 'project_id', src: '', icon: 'domain' },
        { name: 'last_message_id', value: 'last_message_id', src: '', icon: 'textsms' },
        { name: 'conversation_id', value: 'conversation_id', src: '', icon: 'textsms' },
        { name: 'last_user_text', value: 'last_user_text', src: '', icon: 'send' },
        { name: 'chatbot_name', value: 'chatbot_name', src: '', icon: 'person' },
        { name: 'user_id', value: 'user_id', src: '', icon: 'person' },
        { name: 'user_agent', value: 'user_agent', src: '', icon: 'person' },
        { name: 'user_source_page', value: 'user_source_page', src: '', icon: 'language' },
        { name: 'user_language', value: 'user_language', src: '', icon: 'language' },
        { name: 'chat_url', value: 'chat_url', src: '', icon: 'laptop' },
        { name: 'user_ip_address', value: 'user_ip_address', src: '', icon: 'laptop' },
        { name: 'user_country', value: 'user_country', src: '', icon: 'language' },
        { name: 'user_city', value: 'user_city', src: '', icon: 'language' }
    ]
}


export function patchActionId(action) {
    try {
        if(!action._tdActionId || action._tdActionId == "UUIDV4"){
            action._tdActionId = uuidv4();
        }
    } catch (error) {
       // error 
    }
    return action;
}


// export function retriveListOfVariables(intents: Array<Intent>) {
//     variableList.userDefined = []
//     intents.forEach(intent => {
//         intent.actions.filter(action => action._tdActionType === TYPE_ACTION.ASSIGN_VARIABLE).forEach(((actionAssignVariable: ActionAssignVariable) => {
//             if(!actionAssignVariable.hasOwnProperty('assignTo')) return; 
//             if(actionAssignVariable.assignTo === null || actionAssignVariable.assignTo === '') return;
//             if(variableList.userDefined.some(el => el.value === actionAssignVariable.assignTo)) return;
//             if(variableList.systemDefined.some(el => el.value === actionAssignVariable.assignTo)) return;
//             variableList.userDefined.push({ name: actionAssignVariable.assignTo, value: actionAssignVariable.assignTo })
//         }))
//     })
// }
