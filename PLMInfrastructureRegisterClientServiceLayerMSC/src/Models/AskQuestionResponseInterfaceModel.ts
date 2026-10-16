export default interface AskQuestionResponseInterfaceModel {
  answer: string;
  // Always present - the conversation this turn was saved into, whether
  // that's the one already passed in the request or a brand new one
  // created because the request's own conversationId was omitted.
  conversationId: string;
}
