import { OpenAIService } from './openai';
import { DemoApps } from './demoApps';

interface LLMResponse {
  content: string;
  html?: string;
  meta?: Record<string, unknown>;
}

interface AppGenerationPrompt {
  userRequest: string;
  apiKey?: string;
  onStreamUpdate?: (partialContent: string) => void;
}

const processError = (error: unknown): LLMResponse => {
  console.error('OpenAI API Error:', error);
  
  // Handle specific OpenAI errors
  let errorMessage = 'Unknown error occurred';
  if (error && typeof error === 'object' && 'code' in error) {
    const openaiError = error as { code: string; message?: string };
    if (openaiError.code === 'invalid_api_key') {
      errorMessage = 'Invalid API key. Please check your OpenAI API key configuration.';
    } else if (openaiError.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please check your OpenAI account billing.';
    } else if (openaiError.code === 'rate_limit_exceeded') {
      errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (openaiError.message) {
      errorMessage = openaiError.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  // Return error with specific guidance
  return {
    content: `❌ **AI Generation Failed**\n\nError: ${errorMessage}\n\n🔑 **To fix this:**\n1. Check your OpenAI API key configuration\n2. Ensure you have OpenAI credits available\n3. Visit https://platform.openai.com/account/billing to check your usage\n\n⚠️ **For now, I can only create these basic examples:**\n• "calculator" • "todo list" • "timer"`,
  };
}

export class LLMService {
  static async generatePlanning({prompt, apiKey, onStreamUpdate}: {prompt: string, apiKey: string, onStreamUpdate?: (partialContent: string) => void}): Promise<string> {
    console.log('Generating planning...');
    if (!apiKey || !apiKey.trim()) {
      Error('Invalid API key. Please check your OpenAI API key configuration.');
    }
    try {
      return await OpenAIService.generatePlanning(prompt, apiKey, onStreamUpdate);
    } catch (error: unknown) {
      return processError(error).content;
    }
  }
  static async generateApp({ userRequest, apiKey, onStreamUpdate }: AppGenerationPrompt): Promise<LLMResponse> {
    // Try real AI generation first if API key is provided
    if (apiKey && apiKey.trim()) {
      try {
        // Use the OpenAIService for GPT-4o with high reasoning
        const response = await OpenAIService.generateApp(userRequest, apiKey, onStreamUpdate);
        return this.parseAIResponse(response, userRequest);
      } catch (error: unknown) {
        return processError(error);
      }
    }

    // If no API key, provide guidance and limited examples
    return this.handleNoApiKey(userRequest);
  }

  private static parseAIResponse(response: string, userRequest: string): LLMResponse {
    // Extract HTML from the response
    const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/);
    
    if (!htmlMatch) {
      return {
        content: response,
      };
    }

    const html = htmlMatch[1].trim();
    const description = response.split('**HTML:**')[0]
      .replace('**Description:**', '')
      .trim();

    // Extract title from HTML or generate one
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : this.generateTitle(userRequest);

    return {
      content: description || "I've created a custom app for you!",
      html,
      meta: {
        title,
        description: description || `Custom ${title} created by BigBox AI`,
        category: 'custom',
        version: '1.0',
        createdBy: 'BigBox AI',
        userRequest,
        generatedAt: new Date().toISOString(),
        model: 'o3-mini',
      },
    };
  }

  private static generateTitle(userRequest: string): string {
    const words = userRequest.toLowerCase().split(' ');
    
    // Find app-related words
    const relevantWords = words.filter(word => 
      word.length > 3 && !['create', 'make', 'build', 'please', 'want'].includes(word)
    );
    
    if (relevantWords.length > 0) {
      return relevantWords.slice(0, 2).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') + ' App';
    }
    
    return 'Custom App';
  }

  private static async handleNoApiKey(userRequest: string): Promise<LLMResponse> {
    // Check if this is a demo app request
    const demoType = DemoApps.isDemoApp(userRequest);
    if (demoType) {
      try {
        const demoResponse = await DemoApps.generateApp(demoType);
        return {
          content: demoResponse.content,
          html: demoResponse.html,
          meta: demoResponse.meta,
        };
      } catch (error) {
        // Fall through to the guidance message if demo generation fails
        console.error('Demo app generation failed:', error);
      }
    }

    // For everything else, guide them about API key requirement
    return {
      content: `🔑 **OpenAI API Key Required**\n\nTo build "${userRequest}", an OpenAI API key is required.\n\n**For now, I can only create these examples:**\n• "calculator" - Working calculator with operations\n• "todo list" - Task management app\n• "timer" - Countdown timer with presets\n\n💡 **With an OpenAI API key configured, I can build:**\n• Games (Snake, Tetris, Puzzles, Card games)\n• Utilities (Converters, Generators, Calculators)\n• Creative (Drawing, Music, Photo editors)\n• Business (Expense trackers, Forms, Dashboards)\n• Educational (Quizzes, Flashcards, Learning tools)`,
    };
  }
} 