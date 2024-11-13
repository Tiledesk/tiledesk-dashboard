import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Chatbot } from 'app/models/faq_kb-model';
import { TooltipOptions } from 'ng2-tooltip-directive';
import { concat, from, isObservable, Observable, of } from 'rxjs';
import { concatMap, first, last, takeWhile } from 'rxjs/operators';

export const CutomTooltipOptions: TooltipOptions = {
    'show-delay': 0,
    'tooltip-class': 'custom-ng2-tooltip',
    'theme': 'light',
    'shadow': true,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 0,
    'placement': 'top',
    'autoPlacement': true,
}

export const stripEmojis = (str: string) =>
    str.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ''
    ).replace(/\s+/g, ' ').trim();

export function members_as_html(members: object, requester_id: string, currentUserFireBaseUID: string): string {
    if (!members) {
        return ''
    }
    let members_as_string = '';
    Object.keys(members).forEach(m => {
        if ((m !== 'system') && (m !== requester_id)) {
            // console.log('UTILS - MEMBER ', m)

            // NEW: GET THE USER NAME (FROM LOCAL STORAGE) USING THE MEMBER ID
            const user = JSON.parse((localStorage.getItem(m)));
            // console.log('UTILS - USER GET FROM STORAGE BY MEMBER ID ', user);

            // console.log('UTILS - CURRENT USER UID ', currentUserFireBaseUID);
            if (user) {
                const user_firstname = user['firstname']
                // console.log('UTILS - USER NAME - GET FROM STORAGE BY MEMBER ID ', user_firstname);
                members_as_string += '- ' + user_firstname + ' <br>';
                if (currentUserFireBaseUID === m) {
                    members_as_string = members_as_string.replace(user['firstname'], '<strong>ME</strong>');
                }
            } else {

                members_as_string += '- ' + m + ' <br>';
                members_as_string = members_as_string.replace(currentUserFireBaseUID, '<strong>ME</strong>');
            }

        }

    });
    return members_as_string
}


export function currentUserUidIsInMembers(members: object, currentUserFireBaseUID: string, request_id: string): boolean {
    // console.log('- MEMBERS ', members)
    // console.log('- CURRENT_USER_JOINED ', currentUserFireBaseUID)

    // if (!members) {
    //     return ''
    // }
    let currentUserIsJoined = false
    Object.keys(members).forEach(m => {

        if (m === currentUserFireBaseUID) {
            // console.log('»»»»»»» UTILS MEMBERS ', members)
            // console.log('»»»»»»» CURRENT_USER_JOINED ', currentUserFireBaseUID);
            currentUserIsJoined = true;
            // console.log('»»»»»»» CURRENT USER ', currentUserFireBaseUID, 'is JOINED ?', currentUserIsJoined, 'to the request ', request_id);
            return
        }
    });
    // console.log('»»»»»»» CURRENT USER ', currentUserFireBaseUID, ' is JOINED ?', currentUserIsJoined, 'to the request ', request_id);
    return currentUserIsJoined;
}

export function avatarPlaceholder(requester_fullname) {
    let initials = '';
    if (requester_fullname) {
        const arrayName = requester_fullname.split(' ');
        arrayName.forEach(member => {
            if (member.trim().length > 1 && initials.length < 3) {
                initials += member.substring(0, 1).toUpperCase();
            }
        });
    }
    // console.log('»»»»»»» UTILS avatarPlaceholder------------->', requester_fullname, initials);
    return initials;
}

export function getColorBck(requester_fullname) {
    // const arrayBckColor = ['#fba76f', '#80d066', '#73cdd0', '#ecd074', '#6fb1e4', '#f98bae'];
    const arrayBckColor = ['#E17076', '#7BC862', '#65aadd', '#a695e7', '#ee7aae', '#6ec9cb', '#faa774'];
    let num = 0;
    if (requester_fullname) {
        // const code = requester_fullname.charCodeAt(0);
        const code = requester_fullname.charCodeAt((requester_fullname.length - 1));
        num = Math.round(code % arrayBckColor.length);
        // console.log('************** code', requester_fullname.length, code, arrayBckColor.length, num);
    }
    // console.log('»»»»»»» UTILS getColorBck ------------->', requester_fullname, arrayBckColor[num]);
    return arrayBckColor[num];
}


export function htmlEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    // .replace(/\n/g, '<br>')
}

export function unescapeHTML(str) {
    return String(str)
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
}

