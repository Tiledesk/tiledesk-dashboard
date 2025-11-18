export interface ProjectUser {
    attributes?: any;
    createdAt?: string;
    createdBy?: string;
    id?:string;
    id_project?: string;
    id_user?: any;
    isAuthenticated?: boolean;
    isBusy?: boolean;
    last_login_at?: string;
    number_assigned_requests?: number;
    permissions?:any;
    presence?:any;
    profileStatus?: string;
    role?: string;
    roleType?: number;  
    status?: string; 
    tags?:any;
    trashed?: boolean;
    updatedAt?: string;
    user_available?: boolean;
    is_group_member?: boolean;
    __v?: any;
    _id?: string;
}
