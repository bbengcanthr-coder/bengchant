import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from './types';
import { sendGeminiMessage } from './services/geminiService';
import { BCU_BLUE, UNKNOWN_INFO_RESPONSE } from './constants';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[75%] rounded-lg p-3 shadow-md ${
          isUser
            ? `bg-gray-800 text-white rounded-br-none`
            : `bg-white text-gray-800 rounded-bl-none border border-gray-200`
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
      <input
        type="text"
        className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
        // Remove the invalid 'focusRingColor' property. Tailwind CSS 'focus:ring' classes handle the focus ring.
        style={{ borderColor: BCU_BLUE }}
        placeholder="พิมพ์คำถามถึงพี่สมเด็จ..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <button
        type="submit"
        className={`ml-3 px-6 py-3 rounded-full text-white font-semibold flex items-center justify-center transition-colors duration-200 ${
          isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'
        }`}
        style={{ backgroundColor: BCU_BLUE }}
        disabled={isLoading}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          'ส่ง'
        )}
      </button>
    </form>
  );
};

// Fix: Export the App component as a default export.
export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat window whenever messages update
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string) => {
    const newUserMessage: Message = { role: 'user', content: text };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await sendGeminiMessage(text);
      const newAiMessage: Message = { role: 'model', content: aiResponse };
      setMessages((prevMessages) => [...prevMessages, newAiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        role: 'model',
        content: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error instanceof Error ? error.message : String(error)}. ${UNKNOWN_INFO_RESPONSE}`,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-gray-100">
      <header className="bg-gray-800 text-white p-4 shadow-md flex items-center" style={{ backgroundColor: BCU_BLUE }}>
        <img 
          // Placeholder for พี่สมเด็จ's avatar. Replace this base64 string with the full base64 of the desired image.
          src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" 
          alt="พี่สมเด็จ Avatar" 
          className="rounded-full mr-3 border-2 border-white"
        />
        <div>
          <h1 className="text-xl font-bold">พี่สมเด็จ</h1>
          <p className="text-sm">ผู้ช่วยประจำ ม.เบงจันทร์</p>
        </div>
      </header>

      <div ref={chatWindowRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
            <p className="text-xl font-semibold mb-2">สวัสดีน้องนักศึกษา</p>
            <p>พี่สมเด็จพร้อมให้คำแนะนำเกี่ยวกับมหาวิทยาลัยเบงจันทร์ครับ</p>
            <p className="mt-4 text-sm">ลองถามพี่ได้เลย เช่น "ประวัติมหาวิทยาลัยเป็นอย่างไรบ้างครับ/คะ?"</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}