export function replaceEndOfLine(text) {
    // const newText =   text.replace(/\n/g, '<br>')
    const newText = text.replace(/[\n\r]/g, '<br>');
    // const newText = text.replace(/<br\s*[\/]?>/gi, '\n')
    return newText;
}



//LOG LEVEL
// export enum LogLevel {
//     // Off = 0,
//     // Info = 1,
//     // Debug = 2,
//     // Warn = 3,
//     // Error = 4,
//     // All = 5,

//     Error = 0,
//     Warn = 1,
//     Info = 2,
//     Debug = 3
// }

export const LogLevel = {
    'ERROR': 0,
    'WARN': 1,
    'INFO': 2,
    'DEBUG': 3
}

export const tranlatedLanguage = ['it', 'en', 'de', 'es', 'pt', 'fr', 'ru', 'tr', 'sr', 'ar', 'uk', 'sv', 'az', 'kk', 'uz']

export const emailDomainWhiteList = [
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'hotmail.co.uk',
    'hotmail.fr',
    'hotmail.it',
    'sbcglobal.net',
    'sfr.fr',
    'live.fr',
    'verizon.net',
    'tiscali.it',
    'virgilio.it',
    'inbox.com',
    'aol.com',
    'aim.com',
    'yahoo.com',
    'yahoo.fr',
    'yahoo.co.uk',
    'yahoo.com.br',
    'yahoo.co.in',
    'live.com',
    'rediffmail.com',
    'free.fr',
    'titan.email',
    'gmx.de',
    'web.de',
    'yandex.ru',
    'ymail.com',
    'libero.it',
    'uol.com.br',
    'bol.com.br',
    'mail.ru',
    'cox.net',
    'icloud.com ',
    'pm.com',
    'protonmail.com',
    'zoho.com',
    'yandex.com',
    'gmx.com',
    'hubspot.com',
    'mail.com',
    'email.com',
    'usa.com',
    'consultant.com',
    'myself.com',
    'europe.com',
    'dr.com',
    'engineer.com',
    'asia.com',
    'post.com',
    'tutanota.com',
    'mail2world.com',
    'mail2one.com',
    'mail2italy.com',
    'mail2italian.com',
    'mail2milano.com',
    'mail2rome.com',
    'mail2vienna.com',
    'mail2cool.com',
    'mail2art.com',
    'mail2fun.com',
    'mail2dude.com',
    'mail2expert.com',
    'mail2engineer.com',
    'mail2consultant.com',
    'msn.com',
    'wanadoo.fr',
    'orange.fr',
    'comcast.net',
    'live.co.uk',
    'googlemail.com',
    'ahoo.es',
    'ig.com.blueyonder',
    'live.nl',
    'bigpond.com',
    'terra.com.br',
    'yahoo.it',
    'neuf.fr',
    'yahoo.de',
    'alice.it',
    'rocketmail.com',
    'att.net',
    'laposte.net',
    'facebook.com',
    'bellsouth.net',
    'yahoo.in',
    'hotmail.es',
    'charter.net',
    'yahoo.ca',
    'yahoo.com.au',
    'rambler.ru',
    'hotmail.de',
    'shaw.ca',
    'yahoo.co.jp',
    'sky.comcast',
    'earthlink.net',
    'optonline.net',
    'freenet.de',
    't-online.de',
    'aliceadsl.fr',
    'home.nl',
    'qq.com',
    'telenet.be',
    'yahoo.com.ar',
    'tiscali.co.uk',
    'yahoo.com.mx',
    'voila.fr',
    'gmx.net',
    'planet.nl',
    'tin.it',
    'live.it',
    'ntlworld.com',
    'arcor.de',
    'yahoo.co.id',
    'frontiernet.net',
    'hetnet.nl',
    'live.com.au',
    'yahoo.com.sg',
    'zonnet.nl',
    'club-internet.fr',
    'juno.com',
    'optusnet.com.au',
    'blueyonder.co.uk',
    'bluewin.ch',
    'skynet.be',
    'sympatico.ca',
    'windstream.net',
    'mac.com',
    'centurytel.net',
    'chello.nl',
    'live.ca',
    'bigpond.net.au'
]



export enum APP_SUMO_PLAN_NAME {
    tiledesk_tier1 = 'AppSumo License Tier 1',
    tiledesk_tier2 = 'AppSumo License Tier 2',
    tiledesk_tier3 = 'AppSumo License Tier 3',
    tiledesk_tier4 = 'AppSumo License Tier 4',
}

export enum APPSUMO_PLAN_SEATS {
    tiledesk_tier1 = 2,
    tiledesk_tier2 = 5,
    tiledesk_tier3 = 10,
    tiledesk_tier4 = 20,
};

