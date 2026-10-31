import React, { useEffect, useRef } from 'react';
import ChatMessageItem from './ChatMessageItem';

export default function ChatMessageList({ messages, onLike, typingUser, currentUser }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, typingUser]);

  return (
    <div className="chat-messages-scroll-area">
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <p>No new messages since you joined. Type a message below to start chatting!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onLike={onLike}
              currentUser={currentUser}
            />
          ))
        )}

        {typingUser && typingUser !== currentUser && (
          <div className="chat-typing-indicator">
            <span className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span className="typing-text">{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
