import React from 'react';
import { getInitials, getUserColor } from '../constants/users';

export default function ChatHeader({ onlineCount = 1, currentUser, onResetUser }) {
  return (
    <header className="chat-header">
      <div className="chat-header-info">
        <h1 className="chat-channel-name">Introductions</h1>
        <p className="chat-channel-desc">This Channel Is For Company Wide Chatter</p>
      </div>

      <div className="chat-header-right">
        {/* Real-time online count at the present moment */}
        <div className="chat-online-pill" title={`${onlineCount} currently active in this channel`}>
          <span className="chat-online-pulse" />
          <span className="chat-online-count">
            {onlineCount} {onlineCount === 1 ? 'person online' : 'people online'}
          </span>
        </div>

        {/* Current user persistent profile pill */}
        {currentUser && (
          <div className="chat-user-pill" title={`Your constant user: @${currentUser}`}>
            <span
              className="chat-user-pill-avatar"
              style={{ backgroundColor: getUserColor(currentUser) }}
            >
              {getInitials(currentUser)}
            </span>
            <span className="chat-user-pill-name">@{currentUser}</span>
            <button
              type="button"
              className="chat-clear-cache-btn"
              onClick={onResetUser}
              title="Clear cached name and get a new name"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
