import React, { useEffect, useRef } from 'react';
import ChatMessageItem from './ChatMessageItem';

export default function ChatMessageList({
  messages,
  onLike,
  onToggleReaction,
  typingUser,
  currentUser,
  channelName
}) {
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
            <p>Welcome to <strong>#{channelName}</strong>!</p>
            <p className="chat-empty-sub">No messages sent in this channel yet during this session. Say hello to start the chat!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onLike={onLike}
              onToggleReaction={onToggleReaction}
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
