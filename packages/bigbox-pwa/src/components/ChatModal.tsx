import { useState, useRef, useEffect } from 'react';
import { LLMService } from '../services/llm';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  generatedApp?: {
    html: string;
    meta: Record<string, unknown>;
  };
}

interface ChatModalProps {
  onClose: () => void;
  onNewSandbox: (html: string, meta: Record<string, unknown>) => Promise<void>;
}

export function ChatModal({ onClose, onNewSandbox }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "🚀 **Welcome to BigBox AI!**\n\nI can build ANY app you describe - from games to utilities to creative tools!\n\n⚡ **Examples of what I can create:**\n• Snake game, Tic-tac-toe, Memory game\n• Expense tracker, Unit converter, QR generator\n• Drawing canvas, Text editor, Code formatter\n• Quiz app, Flashcards, Learning tools\n• Music player, Photo editor, Mini-games\n\n💡 **Powered by GPT-4o with High Reasoning:**\n• Creates smarter, more interactive apps\n• Better handles complex logic and edge cases\n• Produces cleaner, more maintainable code\n\n**Ready to build something amazing? Describe your app!**",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsGenerating(true);

    try {
      // Get API key from environment variable
      const apiKey = import.meta.env.VITE_OPENAI_KEY;

      // Use the LLM service
      const response = await LLMService.generateApp({
        userRequest: userMessage.content,
        apiKey: apiKey
      });
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        generatedApp: response.html ? {
          html: response.html,
          meta: response.meta || {}
        } : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while generating your app. Please try again!\n\nYou can still use the demo apps by asking for "calculator", "todo list", "timer", etc.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateApp = async (message: ChatMessage) => {
    if (message.generatedApp) {
      try {
        await onNewSandbox(message.generatedApp.html, message.generatedApp.meta);
      } catch (error) {
        console.error('Failed to create app:', error);
        alert('Failed to create app. Please try again.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chat-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🤖 BigBox AI Chat</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="chat-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-line' }}>{message.content}</p>
                  {message.generatedApp && (
                    <div className="generated-app">
                      <p><strong>🎉 App Generated!</strong></p>
                      <button 
                        className="create-app-button"
                        onClick={() => handleCreateApp(message)}
                      >
                        📱 Add to Home Screen
                      </button>
                    </div>
                  )}
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isGenerating && (
              <div className="message assistant">
                <div className="message-content">
                  <p className="typing-indicator">BigBox AI is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="modal-footer">
          <div className="chat-input">
            <input
              type="text"
              placeholder="Describe the app you want to create..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isGenerating}
              maxLength={500}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isGenerating}
              className="send-button"
            >
              📤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 