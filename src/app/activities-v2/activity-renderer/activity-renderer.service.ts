import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Activity } from '../../models/activity-model';

@Injectable()
export class ActivityRendererService {

  constructor(private translate: TranslateService) { }

  render(activity: Activity): string {
    if (!activity?.verb) {
      return activity?.message || '';
    }

    const actor = this.actorName(activity);
    const conversation = this.conversationLabel(activity);
    const assignee = this.resolveAgentName(activity, activity.actionObj?.assigneeId);
    const previous = this.resolveAgentName(activity, activity.actionObj?.previousAssigneeId);
    const targetUser = this.targetUserName(activity);
    const target = this.targetUserName(activity);
    const email = activity.actionObj?.email || activity.target?.object?.id_user?.email || '';
    const role = activity.actionObj?.role || '';

    switch (activity.verb) {

      case 'REQUEST_ASSIGNED_SELF':
        return this.t('ACTIVITY.REQUEST_ASSIGNED_SELF', { actor, conversation });

      case 'REQUEST_ASSIGNED_AUTO':
        return activity.actor?.type === 'system'
          ? this.t('ACTIVITY.REQUEST_ASSIGNED_AUTO_SYSTEM', { assignee, conversation })
          : this.t('ACTIVITY.REQUEST_ASSIGNED_AUTO_TRIGGERED', { assignee, conversation, actor });

      case 'REQUEST_ASSIGNED_MANUAL':
        return activity.actionObj?.previousAssigneeId
          ? this.t('ACTIVITY.REQUEST_ASSIGNED_MANUAL_REPLACED', { assignee, conversation, actor, previous })
          : this.t('ACTIVITY.REQUEST_ASSIGNED_MANUAL', { assignee, conversation, actor });

      case 'REQUEST_UNASSIGNED':
        return this.t('ACTIVITY.REQUEST_UNASSIGNED', { actor, assignee, conversation });

      case 'REQUEST_CREATE':
        return this.t('ACTIVITY.REQUEST_CREATE', { actor });

      case 'REQUEST_CLOSE':
        return this.t('ACTIVITY.REQUEST_CLOSE', { actor, conversation });

      case 'PROJECT_USER_AVAILABILITY_SELF':
        return this.t('ACTIVITY.PROJECT_USER_AVAILABILITY_SELF', {
          targetUser,
          previousStatus: this.statusLabel(activity.actionObj?.previousStatus),
          newStatus: this.statusLabel(activity.actionObj?.newStatus),
        });

      case 'PROJECT_USER_AVAILABILITY_SYSTEM':
        return this.t('ACTIVITY.PROJECT_USER_AVAILABILITY_SYSTEM', {
          targetUser,
          newStatus: this.statusLabel(activity.actionObj?.newStatus),
        });

      case 'PROJECT_USER_INVITE':
        return this.t('ACTIVITY.PROJECT_USER_INVITE', { actor, target, email, role: this.translateRole(role) });

      case 'PROJECT_USER_DELETE':
        return this.t('ACTIVITY.PROJECT_USER_DELETE', { actor, target });

      case 'PROJECT_USER_UPDATE':
        return this.renderProjectUserUpdate(activity, actor, target);

      default:
        return activity.message || String(activity.verb);
    }
  }

  getIconForVerb(verb: string): string {
    switch (verb) {
      case 'PROJECT_USER_INVITE':
        return 'assets/img/user-plus-solid.svg';
      case 'PROJECT_USER_DELETE':
        return 'assets/img/user-minus-solid.svg';
      case 'PROJECT_USER_UPDATE':
      case 'PROJECT_USER_AVAILABILITY_SELF':
      case 'PROJECT_USER_AVAILABILITY_SYSTEM':
        return 'assets/img/user-edit-solid.svg';
      case 'REQUEST_CREATE':
        return 'assets/img/comment-medical-solid.svg';
      case 'REQUEST_CLOSE':
        return 'assets/img/comment-resolved.svg';
      case 'REQUEST_ASSIGNED_AUTO':
      case 'REQUEST_ASSIGNED_SELF':
      case 'REQUEST_ASSIGNED_MANUAL':
        return 'assets/img/user-check-solid.svg';
      case 'REQUEST_UNASSIGNED':
        return 'assets/img/user-times-solid.svg';
      default:
        return 'assets/img/user-edit-solid.svg';
    }
  }

  actorName(activity: Activity): string {
    if (activity.actor?.type === 'system') {
      return this.t('ACTIVITY.SYSTEM');
    }
    return activity.actor?.name || activity.actor?.id || this.t('ACTIVITY.SOMEONE');
  }

  conversationLabel(activity: Activity): string {
    const request = activity.target?.object;
    return request?.request_id || activity.target?.id || this.t('ACTIVITY.CONVERSATION');
  }

  resolveAgentName(activity: Activity, userId?: string | null): string {
    if (!userId) {
      return this.t('ACTIVITY.UNKNOWN_AGENT');
    }

    const agents = activity.target?.object?.participatingAgents;
    if (Array.isArray(agents)) {
      for (const agent of agents) {
        const user = agent.id_user || agent;
        const id = String(user._id || user.id || user);
        if (id === String(userId)) {
          const name = [user.firstname, user.lastname].filter(Boolean).join(' ').trim();
          if (name) {
            return name;
          }
        }
      }
    }

    return String(userId);
  }

  targetUserName(activity: Activity): string {
    const user = activity.target?.object?.id_user;
    if (user) {
      const name = [user.firstname, user.lastname].filter(Boolean).join(' ').trim();
      if (name) {
        return name;
      }
    }
    return this.t('ACTIVITY.SOMEONE');
  }

  isSelfUpdate(activity: Activity): boolean {
    if (!activity.actor?.id || !activity.target?.object?.id_user?._id) {
      return false;
    }
    return String(activity.actor.id) === String(activity.target.object.id_user._id);
  }

  private renderProjectUserUpdate(activity: Activity, actor: string, target: string): string {
    const actionObj = activity.actionObj || {};

    if (this.isSelfUpdate(activity)) {
      if (actionObj.user_available === true) {
        return this.t('ACTIVITY.PROJECT_USER_UPDATE_SELF_AVAILABLE', { actor });
      }
      if (actionObj.user_available === false) {
        return this.t('ACTIVITY.PROJECT_USER_UPDATE_SELF_UNAVAILABLE', { actor });
      }
    }

    if (actionObj.user_available === true || actionObj.user_available === false) {
      const status = actionObj.user_available
        ? this.t('ACTIVITY.STATUS.available')
        : this.t('ACTIVITY.STATUS.unavailable');
      return this.t('ACTIVITY.PROJECT_USER_UPDATE_AVAILABILITY', { actor, target, status });
    }

    if (actionObj.role === 'admin') {
      return this.t('ACTIVITY.PROJECT_USER_UPDATE_ROLE_ADMIN', { actor, target });
    }

    if (actionObj.role === 'agent') {
      return this.t('ACTIVITY.PROJECT_USER_UPDATE_ROLE_AGENT', { actor, target });
    }

    return activity.message || this.t('ACTIVITY.PROJECT_USER_UPDATE_GENERIC', { actor, target });
  }

  private statusLabel(status?: string | null): string {
    if (!status) {
      return '';
    }
    const key = `ACTIVITY.STATUS.${status}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : status;
  }

  private translateRole(role: string): string {
    if (!role) {
      return '';
    }
    const translated = this.translate.instant(role);
    return translated !== role ? translated : role;
  }

  private t(key: string, params?: Record<string, string>): string {
    return this.translate.instant(key, params);
  }
}
