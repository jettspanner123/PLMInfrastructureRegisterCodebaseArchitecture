// Mirrors the backend's AnswerQuestionRequestDTO field-for-field.
export default interface AnswerQuestionRequestInterfaceModel {
  conversationId: string;
  messageId: string;
  // Mutually exclusive with freeTextAnswer.
  selectedOptions: string[] | null;
  // Mutually exclusive with selectedOptions.
  freeTextAnswer: string | null;
  // Distinct from an empty answer - the user explicitly declined to answer.
  isSkipped: boolean;
}
