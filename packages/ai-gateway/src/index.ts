export interface CompletionRequest {
  sessionId?: string;
  messages: any[];
}

export interface CompletionResponse {
  content: string;
  finishReason: string;
}

export class AIGateway {
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    // Mock response for now
    return {
      content: "This is a mock AI response.",
      finishReason: "stop",
    };
  }
}
