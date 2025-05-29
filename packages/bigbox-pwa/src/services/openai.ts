import OpenAI from 'openai';
import type { ChatCompletionCreateParams } from 'openai/resources/chat/completions';

/**
 * OpenAI service for handling API requests to GPT-4o
 */
export class OpenAIService {
  private static client: OpenAI | null = null;
  
  /**
   * Initialize the OpenAI client with the API key
   */
  static initialize(apiKey: string): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: apiKey.trim(),
        dangerouslyAllowBrowser: true, // Required for browser usage
      });
    }
    return this.client;
  }
  
  /**
   * Generate a response using GPT-4o with high reasoning capabilities
   */
  static async generateWithGPT4o({
    systemPrompt,
    userPrompt,
    apiKey
  }: {
    systemPrompt: string;
    userPrompt: string;
    apiKey: string;
    temperature?: number;
    maxTokens?: number;
    highReasoning?: boolean;
  }): Promise<string> {
    try {
      const openai = this.initialize(apiKey);
      
      // Configure parameters to enhance reasoning for complex tasks
      const params: ChatCompletionCreateParams = {
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      };
      
      
      const completion = await openai.chat.completions.create(params);
      
      const content = completion.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content received from OpenAI');
      }
      
      return content;
    } catch (error: unknown) {
      console.error('OpenAI API Error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Unknown error occurred';
      
      const apiError = error as { response?: { data?: { error?: { message?: string } }, status?: number }, message?: string };
      
      if (apiError?.response?.data?.error?.message) {
        errorMessage = apiError.response.data.error.message;
      } else if (apiError?.message) {
        errorMessage = apiError.message;
      }
      
      if (apiError?.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      }
      
      throw new Error(`OpenAI Error: ${errorMessage}`);
    }
  }
  
  /**
   * Generate HTML application using GPT-4o
   */
  static async generateApp(prompt: string, apiKey: string): Promise<string> {
    const systemPrompt = `You are BigBox AI, a specialized assistant that creates complete, self-contained HTML micro-apps. 

When a user requests an app, you MUST respond with:
1. A brief description of what you're creating
2. Complete HTML code with embedded CSS and JavaScript

The HTML must be:
- Complete with DOCTYPE, head, and body
- Self-contained (no external dependencies)
- Mobile-friendly and responsive
- Include modern CSS with gradients, animations, smooth interactions
- Have full JavaScript functionality
- Use semantic HTML and accessibility features
- Be production-ready and polished

Always structure your response as:
**Description:** [Brief explanation]

**HTML:**
\`\`\`html
[Complete HTML code]
\`\`\`

Examples of apps you can create:
- Calculators, todo lists, note apps, timers, games
- Utilities like password generators, color pickers, unit converters
- Creative tools like drawing apps, text editors, code formatters
- Educational apps like quizzes, flashcards, learning tools
- Entertainment like puzzles, mini-games, music players

Use advanced reasoning to create highly interactive, well-structured, and bug-free applications.
Think through the user interaction flows, edge cases, and error handling.
Make each app unique, modern, and fully functional!`;

    return await this.generateWithGPT4o({
      systemPrompt,
      userPrompt: prompt,
      apiKey
    });
  }
} 