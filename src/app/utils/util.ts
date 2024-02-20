import { Chatbot } from 'app/models/faq_kb-model';
import { TooltipOptions } from 'ng2-tooltip-directive';

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
export enum PLAN_NAME {
    A = 'Growth',
    B = 'Scale',
    C = 'Plus',
    D = 'Basic',
    E = 'Premium',
    F = 'Custom'
}

export enum PLAN_SEATS {
    free = 1, // Sandbox
    Growth = 4, 
    Scale = 15,
    Basic = 1,
    Premium = 2,
    Custom = 'Custom'
};

export enum CHATBOT_MAX_NUM {
    free = 2, 
    Basic = 5,
    Premium = 20,
    Custom = 'Custom'
};

export enum KB_MAX_NUM {
    free = 1, 
    Basic = 2,
    Premium = 3,
    Custom = 3
};

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
export const PLANS_LIST = {
    FREE_TRIAL: { requests: 3000,   messages: 0,    tokens: 250000,     email: 200 }, // same as PREMIUM
    Sandbox:    { requests: 200,    messages: 0,    tokens: 10000,      email: 200 },
    Basic:      { requests: 800,    messages: 0,    tokens: 50000,      email: 200 },
    Premium:    { requests: 3000,   messages: 0,    tokens: 250000,     email: 200 },
    Custom:     { requests: 3000,   messages: 0,    tokens: 250000,     email: 200 }
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
    '250 Pages for Knowledge Base', 
    '50,000 AI Tokens'
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
    'Email Ticketing',
    '500 Pages for Knowledge Base', 
    '250,000 AI Tokens'
]

// Premium plan 
export const highlightedFeaturesPlanE = [
    { 'color': '#a613ec', 'background': 'rgba(166,19,236,.2)', 'feature': '2 User' },
    { 'color': '#0d8cff', 'background': 'rgba(13,140,255,.2)', 'feature': '3000 Chat/mo.' },
    { 'color': '#19a95d', 'background': 'rgba(28,191,105,.2)', 'feature': '20 Chatbot' }
]

export const additionalFeaturesPlanE = [
    'Addional users at 16€/User',
    'Addional Chat/mo at 10€/500 Conversations'
]


// Custom Plan
export const featuresPlanF = [
    'Dedicated Customer Success Manager',
    'Chatbot Design Assistance',
    'Onboarding and Training',
    'Smart Assignment',
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
  


export function goToCDSVersion(router: any, chatbot: Chatbot, project_id, redirectBaseUrl: string){
    // router.navigate(['project/' + project_id + '/cds/',chatbot._id, 'intent', '0']);

    let chatBotDate = new Date(chatbot.createdAt)
    let dateLimit = new Date('2023-10-02T00:00:00')
    if(chatBotDate > dateLimit){
        // let urlCDS_v2 = `${redirectBaseUrl}dashboard/#/project/${project_id}/cds/${chatbot._id}/intent/0`
        let urlCDS_v2 = `${redirectBaseUrl}#/project/${project_id}/chatbot/${chatbot._id}` //  /intent/0
        window.open(urlCDS_v2, '_self')
    } else {
        router.navigate(['project/' + project_id + '/cds/',chatbot._id, 'intent', '0']);
    }
}


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
    this.logger.log('getIndexOfbotDefaultLanguages langcode ' , langcode) 
    this.logger.log('getIndexOfbotDefaultLanguages index' , langcode) 
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


export const URL_more_info_chatbot_forms = 'https://gethelp.tiledesk.com/articles/tiledesk-chatbot-forms/';