export function members_as_html(members: object, requester_id: string, currentUserFireBaseUID: string) {
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
