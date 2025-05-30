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
  isStreaming?: boolean;
  planning?: string;
  showPlanning?: boolean;
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 1000;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

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

    // Create a placeholder message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      planning: '',
      showPlanning: false,
    };

    setMessages(prev => [...prev, initialAssistantMessage]);

    try {
      // Get API key from environment variable
      const apiKey = import.meta.env.VITE_OPENAI_KEY;

      // Stream handler to update message content in real-time
      const handleStreamUpdate = (content: string) => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content, isStreaming: true } 
              : msg
          )
        );
      };

      // Generate planning first
      let planning = '';
      try {
        planning = await LLMService.generatePlanning({
          prompt: userMessage.content,
          apiKey: apiKey,
          onStreamUpdate: handleStreamUpdate
        });
      } catch (error) {
        console.error('Error generating planning:', error);
      }
      console.log(planning);
      
      // Update the message with planning
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, planning, content: "Generating app based on planning...", isStreaming: true } 
            : msg
        )
      );
      
      // Use the LLM service with streaming for the final app generation
      const response = await LLMService.generateApp({
        userRequest: userMessage.content,
        apiKey: apiKey,
        onStreamUpdate: handleStreamUpdate
      });
      
      // Update with final content and app data
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: response.content, 
                isStreaming: false,
                planning,
                generatedApp: response.html ? {
                  html: response.html,
                  meta: response.meta || {}
                } : undefined
              } 
            : msg
        )
      );
    } catch (error) {
      console.error('Error generating response:', error);
      // Update the streaming message with error content
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: 'Sorry, I encountered an error while generating your app. Please try again!\n\nYou can still use the demo apps by asking for "calculator", "todo list", "timer", etc.',
                isStreaming: false
              } 
            : msg
        )
      );
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

  // Toggle full-screen mode for the textarea
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    // Wait for state update and DOM changes, then focus the textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  const togglePlanning = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, showPlanning: !msg.showPlanning } 
          : msg
      )
    );
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
              <div key={message.id} className={`message ${message.role} ${message.isStreaming ? 'streaming' : ''}`}>
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-line' }} className="message-text">{message.content}</p>
                  {message.isStreaming && (
                    <span className="streaming-indicator">▌</span>
                  )}
                  
                  {/* Planning drawer toggle button - only show if planning exists */}
                  {message.planning && (
                    <div className="planning-toggle">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlanning(message.id);
                        }}
                        className="planning-toggle-button"
                      >
                        {message.showPlanning ? '▼ Hide Planning' : '▶ Show Planning'}
                      </button>
                      
                      {/* Collapsible planning drawer */}
                      {message.showPlanning && (
                        <div className="planning-drawer">
                          <h4>Planning Step</h4>
                          <pre className="planning-content">{message.planning}</pre>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {message.generatedApp && !message.isStreaming && (
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
            {isGenerating && !messages.some(m => m.isStreaming) && (
              <div className="message assistant">
                <div className="message-content">
                  <p className="typing-indicator">BigBox AI is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className={`modal-footer ${isFullScreen ? 'fullscreen-input' : ''}`}>
          <div className="chat-input">
            <textarea
              ref={textareaRef}
              id="chat-input"
              placeholder="Describe the app you want to create... (Press Enter to send)"
              value={inputText}
              onChange={(e) => {
                  setInputText(e.target.value);
                  adjustTextareaHeight();
                  
              }}
              onKeyDown={(e) => {
                // Send on Enter (unless Shift is pressed for new line)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                  if (isFullScreen) {
                    toggleFullScreen();
                  }
                }
              }}
              disabled={isGenerating}
              rows={1}
              style={{ resize: 'none' }}
              className={isFullScreen ? 'fullscreen' : ''}
            />
            <div className="input-controls">
              <button 
                onClick={toggleFullScreen}
                className="fullscreen-button"
                aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
                type="button"
              >
                {isFullScreen ? '⟱' : '⟰'}
              </button>
              <span className={`char-count ${inputText.length > MAX_CHARS * 0.8 ? 'warning' : ''}`}>
                {inputText.length}
              </span>
              <button 
                onClick={() => {
                  handleSendMessage();
                  if (isFullScreen) {
                    toggleFullScreen();
                  }
                }}
                disabled={!inputText.trim() || isGenerating}
                className="send-button"
                aria-label="Send message"
              >
                {isGenerating ? '...' : '📤'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 