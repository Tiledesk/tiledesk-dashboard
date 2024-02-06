export enum INTEGRATIONS_KEYS {
    BREVO = 'brevo',
    CUSTOMERIO = 'customerio',
    HUBSPOT = 'hubspot',
    OPENAI = 'openai',
    QAPLA = 'qapla',
    GSHEETS = "gsheets",
    ACTIVE_CAMPAIGN = 'active_campaign',
    JIRA = 'jira',
    KLAVIYO = 'klaviyo',
    MAILCHIMP = 'mailchimp',
    MAKE = 'make',
    PIPEDRIVE = 'pipedrive',
    SALESFORCE = 'salesforce',
    TELEGRAM = 'telegram',
    TWILIO = 'twilio',
    WHATSAPP = 'whatsapp',
    ZAPIER = 'zapier',
    ZENDESK = 'zendesk',
    ZOHO = 'zoho'
}

export enum INTEGRATIONS_CATEGORIES {
    AI = 'ai',
    AUTOMATION = "automation",
    COMMUNICATION = 'communication',
    CRM = 'crm',
    ECOMMERCE = 'ecommerce',
    EMAIL = "email",
    INT_PLAT = "int_plat",
    LIVE_CHAT = "live_chat",
    STORAGE = 'storage',
    OTHER = 'other'
}

export const CATEGORIES_LIST = [
    { type: INTEGRATIONS_CATEGORIES.AI, name: "Artificial Intelligence" },
    { type: INTEGRATIONS_CATEGORIES.AUTOMATION, name: "Automation" },
    { type: INTEGRATIONS_CATEGORIES.COMMUNICATION, name: "Communication" },
    { type: INTEGRATIONS_CATEGORIES.CRM, name: "CRM" },
    //{ type: INTEGRATIONS_CATEGORIES.STORAGE, name: "Data/File Storage" },
    { type: INTEGRATIONS_CATEGORIES.ECOMMERCE, name: "E-Commerce" },
    { type: INTEGRATIONS_CATEGORIES.EMAIL, name: "Email Marketing" },
    { type: INTEGRATIONS_CATEGORIES.INT_PLAT, name: "Integration Platform" },
    { type: INTEGRATIONS_CATEGORIES.LIVE_CHAT, name: "Live Chat Support" },
    { type: INTEGRATIONS_CATEGORIES.OTHER, name: "Other" },


    // { type: getKeyByValue(INTEGRATIONS_CATEGORIES.AI, INTEGRATIONS_CATEGORIES), name: "Artificial Intelligence" },
    // { type: getKeyByValue(INTEGRATIONS_CATEGORIES.CRM, INTEGRATIONS_CATEGORIES), name: "CRM" },
    // { type: getKeyByValue(INTEGRATIONS_CATEGORIES.ECOMMERCE, INTEGRATIONS_CATEGORIES), name: "E-Commerce" },
    // { type: getKeyByValue(INTEGRATIONS_CATEGORIES.STORAGE, INTEGRATIONS_CATEGORIES), name: "Data/File Storage" },
]


