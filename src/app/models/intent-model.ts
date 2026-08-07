
import { v4 as uuidv4 } from 'uuid';

export class Intent {
    webhook_enabled?: boolean;
    enabled?: boolean;
    topic?: string;
    status?: string;
    id_faq_kb?: string;
    question?: string;
    answer?: string;
    actions?: Action[];
    id_project?: string;
    language?: string;
    intent_display_name?: string;
    createdBy?: string;
    intent_id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    id?: string;
    constructor() {
        this.actions = [];
    }
}


export class Action {
    _tdActionType: string;
    _tdActionTitle: string = '';
    _tdActionId: any = uuidv4();
}




