import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { SmilePlus } from 'lucide-react';
import { getInitials, getUserColor, user_list } from '../constants/users';
import ReactionPicker from './ReactionPicker';

/**
 * Parses message text to highlight @all and @mentions (e.g., @Alan, @Bob)
 */
function renderMessageText(text) {
  if (!text) return '';

  const mentionPattern = /(@[A-Za-z0-9_]+)/g;
  const parts = text.split(mentionPattern);

  return parts.map((part, index) => {
    if (part.toLowerCase() === '@all') {
      return (
        <span key={index} className="chat-mention-pill mention-all" title="Mentions all channel members">
          @all
        </span>
      );
    }
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

export default function ChatMessageItem({ message, onLike, onToggleReaction, currentUser }) {
  const { id, user, text, timestamp, likes = 0, likedBy = [], reactions = {} } = message;
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const avatarColor = getUserColor(user);
  const initials = getInitials(user);

  // Check if current user has already liked this message
  const isLikedByMe = Array.isArray(likedBy) && likedBy.includes(currentUser);

  // Filter out any reaction keys that have empty user arrays
  const activeReactions = Object.entries(reactions).filter(
    ([, users]) => Array.isArray(users) && users.length > 0
  );

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
          <span className="chat-user-name">
            {user} {user === currentUser && <span className="chat-you-tag">(You)</span>}
          </span>
          <span className="chat-timestamp">{timestamp}</span>
        </div>

        <div className="chat-bubble-container">
          <div className="chat-bubble">
            {renderMessageText(text)}
          </div>

          {/* Action buttons (Like & Emoji Reaction) */}
          <div className="chat-message-actions">
            {/* Emoji Reaction button */}
            <div className="chat-reaction-trigger-container">
              <button
                type="button"
                className={`chat-reaction-trigger-btn ${showReactionPicker ? 'active' : ''}`}
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                title="Add emoji reaction"
                aria-label="Add reaction"
              >
                <SmilePlus size={15} />
              </button>

              {showReactionPicker && (
                <ReactionPicker
                  onSelectEmoji={(emoji) => onToggleReaction(id, emoji)}
                  onClose={() => setShowReactionPicker(false)}
                />
              )}
            </div>

            {/* Like button: Clicking toggles like/unlike */}
            <button
              type="button"
              className={`chat-like-btn ${isLikedByMe ? 'liked' : ''}`}
              onClick={() => onLike(id)}
              title={isLikedByMe ? 'Unlike this message' : 'Like this message'}
              aria-label={`Like message by ${user}, current likes: ${likes}`}
            >
              <FontAwesomeIcon icon={faThumbsUp} className="like-icon" />
              <span className="like-count">{likes}</span>
            </button>
          </div>
        </div>

        {/* Display emoji reactions on this message */}
        {activeReactions.length > 0 && (
          <div className="chat-reactions-row">
            {activeReactions.map(([emoji, users]) => {
              const hasReacted = users.includes(currentUser);
              return (
                <button
                  key={emoji}
                  type="button"
                  className={`chat-reaction-pill ${hasReacted ? 'reacted-by-me' : ''}`}
                  onClick={() => onToggleReaction(id, emoji)}
                  title={`${users.join(', ')} reacted with ${emoji}`}
                >
                  <span className="reaction-pill-emoji">{emoji}</span>
                  <span className="reaction-pill-count">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
