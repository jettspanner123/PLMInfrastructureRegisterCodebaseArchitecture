// Mirrors the backend's ChatConversationSummaryDTO - one row in the
// sidebar's own conversation list. Messages themselves aren't included here;
// see ChatMessageInterfaceModel, fetched separately only once a specific
// conversation is opened.
export default interface ChatConversationSummaryInterfaceModel {
  id: string;
  title: string;
  updatedAt: string;
}
