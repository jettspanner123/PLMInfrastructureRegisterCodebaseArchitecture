import type ClarifyingQuestionInterfaceModel from './ClarifyingQuestionInterfaceModel';

export default interface AskQuestionResponseInterfaceModel {
  // Null when the turn paused on a clarifying question instead of producing
  // a final answer - exactly one of answer/pendingQuestion is populated.
  answer: string | null;
  // Always present - the conversation this turn was saved into, whether
  // that's the one already passed in the request or a brand new one
  // created because the request's own conversationId was omitted.
  conversationId: string;
  // Non-null when the assistant needs the user to answer something before
  // it can continue.
  pendingQuestion: ClarifyingQuestionInterfaceModel | null;
}
