import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type AskQuestionRequestInterfaceModel from '../../../Models/AskQuestionRequestInterfaceModel';
import type AskQuestionResponseInterfaceModel from '../../../Models/AskQuestionResponseInterfaceModel';

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
}