export const INTEGRATIONS_LIST: { [key: string]: { name: string, category: INTEGRATIONS_CATEGORIES, key: INTEGRATIONS_KEYS, src_icon: string, src_logo: string, pro?: boolean, plan: 'Sandbox' | 'Basic' | 'Premium' } } = {
    BREVO:              { name: "Brevo",            category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.BREVO,           src_icon: "assets/img/int/brevo.png",                   src_logo: "assets/img/int/brevo-logo.png",              pro: true,  plan: 'Premium' },
    CUSTOMERIO:         { name: "Customer.io",      category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.CUSTOMERIO,      src_icon: "assets/img/int/customer-io-logo-color.svg",  src_logo: "assets/img/int/customerio-logo.svg",         pro: true,  plan: 'Premium' },
    HUBSPOT:            { name: "HubSpot",          category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.HUBSPOT,         src_icon: "assets/img/int/hubspot.png",                 src_logo: "assets/img/int/hubspot-logo.svg",            pro: true,  plan: 'Premium' },
    OPENAI:             { name: "OpenAI",           category: INTEGRATIONS_CATEGORIES.AI,               key: INTEGRATIONS_KEYS.OPENAI,          src_icon: "assets/cds/images/actions/openai-icon.svg",  src_logo: "assets/img/int/openai-logo.svg",             pro: true,  plan: 'Sandbox' },
    QAPLA:              { name: "Qapla'",           category: INTEGRATIONS_CATEGORIES.ECOMMERCE,        key: INTEGRATIONS_KEYS.QAPLA,           src_icon: "assets/cds/images/actions/qapla.jpg",        src_logo: "assets/img/int/qapla-logo.png",              pro: true,  plan: 'Premium' },
    ACTIVE_CAMPAIGN:    { name: "Active Campaign",  category: INTEGRATIONS_CATEGORIES.COMMUNICATION,    key: INTEGRATIONS_KEYS.ACTIVE_CAMPAIGN, src_icon: "assets/img/int/active-campaign-icon.jpeg",   src_logo: "assets/img/int/active-campaign-logo.png",    pro: true,  plan: 'Premium' },
    JIRA:               { name: "Jira",             category: INTEGRATIONS_CATEGORIES.OTHER,            key: INTEGRATIONS_KEYS.JIRA,            src_icon: "assets/img/int/jira-icon.png",               src_logo: "assets/img/int/jira-logo.png",               pro: true,  plan: 'Premium'},
    KLAVIYO:            { name: "Klaviyo",          category: INTEGRATIONS_CATEGORIES.AUTOMATION,       key: INTEGRATIONS_KEYS.KLAVIYO,         src_icon: "assets/img/int/klaviyo-icon.png",            src_logo: "assets/img/int/klaviyo-logo.png",            pro: true,  plan: 'Premium' },
    MAILCHIMP:          { name: "Mailchimp",        category: INTEGRATIONS_CATEGORIES.EMAIL,            key: INTEGRATIONS_KEYS.MAILCHIMP,       src_icon: "assets/img/int/mailchimp-icon.png",          src_logo: "assets/img/int/mailchimp-logo.png",          pro: true,  plan: 'Premium' },
    MAKE:               { name: "Make",             category: INTEGRATIONS_CATEGORIES.INT_PLAT,         key: INTEGRATIONS_KEYS.MAKE,            src_icon: "assets/img/int/make-icon.png",               src_logo: "assets/img/int/make-logo.svg",               pro: true,  plan: 'Basic'},
    PIPEDRIVE:          { name: "Pipedrive",        category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.PIPEDRIVE,       src_icon: "assets/img/int/pipedrive-icon.png",          src_logo: "assets/img/int/pipedrive-logo.png",          pro: true,  plan: 'Premium' },
    SALESFORCE:         { name: "Salesforce",       category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.SALESFORCE,      src_icon: "assets/img/int/salesforce-icon.png",         src_logo: "assets/img/int/salesforce-logo.png",         pro: true,  plan: 'Premium' },
    ZAPIER:             { name: "Zapier",           category: INTEGRATIONS_CATEGORIES.INT_PLAT,         key: INTEGRATIONS_KEYS.ZAPIER,          src_icon: "assets/img/int/zapier-icon.png",             src_logo: "assets/img/int/zapier-logo.svg",             pro: true,  plan: 'Basic' },
    ZENDESK:            { name: "Zendesk",          category: INTEGRATIONS_CATEGORIES.LIVE_CHAT,        key: INTEGRATIONS_KEYS.ZENDESK,         src_icon: "assets/img/int/zendesk-icon.png",            src_logo: "assets/img/int/zendesk-logo.png",            pro: true,  plan: 'Premium' },
    ZOHO:               { name: "Zoho",             category: INTEGRATIONS_CATEGORIES.OTHER,            key: INTEGRATIONS_KEYS.ZOHO,            src_icon: "assets/img/int/zoho-icon.png",               src_logo: "assets/img/int/zoho-logo.png",               pro: true,  plan: 'Premium' }

    // NEXT
    //GSHEETS: { name: "Google Sheets'", category: INTEGRATIONS_CATEGORIES.STORAGE, type: INTEGRATIONS_KEYS.GSHEETS, src: "assets/cds/images/actions/google_sheets.png" }
}

