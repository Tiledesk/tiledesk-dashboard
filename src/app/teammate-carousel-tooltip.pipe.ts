import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Tooltip text for teammate carousel avatars: name from `id_user`;
 * if `status === 'disabled'` appends the i18n `Disabled` label in parentheses.
 */
@Pipe({ name: 'teammateCarouselTooltip', pure: true })
export class TeammateCarouselTooltipPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(agent: any): string {
    if (!agent) {
      return '';
    }
    const fn = agent?.id_user?.firstname;
    const ln = agent?.id_user?.lastname;
    const parts = [fn, ln]
      .filter((p) => p != null && String(p).trim() !== '')
      .map((p) => String(p).trim());
    const name = parts.join(' ');
    if (agent?.status === 'disabled') {
      const disabledLabel = this.translate.instant('Disabled');
      return name ? `${name} (${disabledLabel})` : `(${disabledLabel})`;
    }
    return name;
  }
}