// export enum PLAN_SEATS {
//     free = 2, 
//     Growth = 4, 
//     Scale = 15,
// };




export enum KB_DEFAULT_PARAMS {
    LIMIT = 20,
    NUMBER_PAGE = 0,
    DIRECTION = -1,
    SORT_FIELD = 'updatedAt'
}

export const KB_LIMIT_CONTENT = 300;

// Growth
export const featuresPlanA = [
    'CRM',
    'Private Notes',
    'Unlimited Conversations History',
    'Working Hours',
    'Email Ticketing',
    'User Ratings',
    'Canned Responses',
    'Webhooks',
    'Email Support',
    'Team Inbox'
]
export const highlightedFeaturesPlanA = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '4 Seats' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '800 Chat/mo.' }
]



// Scale Plan
export const featuresPlanB = [
    'Widget Unbranding',
    'WhatsApp Business',
    'Facebook Messenger',
    'Unlimited Departments',
    'Unlimited Groups',
    'Zapier connector',
    'Data export',
    'Livechat Support',
    'Knowledge Base',
    'Analytics'
]

export const highlightedFeaturesPlanB = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '15 Seats' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '3000 Chat/mo.' }
]


// Plus plan
export const featuresPlanC = [
    'Dedicated Customer Success Manager',
    'Chatbot Design Assistance',
    'Onboarding and Training',
    'Smart Assignment',
    'IP Filtering',
    'Email Templates Customisation',
    'Activities Log',
    'Ban Visitors',
    'Dialogflow connector',
    'Rasa connector',
    'SMTP Settings',
    'Support to host Tiledesk on your Infrastructure',
    'Premium Customer Support',
]

// Plus plan
export const highlightedFeaturesPlanC = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': 'Tailored solutions' }
]

// ------------------------
// New Pricing
// ------------------------
// export const PLANS_LIST = {
//     FREE_TRIAL: { requests: 3000,   messages: 0,    tokens: 250000,     email: 200 }, // same as PREMIUM
//     Sandbox:    { requests: 200,    messages: 0,    tokens: 10000,      email: 200 },
//     Basic:      { requests: 800,    messages: 0,    tokens: 50000,      email: 200 },
//     Premium:    { requests: 3000,   messages: 0,    tokens: 250000,     email: 200 },
//     Custom:     { requests: 3000,   messages: 0,    tokens: 250000,     email: 200 }
// }

export enum PLAN_NAME {
    A = 'Growth',
    B = 'Scale',
    C = 'Plus',
    D = 'Basic',
    E = 'Premium',
    EE = 'Team',
    F = 'Custom'
}

export enum PLAN_SEATS {
    free = 1, // Sandbox
    Growth = 4,
    Scale = 15,
    Basic = 1,
    Premium = 2,
    Team = 4,
    Custom = 'Custom'
};


export enum CHATBOT_MAX_NUM {
    free = 2,
    Basic = 5,
    Premium = 20,
    Team = 50,
    Custom = 50
};

export enum KB_MAX_NUM {
    free = 50,
    Basic = 150,
    Premium = 300,
    Team = 1000,
    Custom = 1000
};

export const PLANS_LIST = {
    FREE_TRIAL: { requests: 200, messages: 0, tokens: 100000, email: 200, chatbots: 20, namespace: 3, kbs: 50 }, // same as PREMIUM
    Sandbox: { requests: 200, messages: 0, tokens: 100000, email: 200, chatbots: 2, namespace: 1, kbs: 50 },
    Basic: { requests: 800, messages: 0, tokens: 2000000, email: 200, chatbots: 5, namespace: 1, kbs: 150 },
    Premium: { requests: 3000, messages: 0, tokens: 5000000, email: 200, chatbots: 20, namespace: 3, kbs: 300 },
    Team: { requests: 5000, messages: 0, tokens: 10000000, email: 200, chatbots: 50, namespace: 10, kbs: 1000 },
    Custom: { requests: 5000, messages: 0, tokens: 10000000, email: 200, chatbots: 50, namespace: 10, kbs: 1000 }
}

// Basic plan
export const featuresPlanD = [
    'CRM',
    'Private Notes',
    'Unlimited Conversations History',
    'Working Hours',
    'User Ratings',
    'Canned Responses',
    'Webhooks',
    'Email Support',
    'Team Inbox',
    'Make integration',
    "1 Knowledge Base",
    '150 contents across all Knowledge Bases',
    // '150 Contents for Knowledge Base', 
    '2,000,000 AI Tokens'
]
// Basic plan
export const highlightedFeaturesPlanD = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '1 User ' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '800 Chat/mo.' },
    { 'color': '#19a95d', 'background': 'rgba(28,191,105,.2)', 'feature': '5 Chatbot' }
]

