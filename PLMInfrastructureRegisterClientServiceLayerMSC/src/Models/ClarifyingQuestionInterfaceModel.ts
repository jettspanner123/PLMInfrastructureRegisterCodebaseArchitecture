// Mirrors the backend's ClarifyingQuestionDTO field-for-field - what the
// frontend needs to render the interactive question card, carried inside
// AskQuestionResponseInterfaceModel when a turn pauses instead of producing
// a final answer.
export default interface ClarifyingQuestionInterfaceModel {
  messageId: string;
  // A short title for the card, e.g. "Which environment?".
  heading: string;
  // A longer, plain-language explanation shown muted beneath the heading.
  description: string;
  options: string[] | null;
  allowMultiple: boolean;
}
