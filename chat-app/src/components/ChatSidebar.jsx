import React from 'react';
import { Hash, Plus, MessageSquare } from 'lucide-react';
import { CHANNELS } from '../constants/channels';
import { getInitials, getUserColor } from '../constants/users';

export default function ChatSidebar({
  activeChannelId,
  onSelectChannel,
  currentUser,
  onlineUsers = [],
  channelMessages = {}
}) {
  return (
    <aside className="chat-sidebar">
      {/* Current User Profile header matching the reference GIF */}
      <div className="sidebar-profile">
        <div
          className="sidebar-avatar"
          style={{ backgroundColor: getUserColor(currentUser) }}
        >
          {getInitials(currentUser)}
          <span className="online-indicator" />
        </div>
        <div className="sidebar-user-details">
          <span className="sidebar-user-name">@{currentUser}</span>
          <span className="sidebar-user-role">Online &bull; Active</span>
        </div>
      </div>

      {/* Conversations / Channels list */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>Conversations</span>
          <span className="sidebar-channels-count">{CHANNELS.length}</span>
        </div>

        <nav className="sidebar-nav">
          {CHANNELS.map((ch) => {
            const isActive = ch.id === activeChannelId;
            const msgCount = channelMessages[ch.id]?.length || 0;

            return (
              <button
                key={ch.id}
                type="button"
                className={`sidebar-channel-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectChannel(ch.id)}
              >
                <Hash size={16} className="channel-hash-icon" />
                <span className="channel-item-name">{ch.name}</span>
                {msgCount > 0 && (
                  <span className={`channel-msg-badge ${isActive ? 'badge-active' : ''}`}>
                    {msgCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Members section */}
      <div className="sidebar-members-list">
        <div className="sidebar-section-header">
          <span>Online Members ({onlineUsers.length})</span>
        </div>
        <div className="sidebar-users">
          {onlineUsers.length === 0 ? (
            <div className="sidebar-empty-members">Connecting...</div>
          ) : (
            onlineUsers.map((user) => (
              <div key={user} className="sidebar-user-row">
                <span
                  className="sidebar-user-dot"
                  style={{ backgroundColor: getUserColor(user) }}
                >
                  {getInitials(user)}
                </span>
                <span className="sidebar-user-name-text">
                  @{user} {user === currentUser && <span className="sidebar-you-tag">(You)</span>}
                </span>
                <span className="sidebar-online-green" />
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