export const additionalFeaturesPlanD = [
    'Addional users at 8€/User',
    'Addional Chat/mo at 10€/500 Conversations'
]


// Premium plan 
export const featuresPlanE = [
    'Widget Unbranding',
    'WhatsApp Business',
    'Facebook Messenger',
    'Help center',
    'Unlimited Departments',
    'Unlimited Groups',
    'Qapla\' integration',
    'Data export',
    'Livechat Support',
    'Analytics',
    "3 Knowledge Base",
    '300 contents across all Knowledge Bases',
    '5,000,000 AI Tokens'
    // '250,000 AI Tokens'
]

// Premium plan 
export const highlightedFeaturesPlanE = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '2 User' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '3,000 Chat/mo.' },
    { 'color': '#19a95d', 'background': 'rgba(28,191,105,.2)', 'feature': '20 Chatbot' }
]

export const additionalFeaturesPlanE = [
    'Addional users at 16€/User',
    'Addional Chat/mo at 10€/500 Conversations'
]


// Team plan 
export const featuresPlanEE = [
    'Widget Unbranding',
    'WhatsApp Business',
    'Facebook Messenger',
    'Help center',
    'Unlimited Departments',
    'Unlimited Groups',
    'Qapla\' integration',
    'Data export',
    'Livechat Support',
    'Analytics',
    "10 Knowledge Base",
    '1,000 contents across all Knowledge Bases',
    '10,000,000 AI Tokens'
]

// Premium plan 
export const highlightedFeaturesPlanEE = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '4 User' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '5,000 Chat/mo.' },
    { 'color': '#19a95d', 'background': 'rgba(28,191,105,.2)', 'feature': '50 Chatbot' }
]

export const additionalFeaturesPlanEE = [
    'Addional users at 16€/User',
    'Addional Chat/mo at 10€/500 Conversations'
]

// Custom Plan
export const featuresPlanF = [
    'Dedicated Customer Success Manager',
    'Chatbot Design Assistance',
    'Onboarding and Training',
    'Smart Assignment',
    'Email Ticketing',
    'IP Filtering',
    'Email Templates Customisation',
    'Activities Log',
    'Ban Visitors',
    'Connector with 3rd party AI',
    'Automations Log',
    'SMTP Settings',
    'Support to host Tiledesk on your Infrastructure',
    'Premium Customer Support',
]

// Custom Plan
export const highlightedFeaturesPlanF = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': 'Tailored solutions' }
]



export const appSumoHighlightedFeaturesPlanATier1 = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '2 Seats' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '500 Chat/mo.' }
]

export const appSumoHighlightedFeaturesPlanATier2 = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '5 Seats' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '1.000 Chat/mo.' }
]

export const appSumoHighlightedFeaturesPlanATier3 = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '10 Seats' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '2.500 Chat/mo.' }
]

export const appSumoHighlightedFeaturesPlanATier4 = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '20 Seats' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '5.000 Chat/mo.' }
]



export function goToCDSVersion(router: any, chatbot: Chatbot, project_id, redirectBaseUrl: string) {
    // router.navigate(['project/' + project_id + '/cds/',chatbot._id, 'intent', '0']);

    let chatBotDate = new Date(chatbot.createdAt)
    let dateLimit = new Date('2023-10-02T00:00:00')
    if (chatBotDate > dateLimit) {
        // let urlCDS_v2 = `${redirectBaseUrl}dashboard/#/project/${project_id}/cds/${chatbot._id}/intent/0`
        let urlCDS_v2 = `${redirectBaseUrl}#/project/${project_id}/chatbot/${chatbot._id}/blocks` //  /intent/0
        window.open(urlCDS_v2, '_self')
    } else {
        router.navigate(['project/' + project_id + '/cds/', chatbot._id, 'intent', '0']);
    }
}

export function goToCDSSettings(router: any, chatbot: Chatbot, project_id, redirectBaseUrl: string) {
    // router.navigate(['project/' + project_id + '/cds/',chatbot._id, 'intent', '0']);

    let chatBotDate = new Date(chatbot.createdAt)
    let dateLimit = new Date('2023-10-02T00:00:00')
    if (chatBotDate > dateLimit) {
        // let urlCDS_v2 = `${redirectBaseUrl}dashboard/#/project/${project_id}/cds/${chatbot._id}/intent/0`
        let urlCDS_v2 = `${redirectBaseUrl}#/project/${project_id}/chatbot/${chatbot._id}/settings?active=bot_detail` //  /intent/0
        window.open(urlCDS_v2, '_self')
    } else {
        router.navigate(['project/' + project_id + '/cds/', chatbot._id, 'intent', '0']);
    }
}

