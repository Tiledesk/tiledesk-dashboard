export interface Project {
    _id: string;
    updatedAt?: any;
    createdAt?: any;
    name?: string;
    activeOperatingHours?: boolean;
    operatingHours?: any
    createdBy?: string;
    id_project?: any;
    widget?: any;
    settings?: any;
    role?: string;
    user_available?: boolean;
    profile_name?: any;
    profile_agents?: any;
    profile_chatbots?: any;
    profile_kbs?: any;
    trial_expired?: any;
    trialExpired?: any;
    trial_days_left?: number;
    trial_days?: number;
    profile_type?: string;
    subscription_is_active?: any;
    isActiveSubscription?: any;
    profile?: any;
    user_role?:string;
    subscription_end_date?: any;
    subscription_id?: any;
    subscription_creation_date?: any;
    subscription_start_date?: any;
    payActive?: boolean;
    extra1?: string;
    extra2?: string;
    extra3?: string;
    extra4?: string;
    customization?: {
        widgetUnbranding?: boolean;
        smtpSettings?: boolean;
        whatsAppBusiness?: boolean;
        facebookMessenger?: boolean;
        telegram?: boolean;
    }
    __v?: any;
}
