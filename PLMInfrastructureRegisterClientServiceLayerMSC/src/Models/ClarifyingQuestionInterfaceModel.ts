// Mirrors the backend's ClarifyingQuestionDTO field-for-field - what the
// frontend needs to render the interactive question card, carried inside
// AskQuestionResponseInterfaceModel when a turn pauses instead of producing
// a final answer.
export default interface ClarifyingQuestionInterfaceModel {
  messageId: string;
  questionText: string;
  options: string[] | null;
  allowMultiple: boolean;
}
