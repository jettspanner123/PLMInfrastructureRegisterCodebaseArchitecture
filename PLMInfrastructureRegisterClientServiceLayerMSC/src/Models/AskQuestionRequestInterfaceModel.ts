export default interface AskQuestionRequestInterfaceModel {
  question: string;
  // Omit to start a new conversation - the backend creates one implicitly
  // and returns its id in the response. Present (from a prior response, or
  // from resuming a past conversation via the sidebar) to continue it.
  conversationId?: string;
  // AnonymousClientIdentityUtility's per-browser id - see
  // ApplicationUserPreferenceKeyCON.ANONYMOUS_CLIENT_ID.
  clientId: string;
}
