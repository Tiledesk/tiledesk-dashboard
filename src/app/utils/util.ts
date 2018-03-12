export function members_as_html(members: object, requester_id: string, currentUserFireBaseUID: string): string {
    if (!members) {
        return ''
    }
    let members_as_string = '';
    Object.keys(members).forEach(m => {
        if ((m !== 'system') && (m !== requester_id)) {
            members_as_string += '- ' + m + ' <br>';
            members_as_string = members_as_string.replace(currentUserFireBaseUID, '<strong>ME</strong>');
        }

    });
    return members_as_string
}

export function currentUserUidIsInMembers(members: object, currentUserFireBaseUID: string): boolean {
    // console.log('- MEMBERS ', members)
    // console.log('- CURRENT_USER_JOINED ', currentUserFireBaseUID)

    // if (!members) {
    //     return ''
    // }
    let currentUserIsJoined = false
    Object.keys(members).forEach(m => {

        if (m === currentUserFireBaseUID) {
            console.log('- MEMBERS ', members)
            console.log('- CURRENT_USER_JOINED ', currentUserFireBaseUID);
            currentUserIsJoined = true;
            return
        }
    });
    return currentUserIsJoined;
}
