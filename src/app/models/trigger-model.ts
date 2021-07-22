export interface Trigger {

    _id?: string,
    updatedAt?: any,
    createdAt?: any,
    name?: string,
    description?: string,
    id_project?: string,
    trigger?: {
        key?: string,
        name?: string,
        _id?: string
    },
    conditions?: {
        _id?: string,
        any?: [
            {
                fact?: string,
                path?: string,
                operator?: string,
                value?: string
            }
        ],
        all?: [
            {
                fact?: string,
                path?: string,
                operator?: string,
                value?: string
            }
        ]
    },
    createdBy?: any,
    __v?: any,
    enabled?: boolean,
    actions?: [
        {
            _id?: string,
            key?: string,
            parameters?: {
                fullName?: string,
                text?: string
            },

        }
    ]
}
