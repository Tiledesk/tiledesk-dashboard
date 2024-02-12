export interface KbSettings {
    _id?: string;
    id_project: string;
    gptkey: string;
    maxKbsNumber: number;
    maxPagesNumber: number;
    kbs: KB[];
}

export interface KB {
    _id?: string;
    type?: string;
    id_project?: string;
    namespace?: string;
    source?: string;
    name?: string;
    url?: string;
    content?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status?: number;
    deleting?: boolean;
}