// https://panel.tiledesk.com/v3/cds/#/project/669920398f4564001364e949/chatbot/6699226de730b70013fc3b67/settings?active=bot_detail


export const botDefaultLanguages = [
    { code: 'da', name: 'Danish - da' },
    { code: 'nl', name: 'Dutch - nl' },
    { code: 'en', name: 'English - en' },
    { code: 'fi', name: 'Finnish - fi' },
    { code: 'fr', name: 'French - fr' },
    { code: 'de', name: 'German - de' },
    { code: 'hu', name: 'Hungarian - hu' },
    { code: 'it', name: 'Italian - it' },
    { code: 'nb', name: 'Norwegian - nb' },
    { code: 'pt', name: 'Portuguese - pt' },
    { code: 'ro', name: 'Romanian - ro' },
    { code: 'ru', name: 'Russian - ru' },
    { code: 'es', name: 'Spanish - es' },
    { code: 'sv', name: 'Swedish - sv' },
    { code: 'tr', name: 'Turkish - tr' }
];

export function getIndexOfbotDefaultLanguages(langcode: string): number {
    this.logger.log('getIndexOfbotDefaultLanguages langcode ', langcode)
    this.logger.log('getIndexOfbotDefaultLanguages index', langcode)
    const index = botDefaultLanguages.findIndex(x => x.code === langcode);
    return index
}

export const dialogflowLanguage = [
    { code: 'zh-cn', name: 'Chinese (Simplified) — zh-cn' },
    { code: 'zh-hk', name: 'Chinese (Hong Kong) — zh-hk' },
    { code: 'zh-tw', name: 'Chinese (Traditional) — zh-tw' },
    { code: 'da', name: 'Danish — da' },
    { code: 'nl', name: 'Dutch — nl' },
    { code: 'en', name: 'English — en' },
    { code: 'fr', name: 'French — fr' },
    { code: 'de', name: 'German — de' },
    { code: 'hi', name: 'Hindi — hi' },
    { code: 'id', name: 'Indonesian — id' },
    { code: 'it', name: 'Italian — it' },
    { code: 'ja', name: 'Japanese — ja' },
    { code: 'ko', name: 'Korean (South Korea) — ko' },
    { code: 'no', name: 'Norwegian — no' },
    { code: 'pl', name: 'Polish — pl' },
    { code: 'pt-br', name: 'Portuguese (Brazilian) — pt-br' },
    { code: 'pt', name: 'Portuguese (European) — pt' },
    { code: 'ru', name: 'Russian — ru' },
    { code: 'es', name: 'Spanish — es' },
    { code: 'sv', name: 'Swedish — sv' },
    { code: 'th', name: 'Thai — th' },
    { code: 'tr', name: 'Turkish — tr' },
    { code: 'uk', name: 'Ukrainian — uk' },
];


export function getIndexOfdialogflowLanguage(langcode: string): number {
    const index = this.dialogflowLanguage.findIndex(x => x.code === langcode);
    return index
}


export function loadTokenMultiplier(ai_models) {
    let models_string = ai_models.replace(/ /g, '');

    let models = {};
    if (!models_string) {
        return models;
    }

    let splitted_string = models_string.split(";");

    splitted_string.forEach(m => {
        let m_split = m.split(":");
        let multiplier = null;
        if (!m_split[1]) {
            multiplier = null;
        } else {
            multiplier = Number(m_split[1]);;
        }
        models[m_split[0]] = multiplier;
    })

    return models
}

// export const TYPE_GPT_MODEL = {
//     'GPT-3': { name: "GPT-3 (DaVinci)", value: "text-davinci-003", status: "inactive"},
//     'GPT-3.5' : { name: "GPT-3.5 Turbo (ChatGPT)", value: "gpt-3.5-turbo", status: "active"},
//     'GPT-4' : { name: "GPT-4 (ChatGPT)", value: "gpt-4", status: "active"},
//     'GPT-4-turbo-preview': { name: "GPT-4 Turbo Preview (ChatGPT)", value: "gpt-4-turbo-preview", status: "active"},
//     'GPT-4o': { name: "GPT-4o (ChatGPT)", value: "gpt-4o", status: "active"}
// }

