export interface IRules {
    [id: string]:Rule[]
}

export interface Rule {
    uid: string,
    name: string,
    description?: string,
    when: { urlMatches: string, triggerEvery: number},
    do: [{wait: number},{message: any}]
}