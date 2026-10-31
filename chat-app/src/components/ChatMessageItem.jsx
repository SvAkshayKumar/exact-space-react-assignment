import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { getInitials, getUserColor, user_list } from '../constants/users';

/**
 * Parses message text to highlight @mentions (e.g., @Alan, @Bob)
 */
function renderMessageText(text) {
  if (!text) return '';

  // Regex matches @Word
  const mentionPattern = /(@[A-Za-z0-9_]+)/g;
  const parts = text.split(mentionPattern);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const username = part.slice(1);
      const isKnownUser = user_list.includes(username);
      return (
        <span
          key={index}
          className={`chat-mention-pill ${isKnownUser ? 'is-valid' : ''}`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function ChatMessageItem({ message, onLike }) {
  const { id, user, text, timestamp, likes = 0 } = message;
  const avatarColor = getUserColor(user);
  const initials = getInitials(user);

  return (
    <div className="chat-message-row">
      <div
        className="chat-avatar"
        style={{ backgroundColor: avatarColor }}
        title={user}
      >
        {initials}
      </div>

      <div className="chat-message-content">
        <div className="chat-message-header">
          <span className="chat-user-name">{user}</span>
          <span className="chat-timestamp">{timestamp}</span>
        </div>

        <div className="chat-bubble-container">
          <div className="chat-bubble">
            {renderMessageText(text)}
          </div>

          {/* Like button on the right end of the chat message */}
          <div className="chat-like-section">
            <button
              type="button"
              className={`chat-like-btn ${likes > 0 ? 'liked' : ''}`}
              onClick={() => onLike(id)}
              title="Like this message"
              aria-label={`Like message by ${user}, current likes: ${likes}`}
            >
              <FontAwesomeIcon icon={faThumbsUp} className="like-icon" />
              <span className="like-count">{likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
