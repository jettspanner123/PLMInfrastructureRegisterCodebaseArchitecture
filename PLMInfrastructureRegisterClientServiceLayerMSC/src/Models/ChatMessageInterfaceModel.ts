// Mirrors the backend's ChatMessageDTO - one persisted message within a
// conversation's full history, returned by GET Conversations/{id}/Messages
// when resuming a past conversation from the sidebar.
export default interface ChatMessageInterfaceModel {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  // "Text" (default) or "ClarifyingQuestion" - discriminates how this row
  // should render (see ChatAssistantSharedComponent's own reload mapping).
  messageKind: 'Text' | 'ClarifyingQuestion';
  // Only set when messageKind is "ClarifyingQuestion" - the raw question
  // payload, re-parsed to reconstruct the card (its options/allowMultiple/
  // text) on reload.
  toolCallArguments: string | null;
  // Null while the question is still pending an answer; set once
  // answered/skipped - lets the card reconstruct its frozen state on reload.
  toolCallOutput: string | null;
  isSkipped: boolean;
}
