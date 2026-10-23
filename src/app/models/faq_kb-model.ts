export interface FaqKb {
    _id?: string;
    updatedAt?: Date;
    createdAt?: Date;
    name?: string;
    url?: string;
    webhook_enabled?: boolean;
    webhook_url?: string;
    kbkey_remote?: string;
    id_project?: string;
    createdBy?: string;
    __v?: any;
    has_faq?: any;
    faqs_number?: number;
    external?: boolean;
    type?: string;
    description?: string;
    message_count?: number;
    mainCategory?: any
    language?: string;
    subtype?: string;
  
}

export interface Chatbot extends FaqKb {
    attributes?: any
    /** 'v3' for an agent of the new Design Studio (a field of the bot since server 2.30.0). */
    ds_version?: string;
    /** V3 agents: the connectors list; the server returns it only with the single GET of a bot. */
    connectors?: any;
    public?: boolean;
    certified?: boolean;
    tags?: any;
    title?: string;
    short_description?: string;
    certifiedTags?: Array<{color: string, name: string}>;
    intentsEngine?: 'none' | 'tiledesk-ai'
}