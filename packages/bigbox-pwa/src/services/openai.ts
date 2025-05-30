import OpenAI from 'openai';

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
    apiKey,
    onStreamUpdate
  }: {
    systemPrompt: string;
    userPrompt: string;
    apiKey: string;
    temperature?: number;
    maxTokens?: number;
    highReasoning?: boolean;
    onStreamUpdate?: (partialContent: string) => void;
  }): Promise<string> {
    try {
      const openai = this.initialize(apiKey);
      
      // Configure parameters to enhance reasoning for complex tasks
      const params = {
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        reasoning_effort: 'high',
        stream: !!onStreamUpdate,
      };
      
      // Handle streaming if callback is provided
      if (onStreamUpdate) {
        let fullContent = '';
        
        // @ts-expect-error - Using the OpenAI API with streaming
        const stream = await openai.chat.completions.create(params);
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullContent += content;
          onStreamUpdate(fullContent);
        }
        
        return fullContent;
      } else {
        // Non-streaming response
        // @ts-expect-error - Using the OpenAI API
        const completion = await openai.chat.completions.create(params);
        
        const content = completion.choices?.[0]?.message?.content;
        
        if (!content) {
          throw new Error('No response content received from OpenAI');
        }
        
        return content;
      }
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
  
  static async generatePlanning(prompt: string, apiKey: string, onStreamUpdate?: (partialContent: string) => void): Promise<string> {
     const systemPrompt = `You are BigBox AI Planning Assistant. Your role is to analyze undestand user requirements for creating HTML micro-apps.

When a user provides an initial request, you should:

1. **Understand the Core Intent**: Identify what the user fundamentally wants to create
2. **Take Good Assumptions on ambiguous requirements**
4. **Define Technical Requirements**: Specify the technical approach, user interface elements, and functionality needed
5. **Outline User Experience**: Describe how users will interact with the app and key user flows.

Your response should be structured and comprehensive, helping to transform a basic idea into a well-defined specification that will result in a better final application.

Focus on:
- Identifying key features and functionality
- Choosing the best UI/UX
- Considering edge cases and error handling
- Proposing modern web technologies and best practices

Provide a clear, actionable plan that will guide an AI developer to create a polished, user-friendly HTML micro-app.`;
      return await this.generateWithGPT4o({
        systemPrompt,
        userPrompt: prompt,
        apiKey,
        onStreamUpdate
      });
  }
  /**
   * Generate HTML application using GPT-4o
   */
  static async generateApp(prompt: string, apiKey: string, onStreamUpdate?: (partialContent: string) => void): Promise<string> {
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
      apiKey,
      onStreamUpdate
    });
  }
} 