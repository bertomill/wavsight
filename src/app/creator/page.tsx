'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/utils/supabase';
import { TechEvent } from '@/types';
import Editor from '@monaco-editor/react';

export default function CreatorPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I can help you create content. What would you like to create?\n\n1. Blog Article\n2. LinkedIn Post'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<TechEvent | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [editorContent, setEditorContent] = useState('# Start typing your content here...\n\n');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');

  // Loading animation effect
  useEffect(() => {
    if (isGenerating) {
      const timer = setInterval(() => {
        setLoadingDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(timer);
    }
  }, [isGenerating]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');

    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          selectedEventIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant' as const, content: data.message }]);
      
      if (data.generatedContent) {
        setEditorContent(data.generatedContent);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error while generating content. Please try again.'
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-900">
      {/* Left panel - Editor */}
      <div className="w-1/2 border-r border-[rgba(255,255,255,0.1)] flex flex-col">
        <div className="h-12 border-b border-[rgba(255,255,255,0.1)] flex items-center px-4">
          <span className="text-white text-sm">Editor</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={editorContent}
            onChange={(value) => setEditorContent(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* Right panel - Chat interface */}
      <div className="w-1/2 flex flex-col">
        <div className="h-12 border-b border-[rgba(255,255,255,0.1)] flex items-center px-4">
          <span className="text-white text-sm">Chat</span>
        </div>
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                ? 'bg-[#8B4513] text-white' 
                : 'bg-[rgba(255,255,255,0.1)] text-white'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-white focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating}
              className={`px-4 py-2 bg-[#8B4513] text-white rounded-lg transition-colors ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#A0522D]'
              }`}
            >
              {isGenerating ? `Generating${loadingDots}` : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}