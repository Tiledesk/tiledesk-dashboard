import { KbSourceProviderId } from 'app/models/kb-sources.model';

/** Messages that name the product, so each provider has its own translation. */
export type KbSourceMessage = 'Waiting' | 'WaitingHint' | 'ErrConnect' | 'ErrAccessDenied' | 'NeedsReconnect'
  | 'DisconnectConfirm' | 'ErrBusy' | 'RefreshHelp' | 'ChooseAccount' | 'WarnFolderNotFound' | 'DeleteFolder';

/** i18n key of `message` for the provider (Microsoft 365 unless it is Google Drive). */
export function sourceMessageKey(provider: KbSourceProviderId | null | undefined, message: KbSourceMessage): string {
  return (provider === 'googledrive' ? 'KbPage.Gdrive' : 'KbPage.Ms365') + message;
}
