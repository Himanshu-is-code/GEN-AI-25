import React, { useState, useEffect, useRef } from 'react';
import FlipText from './FlipText';
import WrapButton from './WrapButton';

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{ animationDuration: '5s' }}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

interface HeroSectionProps {
  onNavigateToChat: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateToChat }) => {
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sample chat messages
  const chatMessages = [
    { sender: 'ai', text: "Hi there! I'm your AI wellness companion. I'm here to listen without judgment. How are you feeling today?" },
    { sender: 'user', text: "I've been feeling really overwhelmed with school and everything lately..." },
    { sender: 'ai', text: "I hear you. It's completely normal to feel that way sometimes. Let's explore some simple activities that might help you feel calmer." },
  ];

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real app, you would send the message to your backend/API
      console.log("Message sent:", message);
      setMessage('');
    }
  };

  return (
    <div className="pt-20 md:pt-32 pb-10 md:pb-20">
        <div className="lg:flex lg:items-center lg:justify-between gap-12">
          <div className="lg:w-1/2">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">Mindful Youth</span>
              <span className="text-slate-800 dark:text-slate-200"> - </span>
              <FlipText className="text-slate-800 dark:text-slate-200">Your Wellness Companion</FlipText>
            </h1>
            <p className="mt-5 text-xl text-slate-600 dark:text-slate-300">
              A confidential, empathetic space designed to support and guide you through life's challenges, breaking down stigma and providing accessible help.
            </p>
            <div className="mt-8 flex flex-col items-start sm:flex-row gap-4">
              <WrapButton onClick={onNavigateToChat}>
                <GlobeIcon />
                Get Started
              </WrapButton>
            </div>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <div className="bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-slate-300/50 dark:border-slate-700/50">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm text-slate-500 dark:text-slate-400">AI Chat - Example</span>
              </div>
              <div 
                ref={chatContainerRef}
                className="h-80 overflow-y-auto mb-4 flex flex-col space-y-3 p-2"
              >
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg max-w-[85%] shadow ${
                      msg.sender === 'ai' 
                        ? 'bg-calm-orange-500/80 dark:bg-calm-orange-800/80 text-white self-start rounded-bl-none' 
                        : 'bg-slate-300/90 text-slate-800 dark:bg-slate-700/90 dark:text-white self-end rounded-br-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                ))}
                <div className="p-3 rounded-lg bg-calm-orange-500/80 dark:bg-calm-orange-800/80 text-white self-start rounded-bl-none flex space-x-1.5 items-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="flex">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-calm-orange-500"
                />
                <button 
                  type="submit"
                  className="bg-calm-orange-600 hover:bg-calm-orange-700 text-white px-4 py-2 rounded-r-lg transition-colors"
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
    </div>
  );
};

export default HeroSection;