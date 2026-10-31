import React from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';

export default function ChatHeader({ isConnected, userCount = 1, onToggleMembers }) {
  return (
    <header className="chat-header">
      <div className="chat-header-info">
        <div className="chat-header-title-row">
          <h1 className="chat-channel-name">Introductions</h1>
          <span
            className={`chat-socket-badge ${isConnected ? 'online' : 'offline'}`}
            title={isConnected ? 'Connected to Socket.io server' : 'Disconnected from Socket.io (Offline Mode)'}
          >
            {isConnected ? (
              <>
                <Wifi size={13} className="badge-icon" />
                <span>Socket.io Live</span>
              </>
            ) : (
              <>
                <WifiOff size={13} className="badge-icon" />
                <span>Local Mode</span>
              </>
            )}
          </span>
        </div>
        <p className="chat-channel-desc">This Channel Is For Company Wide Chatter</p>
      </div>

      <div className="chat-header-actions">
        <button
          type="button"
          className="chat-members-btn"
          onClick={onToggleMembers}
          title="Active channel members"
        >
          <span className="member-count">{userCount} | 5</span>
          <Users size={18} className="member-icon" />
        </button>
      </div>
    </header>
  );
}
