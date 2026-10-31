import React from 'react';
import { getInitials, getUserColor } from '../constants/users';
import { Hash, Menu } from 'lucide-react';

export default function ChatHeader({
  channel,
  onlineCount = 1,
  currentUser,
  onResetUser,
  onToggleSidebar
}) {
  return (
    <header className="chat-header">
      <div className="chat-header-info">
        <div className="chat-header-title-row">
          {onToggleSidebar && (
            <button
              type="button"
              className="chat-sidebar-toggle-btn"
              onClick={onToggleSidebar}
              title="Toggle sidebar channels"
            >
              <Menu size={20} />
            </button>
          )}
          <Hash size={20} className="chat-header-hash-icon" />
          <h1 className="chat-channel-name">{channel?.name || 'Introductions'}</h1>
        </div>
        <p className="chat-channel-desc">{channel?.description || 'Company wide chatter'}</p>
      </div>

      <div className="chat-header-right">
        {/* Real-time online count at present moment */}
        <div className="chat-online-pill" title={`${onlineCount} currently active in chat`}>
          <span className="chat-online-pulse" />
          <span className="chat-online-count">
            {onlineCount} {onlineCount === 1 ? 'online' : 'online'}
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
