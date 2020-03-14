export interface Department {
    _id: string;
    updatedAt: any;
    createdAt: any;
    name: string;
    id_project: string;
    createdBy: string;
    id_bot: string;
    bot_only: boolean;
    id_group: string;
    hasGroupName: string;
    routing: string;
    __v: any;
    // custom
    groupHasBeenTrashed?: boolean;
    botHasBeenTrashed?: boolean;
    hasDeptName?: string;
}
