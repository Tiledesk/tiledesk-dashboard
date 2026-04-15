export interface KnowledgeBases2UiState {
  showSpinner: boolean;
  showKbTableSpinner: boolean;
  showUqTableSpinner: boolean;
  isLoadingNamespaces: boolean;
}

export const KB2_UI_INITIAL_STATE: KnowledgeBases2UiState = {
  showSpinner: true,
  showKbTableSpinner: false,
  showUqTableSpinner: false,
  isLoadingNamespaces: true,
};