// export const TYPE_GPT_MODEL = {
//     'GPT-3': { name: "GPT-3 (DaVinci)", value: "text-davinci-003", status: "inactive"},
//     'GPT-3.5' : { name: "GPT-3.5 Turbo", value: "gpt-3.5-turbo", status: "active"},
//     'GPT-4' : { name: "GPT-4", value: "gpt-4", status: "active"},
//     'GPT-4-turbo-preview': { name: "GPT-4 Turbo", value: "gpt-4-turbo-preview", status: "active"},
//     'GPT-4o': { name: "GPT-4o", value: "gpt-4o", status: "active"},
//     'GPT-4o-mini':{ name: "GPT-4o mini",value: "gpt-4o-mini", status: "active"}
// }

export const TYPE_GPT_MODEL: Array<{ name: string, value: string, description: string, status: "active" | "inactive" }> = [
    { name: "GPT-3 (DaVinci)", value: "text-davinci-003", description: "TYPE_GPT_MODEL.text-davinci-003.description", status: "inactive" },
    { name: "GPT-3.5 Turbo", value: "gpt-3.5-turbo", description: "TYPE_GPT_MODEL.gpt-3.5-turbo.description", status: "active" },
    { name: "GPT-4 (Legacy)", value: "gpt-4", description: "TYPE_GPT_MODEL.gpt-4.description", status: "active" },
    { name: "GPT-4 Turbo Preview", value: "gpt-4-turbo-preview", description: "TYPE_GPT_MODEL.gpt-4-turbo-preview.description", status: "active" },
    { name: "GPT-4o", value: "gpt-4o", description: "TYPE_GPT_MODEL.gpt-4o.description", status: "active" },
    { name: "GPT-4o mini", value: "gpt-4o-mini", description: "TYPE_GPT_MODEL.gpt-4o-mini.description", status: "active" },
    { name: "OpenAI o1-mini", value: "o1-mini", description: "TYPE_GPT_MODEL.o1-mini.description", status: "active" },
    { name: "OpenAI o1-preview", value: "o1-preview", description: "TYPE_GPT_MODEL.o1-preview.description", status: "active" }
]
export const CHANNELS_NAME = {
    CHAT21: 'chat21',
    EMAIL: 'email',
    FORM: 'form',
    TELEGRAM: 'telegram',
    MESSANGER: 'messenger',
    WHATSAPP: 'whatsapp',
    VOICE_VXML: 'voice-vxml',
    VOICE_TWILIO: 'voice-twilio',
    SMS_TWILIO: 'sms-twilio',
}

export const CHANNELS = [
    { id: CHANNELS_NAME.CHAT21, name: 'Chat' },
    { id: CHANNELS_NAME.EMAIL, name: 'Email' },
    { id: CHANNELS_NAME.FORM, name: 'Ticket' },
    { id: CHANNELS_NAME.TELEGRAM, name: 'Telegram' },
    { id: CHANNELS_NAME.MESSANGER, name: 'Facebook Messenger' },
    { id: CHANNELS_NAME.WHATSAPP, name: 'WhatsApp' },
    { id: CHANNELS_NAME.VOICE_VXML, name: 'Voice' },
    { id: CHANNELS_NAME.VOICE_TWILIO, name: 'Voice' },
    { id: CHANNELS_NAME.SMS_TWILIO, name: 'SMS' },

]

export function checkAcceptedFile(fileType, fileUploadAccept ): boolean{
  
    if (fileUploadAccept === '*/*') {
      return true
    }
    // Dividi la stringa fileUploadAccept in un array di tipi accettati
    const acceptedTypes = fileUploadAccept.split(',');
  
    // Verifica se il tipo di file è accettato
    return acceptedTypes.some((accept) => {
        accept = accept.trim();
        // Controlla per i tipi MIME con wildcard, come image/*
        if (accept.endsWith('/*')) {
            const baseMimeType = fileType.split('/')[0]; // Ottieni la parte principale del MIME type
            return accept.replace('/*', '') === baseMimeType;
        }

        // Controlla se l'accettazione è un MIME type esatto (come image/jpeg)
        if (accept === fileType) {
            return true;
        }

        // Controlla per le estensioni di file specifiche come .pdf o .txt
        return fileType === getMimeTypeFromExtension(accept);
    });
  
}
  
function getMimeTypeFromExtension(extension: string): string {
    // Rimuovi il punto dall'estensione e ottieni il MIME type
    const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Aggiungi altri tipi MIME se necessario
    };
    return mimeTypes[extension] || '';
}

