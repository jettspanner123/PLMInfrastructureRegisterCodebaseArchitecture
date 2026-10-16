// Mirrors the backend's ChatMessageDTO - one persisted message within a
// conversation's full history, returned by GET Conversations/{id}/Messages
// when resuming a past conversation from the sidebar.
export default interface ChatMessageInterfaceModel {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}
