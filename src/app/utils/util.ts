export function members_as_html(members: object, requester_id: string, currentUserFireBaseUID: string): string {
    if (!members) {
        return ''
    }
    let members_as_string = '';
    Object.keys(members).forEach(m => {
        if ((m !== 'system') && (m !== requester_id)) {
            // console.log('UTILS - MEMBER ', m)

            // NEW: GET THE USER NAME (FROM LOCAL STORAGE) USING THE MEMBER ID
            const user = JSON.parse((localStorage.getItem(m)));
            // console.log('UTILS - USER GET FROM STORAGE BY MEMBER ID ', user);

            // console.log('UTILS - CURRENT USER UID ', currentUserFireBaseUID);
            if (user) {
                const user_firstname = user['firstname']
                // console.log('UTILS - USER NAME - GET FROM STORAGE BY MEMBER ID ', user_firstname);
                members_as_string += '- ' + user_firstname + ' <br>';
                if (currentUserFireBaseUID === m) {
                    members_as_string = members_as_string.replace(user['firstname'], '<strong>ME</strong>');
                }
            } else {

                members_as_string += '- ' + m + ' <br>';
                members_as_string = members_as_string.replace(currentUserFireBaseUID, '<strong>ME</strong>');
            }

        }

    });
    return members_as_string
}


export function currentUserUidIsInMembers(members: object, currentUserFireBaseUID: string, request_id: string): boolean {
    // console.log('- MEMBERS ', members)
    // console.log('- CURRENT_USER_JOINED ', currentUserFireBaseUID)

    // if (!members) {
    //     return ''
    // }
    let currentUserIsJoined = false
    Object.keys(members).forEach(m => {

        if (m === currentUserFireBaseUID) {
            // console.log('»»»»»»» UTILS MEMBERS ', members)
            // console.log('»»»»»»» CURRENT_USER_JOINED ', currentUserFireBaseUID);
            currentUserIsJoined = true;
            // console.log('»»»»»»» CURRENT USER ', currentUserFireBaseUID, 'is JOINED ?', currentUserIsJoined, 'to the request ', request_id);
            return
        }
    });
    // console.log('»»»»»»» CURRENT USER ', currentUserFireBaseUID, ' is JOINED ?', currentUserIsJoined, 'to the request ', request_id);
    return currentUserIsJoined;
}

export function avatarPlaceholder(requester_fullname) {
    let initials = '';
    if (requester_fullname) {
        const arrayName = requester_fullname.split(' ');
        arrayName.forEach(member => {
            if (member.trim().length > 1 && initials.length < 3) {
                initials += member.substring(0, 1).toUpperCase();
            }
        });
    }
    // console.log('»»»»»»» UTILS avatarPlaceholder------------->', requester_fullname, initials);
    return initials;
}

export function getColorBck(requester_fullname) {
    // const arrayBckColor = ['#fba76f', '#80d066', '#73cdd0', '#ecd074', '#6fb1e4', '#f98bae'];
    const arrayBckColor = ['#E17076', '#7BC862', '#65aadd', '#a695e7', '#ee7aae', '#6ec9cb', '#faa774'];
    let num = 0;
    if (requester_fullname) {
        // const code = requester_fullname.charCodeAt(0);
        const code = requester_fullname.charCodeAt((requester_fullname.length - 1));
        num = Math.round(code % arrayBckColor.length);
        // console.log('************** code', requester_fullname.length, code, arrayBckColor.length, num);
    }
    // console.log('»»»»»»» UTILS getColorBck ------------->', requester_fullname, arrayBckColor[num]);
    return arrayBckColor[num];
}


export function htmlEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    // .replace(/\n/g, '<br>')
}

export function replaceEndOfLine(text) {
    // const newText =   text.replace(/\n/g, '<br>')
    const newText = text.replace(/[\n\r]/g, '<br>');
    // const newText = text.replace(/<br\s*[\/]?>/gi, '\n')
    return newText;
}



//LOG LEVEL
// export enum LogLevel {
//     // Off = 0,
//     // Info = 1,
//     // Debug = 2,
//     // Warn = 3,
//     // Error = 4,
//     // All = 5,

//     Error = 0,
//     Warn = 1,
//     Info = 2,
//     Debug = 3
// }

export const LogLevel = {
    'ERROR': 0,
    'WARN': 1,
    'INFO': 2,
    'DEBUG': 3
}


// Links to documentation
export const URL_understanding_default_roles = 'https://gethelp.tiledesk.com/articles/understanding-default-roles/' // 'https://docs.tiledesk.com/knowledge-base/understanding-default-roles/'
export const URL_getting_started_with_triggers = 'https://gethelp.tiledesk.com/articles/getting-started-with-triggers/' // 'https://docs.tiledesk.com/knowledge-base/getting-started-with-triggers/'
export const URL_creating_groups = 'https://gethelp.tiledesk.com/articles/creating-groups/' // 'https://docs.tiledesk.com/knowledge-base/creating-groups/'

export const URL_microlanguage_for_dialogflow_images_videos = 'https://docs.tiledesk.com/knowledge-base/microlanguage-for-dialogflow-images-videos/'; // NOT FOUND on gethelp
export const URL_dialogflow_connector_handoff_to_human_agent_example = 'https://gethelp.tiledesk.com/articles/dialogflow-connector-handoff-to-human-agent-example/' // 'https://docs.tiledesk.com/knowledge-base/dialogflow-connector-handoff-to-human-agent-example/'
export const URL_styling_your_chatbot_replies = 'https://gethelp.tiledesk.com/articles/styling-your-chatbot-replies/'  // https://docs.tiledesk.com/knowledge-base/styling-your-chatbot-replies/ 
export const URL_response_bot_images_buttons_videos_and_more = 'https://docs.tiledesk.com/knowledge-base/response-bot-images-buttons-videos-and-more/'; // NOT FOUND on gethelp
export const URL_handoff_to_human_agents = 'https://gethelp.tiledesk.com/articles/handoff-to-human-agents/' // https://docs.tiledesk.com/knowledge-base/handoff-to-human-agents/
export const URL_configure_your_first_chatbot = 'https://gethelp.tiledesk.com/articles/configure-your-first-chatbot/' //  https://docs.tiledesk.com/knowledge-base/configure-your-first-chatbot/ 
export const URL_connect_your_dialogflow_agent = 'https://docs.tiledesk.com/knowledge-base/connect-your-dialogflow-agent/'; // NOT FOUND on gethelp
export const URL_advanced_chatbot_styling_buttons = 'https://gethelp.tiledesk.com/articles/advanced-chatbot-styling-buttons/'; // https://docs.tiledesk.com/knowledge-base/advanced-chatbot-styling-buttons/

export const URL_getting_started_for_admins = 'https://gethelp.tiledesk.com/categories/getting-started-for-admins/' // https://docs.tiledesk.com/knowledge-base-category/getting-started-for-admins/
export const URL_getting_started_for_agents = 'https://gethelp.tiledesk.com/categories/getting-started-for-agents/' //'https://docs.tiledesk.com/knowledge-base-category/getting-started-for-agents/'
export const URL_google_tag_manager_add_tiledesk_to_your_sites = 'https://docs.tiledesk.com/knowledge-base/google-tag-manager-add-tiledesk-to-your-sites/' // NOT FOUND on gethelp
export const URL_setting_up_automatic_assignment = 'https://gethelp.tiledesk.com/articles/setting-up-automatic-assignment/' // https://docs.tiledesk.com/knowledge-base/setting-up-automatic-assignment/
export const URL_dialogflow_connector =  'https://gethelp.tiledesk.com/articles/dialogflow-connector/'