export function filterImageMimeTypesAndExtensions(fileUploadAccept: string): string[] {
    
    if (fileUploadAccept === '*/*') {
        return ['*/*']
    }
    
    // Lista delle estensioni di immagine comuni
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  
    // Dividi la stringa in un array di tipi accettati
    const acceptedTypes = fileUploadAccept.split(',');
  
    // Filtra solo i MIME type che iniziano con "image/" o che sono estensioni di immagine
    const imageTypesAndExtensions = acceptedTypes
      .map(type => type.trim().toLowerCase()) // Rimuove gli spazi bianchi e converte a minuscolo
      .filter(type => type.startsWith('image/') || imageExtensions.includes(type));
    
    return imageTypesAndExtensions;
}

export function isMaliciousURL(url: string): boolean {
    // Verifica se l'URL ha pattern sospetti
    const suspiciousPatterns = [
      /\/\/\d+\.\d+\.\d+\.\d+/, // URL con indirizzi IP
      /@/,                      // URL con '@' per ingannare la visualizzazione
      /%00/,                    // Caratteri di null byte
      /javascript:/i,           // URL con javascript
      /data:/i,                 // URL con data URI
      /\.\.\//,                 // Directory traversal
      /(https?:\/\/)?bit\.ly/i, // URL abbreviati comuni (come bit.ly)
    ];
  
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        return true; // URL sospetto
      }
    }
  
    // Se l'URL non corrisponde a pattern noti, restituisce false (non malevolo)
    return false;
}


export function containsXSS(jsonData) {
    // List of common XSS attack patterns
    const xssPatterns = [
        /<script.*?>.*?<\/script.*?>/gi,  // script tags
        // /on\w+\s*=\s*['"]?.*?['"]?/gi,    // event handlers like onload, onclick
        /on[a-z]+=/gi,
        /eval\s*\(.*?\)/gi,               // eval calls
        /javascript\s*:\s*.*/gi,          // javascript protocol
        /document\.cookie/gi,             // access to cookies
        /<iframe.*?>.*?<\/iframe.*?>/gi,  // iframe injection
        /<img.*?src=['"]javascript:.*?['"]/gi,  // img tags with JS in src
    ];

    // Check if any of the patterns match
    for (const pattern of xssPatterns) {
        if (pattern.test(jsonData)) {
            return true; // XSS detected
        }
    }
    return false; // No XSS detected
}

export function isMaliciousHTML(input) {
    // List of common XSS attack patterns
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
        /on\w+="[^"]*"/gi,                                    // Event handlers
        /javascript:[^'"]*/gi,                               // JavaScript URLs
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, // Iframe tags
        /data:text\/html;base64,[A-Za-z0-9+/=]+/gi          // Base64 encoded scripts
    ];


    // Check if any of the patterns match
    for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
            return true; // XSS detected
        }
    }
    return false; // No XSS detected
}


// Links to documentation
export const URL_understanding_default_roles = 'https://gethelp.tiledesk.com/articles/understanding-default-roles/' // 'https://docs.tiledesk.com/knowledge-base/understanding-default-roles/'
export const URL_getting_started_with_triggers = 'https://gethelp.tiledesk.com/articles/getting-started-with-triggers/' // 'https://docs.tiledesk.com/knowledge-base/getting-started-with-triggers/'
export const URL_creating_groups = 'https://gethelp.tiledesk.com/articles/creating-groups/' // 'https://docs.tiledesk.com/knowledge-base/creating-groups/'
export const URL_getting_started_with_email_ticketing = "https://gethelp.tiledesk.com/articles/getting-started-with-email-ticketing-in-tiledesk/"

