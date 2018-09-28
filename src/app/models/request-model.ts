export interface Request {
  recipient?: string;
  recipient_fullname?: string;
  sender_fullname?: string;
  text?: string;
  first_text?: string;
  timestamp?: number;
  created_on?: any;
  membersCount?: number;
  support_status?: number;
  members?: any;
  requester_fullname?: string;
  requester_id?: string;
  projectid?: string;

  members_array?: any;

  id?: string;
  request_date_fromnow?: any;
  currentUserIsJoined?: boolean;
  members_as_string?: any;
  served_by?: any;
  notification_already_shown?: boolean;
  agents?: any;
  attributes?: any;
  showRequest?: boolean;
  firebaseDocChangeType?: string;
  rating?: any;
  rating_message?: string;
  participants?: any;
  hasAgent?(user_id: string): boolean;
}

export class Request implements Request {
  hasAgent?(current_user_id: string): boolean {
    // console.log('MODEL REQUEST - USER ID ', current_user_id)

    let found = false
    if (this.agents !== undefined) {
      // console.log('MODEL REQUEST - AGENT ', this.agents)

      this.agents.forEach(agent => {

        // console.log('AGENT - ID USER ', agent.id_user)
        if (current_user_id === agent.id_user) {
          found = true
        }
      });

    }
    return found;
  }

}
