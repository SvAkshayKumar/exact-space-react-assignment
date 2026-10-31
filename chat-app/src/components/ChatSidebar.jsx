import React from 'react';
import { Hash } from 'lucide-react';
import { CHANNELS } from '../constants/channels';
import { getInitials, getUserColor } from '../constants/users';

export default function ChatSidebar({
  activeChannelId,
  onSelectChannel,
  currentUser, // { userId, username }
  onlineUsers = [], // Array of { userId, username }
  channelMessages = {}
}) {
  const currentUsername = currentUser?.username || 'Alan';
  const currentUserId = currentUser?.userId || '';

  return (
    <aside className="chat-sidebar">
      {/* Current User Profile header */}
      <div className="sidebar-profile">
        <div
          className="sidebar-avatar"
          style={{ backgroundColor: getUserColor(currentUsername, currentUserId) }}
        >
          {getInitials(currentUsername)}
          <span className="online-indicator" />
        </div>
        <div className="sidebar-user-details">
          <span className="sidebar-user-name">@{currentUsername}</span>
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
            onlineUsers.map((member, idx) => {
              const memberName = typeof member === 'string' ? member : member.username;
              const memberId = typeof member === 'string' ? '' : member.userId;
              const isMe = memberId === currentUserId;
              const isDuplicate = !isMe && memberName === currentUsername;

              return (
                <div key={memberId || `${memberName}_${idx}`} className="sidebar-user-row">
                  <span
                    className="sidebar-user-dot"
                    style={{ backgroundColor: getUserColor(memberName, memberId) }}
                  >
                    {getInitials(memberName)}
                  </span>
                  <span className="sidebar-user-name-text">
                    @{memberName}
                    {isMe && <span className="sidebar-you-tag">(You)</span>}
                    {isDuplicate && <span className="sidebar-other-tag">(Other)</span>}
                  </span>
                  <span className="sidebar-online-green" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