export const INTEGRATION_LIST_ARRAY = [
    { name: "Brevo",            category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.BREVO,           src_icon: "assets/img/int/brevo-icon.png",              src_logo: "assets/img/int/brevo-logo.png",              pro: true,  plan: 'Premium' },
    { name: "Customer.io",      category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.CUSTOMERIO,      src_icon: "assets/img/int/customerio-icon.png",         src_logo: "assets/img/int/customerio-logo.svg",         pro: true,  plan: 'Premium' },
    { name: "HubSpot",          category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.HUBSPOT,         src_icon: "assets/img/int/hubspot-icon.png",            src_logo: "assets/img/int/hubspot-logo.svg",            pro: true,  plan: 'Premium' },
    { name: "OpenAI",           category: INTEGRATIONS_CATEGORIES.AI,               key: INTEGRATIONS_KEYS.OPENAI,          src_icon: "assets/img/int/openai-icon.svg",             src_logo: "assets/img/int/openai-logo.svg",             pro: true,  plan: 'Sandbox' },
    { name: "Qapla'",           category: INTEGRATIONS_CATEGORIES.ECOMMERCE,        key: INTEGRATIONS_KEYS.QAPLA,           src_icon: "assets/img/int/qapla-icon.jpg",              src_logo: "assets/img/int/qapla-logo.png",              pro: true,  plan: 'Premium' },
    { name: "Active Campaign",  category: INTEGRATIONS_CATEGORIES.COMMUNICATION,    key: INTEGRATIONS_KEYS.ACTIVE_CAMPAIGN, src_icon: "assets/img/int/active-campaign-icon.jpeg",   src_logo: "assets/img/int/active-campaign-logo.png",    pro: true,  plan: 'Premium' },
    { name: "Jira",             category: INTEGRATIONS_CATEGORIES.OTHER,            key: INTEGRATIONS_KEYS.JIRA,            src_icon: "assets/img/int/jira-icon.png",               src_logo: "assets/img/int/jira-logo.png",               pro: true,  plan: 'Premium'},
    { name: "Klaviyo",          category: INTEGRATIONS_CATEGORIES.AUTOMATION,       key: INTEGRATIONS_KEYS.KLAVIYO,         src_icon: "assets/img/int/klaviyo-icon.png",            src_logo: "assets/img/int/klaviyo-logo.png",            pro: true,  plan: 'Premium' },
    { name: "Mailchimp",        category: INTEGRATIONS_CATEGORIES.EMAIL,            key: INTEGRATIONS_KEYS.MAILCHIMP,       src_icon: "assets/img/int/mailchimp-icon.png",          src_logo: "assets/img/int/mailchimp-logo.png",          pro: true,  plan: 'Premium' },
    { name: "Make",             category: INTEGRATIONS_CATEGORIES.INT_PLAT,         key: INTEGRATIONS_KEYS.MAKE,            src_icon: "assets/img/int/make-icon.png",               src_logo: "assets/img/int/make-logo.svg",               pro: true,  plan: 'Basic'},
    { name: "Pipedrive",        category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.PIPEDRIVE,       src_icon: "assets/img/int/pipedrive-icon.png",          src_logo: "assets/img/int/pipedrive-logo.png",          pro: true,  plan: 'Premium' },
    { name: "Salesforce",       category: INTEGRATIONS_CATEGORIES.CRM,              key: INTEGRATIONS_KEYS.SALESFORCE,      src_icon: "assets/img/int/salesforce-icon.png",         src_logo: "assets/img/int/salesforce-logo.png",         pro: true,  plan: 'Premium' },
    { name: "Zapier",           category: INTEGRATIONS_CATEGORIES.INT_PLAT,         key: INTEGRATIONS_KEYS.ZAPIER,          src_icon: "assets/img/int/zapier-icon.png",             src_logo: "assets/img/int/zapier-logo.svg",             pro: true,  plan: 'Basic' },
    { name: "Zendesk",          category: INTEGRATIONS_CATEGORIES.LIVE_CHAT,        key: INTEGRATIONS_KEYS.ZENDESK,         src_icon: "assets/img/int/zendesk-icon.png",            src_logo: "assets/img/int/zendesk-logo.png",            pro: true,  plan: 'Premium' },
    { name: "Zoho",             category: INTEGRATIONS_CATEGORIES.OTHER,            key: INTEGRATIONS_KEYS.ZOHO,            src_icon: "assets/img/int/zoho-icon.png",               src_logo: "assets/img/int/zoho-logo.png",               pro: true,  plan: 'Premium' }
    
    // NEXT
    // { name: "Google Sheets'", category: INTEGRATIONS_CATEGORIES.STORAGE, type: INTEGRATIONS_KEYS.GSHEETS, src: "assets/cds/images/actions/google_sheets.png" }
]

export function getKeyByValue(value, keys) {
    const indexOfS = Object.values(keys).indexOf(value as unknown as any);
    const key = Object.keys(keys)[indexOfS];
    return key;
}


// MODELS

export class Integration {
    name: string;
    value: Object;
}

export class OpenaiIntegration extends Integration {
    constructor() {
        super();
        this.name = INTEGRATIONS_KEYS.OPENAI;
        this.value = {
            apikey: null,
            organization: null
        }
    }
}

export class QaplaIntegration extends Integration {
    constructor() {
        super();
        this.name = INTEGRATIONS_KEYS.QAPLA;
        this.value = {
            apikey: null
        }
    }
}

export class HubspotIntegration extends Integration {
    constructor() {
        super();
        this.name = INTEGRATIONS_KEYS.HUBSPOT;
        this.value = {
            apikey: null
        }
    }
}

export class CustomerioIntegration extends Integration {
    constructor() {
        super();
        this.name = INTEGRATIONS_KEYS.CUSTOMERIO;
        this.value = {
            apikey: null,
            siteid: null
        }
    }
}

export class BrevoIntegration extends Integration {
    constructor() {
        super();
        this.name = INTEGRATIONS_KEYS.BREVO;
        this.value = {
            apikey: null
        }
    }
}
