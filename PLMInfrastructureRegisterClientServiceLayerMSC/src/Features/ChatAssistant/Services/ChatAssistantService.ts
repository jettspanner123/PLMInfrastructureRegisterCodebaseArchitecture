import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type AskQuestionRequestInterfaceModel from '../../../Models/AskQuestionRequestInterfaceModel';
import type AskQuestionResponseInterfaceModel from '../../../Models/AskQuestionResponseInterfaceModel';
import type AnswerQuestionRequestInterfaceModel from '../../../Models/AnswerQuestionRequestInterfaceModel';
import type ChatConversationSummaryInterfaceModel from '../../../Models/ChatConversationSummaryInterfaceModel';
import type ChatMessageInterfaceModel from '../../../Models/ChatMessageInterfaceModel';

export default class ChatAssistantService {
  public static current: ChatAssistantService = new ChatAssistantService();

  public async askQuestion(
    request: AskQuestionRequestInterfaceModel
  ): Promise<AskQuestionResponseInterfaceModel> {
    const response = await fetch(
      `${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/ChatAssistant/AskQuestion`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    const payload: APIResponseInterfaceModel<AskQuestionResponseInterfaceModel> =
      await response.json();

    if (!response.ok || !payload.status) {
      const errorMessage =
        payload.message ||
        (payload.errors && payload.errors.length > 0
          ? payload.errors.join(', ')
          : `Failed to get response from assistant (HTTP ${response.status}).`);
      throw new Error(errorMessage);
    }

    return payload.data;
  }

  // Resolves a pending clarifying question (or a Skip) - a separate endpoint
  // from askQuestion, not an overload of it, since the two requests are
  // semantically different (asking something new vs. resolving a specific
  // paused tool call).
  public async answerQuestion(
    request: AnswerQuestionRequestInterfaceModel
  ): Promise<AskQuestionResponseInterfaceModel> {
    const response = await fetch(
      `${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/ChatAssistant/AnswerQuestion`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    const payload: APIResponseInterfaceModel<AskQuestionResponseInterfaceModel> =
      await response.json();

    if (!response.ok || !payload.status) {
      const errorMessage =
        payload.message ||
        (payload.errors && payload.errors.length > 0
          ? payload.errors.join(', ')
          : `Failed to submit the answer (HTTP ${response.status}).`);
      throw new Error(errorMessage);
    }

    return payload.data;
  }

  public async getConversations(clientId: string): Promise<ChatConversationSummaryInterfaceModel[]> {
    const response = await fetch(
      `${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/ChatAssistant/Conversations?clientId=${encodeURIComponent(clientId)}`
    );

    const payload: APIResponseInterfaceModel<ChatConversationSummaryInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch conversations.');
    }

    return payload.data;
  }

  public async getConversationMessages(conversationId: string): Promise<ChatMessageInterfaceModel[]> {
    const response = await fetch(
      `${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/ChatAssistant/Conversations/${conversationId}/Messages`
    );

    const payload: APIResponseInterfaceModel<ChatMessageInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch the conversation.');
    }

    return payload.data;
  }
}