export const URL_microlanguage_for_dialogflow_images_videos = 'https://docs.tiledesk.com/knowledge-base/microlanguage-for-dialogflow-images-videos/'; // NOT FOUND on gethelp
export const URL_dialogflow_connector_handoff_to_human_agent_example = 'https://gethelp.tiledesk.com/articles/dialogflow-connector-handoff-to-human-agent-example/' // 'https://docs.tiledesk.com/knowledge-base/dialogflow-connector-handoff-to-human-agent-example/'
export const URL_styling_your_chatbot_replies = 'https://gethelp.tiledesk.com/articles/styling-your-chatbot-replies/'  // https://docs.tiledesk.com/knowledge-base/styling-your-chatbot-replies/ 
export const URL_response_bot_images_buttons_videos_and_more = 'https://docs.tiledesk.com/knowledge-base/response-bot-images-buttons-videos-and-more/'; // NOT FOUND on gethelp
export const URL_handoff_to_human_agents = 'https://gethelp.tiledesk.com/articles/handoff-to-human-agents/' // https://docs.tiledesk.com/knowledge-base/handoff-to-human-agents/
export const URL_configure_your_first_chatbot = 'https://gethelp.tiledesk.com/articles/configure-your-first-chatbot/' //  https://docs.tiledesk.com/knowledge-base/configure-your-first-chatbot/ 
export const URL_connect_your_dialogflow_agent = 'https://gethelp.tiledesk.com/articles/dialogflow-connector/' //'https://docs.tiledesk.com/knowledge-base/connect-your-dialogflow-agent/'; // NOT FOUND on gethelp
export const URL_advanced_chatbot_styling_buttons = 'https://gethelp.tiledesk.com/articles/advanced-chatbot-styling-buttons/'; // https://docs.tiledesk.com/knowledge-base/advanced-chatbot-styling-buttons/
export const URL_rasa_ai_integration = 'https://gethelp.tiledesk.com/articles/rasa-ai-integration/'
export const URL_external_chatbot_connect_your_own_chatbot = 'https://developer.tiledesk.com/external-chatbot/connect-your-own-chatbot'

export const URL_getting_started_for_admins = 'https://gethelp.tiledesk.com/categories/getting-started-for-admins/' // https://docs.tiledesk.com/knowledge-base-category/getting-started-for-admins/
export const URL_getting_started_for_agents = 'https://gethelp.tiledesk.com/categories/getting-started-for-agents/' //'https://docs.tiledesk.com/knowledge-base-category/getting-started-for-agents/'
export const URL_google_tag_manager_add_tiledesk_to_your_sites = 'https://docs.tiledesk.com/knowledge-base/google-tag-manager-add-tiledesk-to-your-sites/' // NOT FOUND on gethelp
export const URL_setting_up_automatic_assignment = 'https://gethelp.tiledesk.com/articles/setting-up-automatic-assignment/' // https://docs.tiledesk.com/knowledge-base/setting-up-automatic-assignment/
export const URL_dialogflow_connector = 'https://gethelp.tiledesk.com/articles/dialogflow-connector/'




export const URL_web_integrations = 'https://gethelp.tiledesk.com/categories/web-integrations/'
export const URL_install_tiledesk_on_website = 'https://gethelp.tiledesk.com/articles/install-widget-on-your-website/'
export const URL_install_tiledesk_on_shopify = 'https://gethelp.tiledesk.com/articles/install-tiledesk-on-shopify/'
export const URL_install_tiledesk_on_wordpress = 'https://gethelp.tiledesk.com/articles/install-tiledesk-on-wordpress/'
export const URL_install_tiledesk_on_prestashop = 'https://gethelp.tiledesk.com/articles/install-tiledesk-on-prestashop/'
export const URL_install_tiledesk_on_joomla = 'https://gethelp.tiledesk.com/articles/install-tiledesk-on-joomla/'
export const URL_install_tiledesk_on_bigcommerce = 'https://gethelp.tiledesk.com/articles/how-to-install-the-tiledesk-live-chat-widget-on-a-bigcommerce-website/'
export const URL_install_tiledesk_on_wix = "https://gethelp.tiledesk.com/articles/how-to-install-the-tiledesk-live-chat-widget-on-a-wix-website/"
export const URL_install_tiledesk_on_magento = "https://gethelp.tiledesk.com/articles/how-to-install-the-tiledesk-live-chat-widget-on-a-magento-website/"
export const URL_more_info_chatbot_forms = 'https://gethelp.tiledesk.com/articles/tiledesk-chatbot-forms/';

export const URL_AI_model_doc = 'https://gethelp.tiledesk.com/articles/advanced-knowledge-base-ai-settings/#1-ai-models';
export const URL_max_tokens_doc = 'https://gethelp.tiledesk.com/articles/advanced-knowledge-base-ai-settings/#2-maximum-number-of-tokens';
export const URL_temperature_doc = 'https://gethelp.tiledesk.com/articles/advanced-knowledge-base-ai-settings/#3-temperature';
export const URL_chunk_Limit_doc = "https://gethelp.tiledesk.com/articles/advanced-knowledge-base-ai-settings/#4-chunks";
export const URL_system_context_doc = 'https://gethelp.tiledesk.com/articles/advanced-knowledge-base-ai-settings/#5-system-context';
export const URL_kb = 'https://gethelp.tiledesk.com/categories/knowledge-base/'


