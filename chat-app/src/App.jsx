import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';
import { socketService } from './services/socketService';
import { getRandomUser, user_list, getUserColor, getInitials } from './constants/users';
import { Hash, Plus, MessageSquare, Info } from 'lucide-react';
import './App.css';

// Initial fallback messages if socket server isn't running yet
const DEFAULT_FALLBACK_MESSAGES = [
  {
    id: 'msg-seed-1',
    user: 'PubNub Bot',
    text: 'Welcome to Team Chat. 👋 Send a message now to start interacting with other users in the app. ⬇️',
    timestamp: '12:16',
    likes: 2
  },
  {
    id: 'msg-seed-2',
    user: 'Gregory Goolsby',
    text: 'Hey everyone!',
    timestamp: '17:28',
    likes: 1
  },
  {
    id: 'msg-seed-3',
    user: 'Elin Emmanuel',
    text: 'Oh hi, Gregory! Rolande is around, too...',
    timestamp: '17:30',
    likes: 0
  }
];

export default function App() {
  const [messages, setMessages] = useState(DEFAULT_FALLBACK_MESSAGES);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(3);
  const [typingUser, setTypingUser] = useState(null);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [currentUser] = useState(() => getRandomUser());

  // Establish Socket.IO pub/sub connection on mount
  useEffect(() => {
    socketService.connect();

    const unsubConnection = socketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Subscribe to history published upon connection
    const unsubHistory = socketService.subscribeToHistory((history) => {
      if (Array.isArray(history) && history.length > 0) {
        setMessages(history);
      }
    });

    // Subscribe to new messages published by any client
    const unsubNewMsg = socketService.subscribeToNewMessages((newMsg) => {
      setMessages((prev) => {
        // Prevent duplicate append if message already added
        if (prev.some((m) => m.id === newMsg.id)) {
          return prev;
        }
        return [...prev, newMsg];
      });
    });

    // Subscribe to like events published across the network
    const unsubLikes = socketService.subscribeToLikes(({ messageId, likes }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, likes } : m))
      );
    });

    // Subscribe to active connected user count
    const unsubUserCount = socketService.subscribeToUserCount((count) => {
      setUserCount(count);
    });

    // Subscribe to typing notifications
    const unsubTyping = socketService.subscribeToTyping(({ user, isTyping }) => {
      setTypingUser(isTyping ? user : null);
    });

    return () => {
      unsubConnection();
      unsubHistory();
      unsubNewMsg();
      unsubLikes();
      unsubUserCount();
      unsubTyping();
    };
  }, []);

  /**
   * Handle sending a new message
   * As required: randomly assign a username from user_list: ["Alan", "Bob", "Carol", "Dean", "Elin"]
   */
  const handleSendMessage = useCallback((text) => {
    const assignedUser = getRandomUser();
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user: assignedUser,
      text,
      timestamp,
      likes: 0
    };

    if (isConnected) {
      // Publish message to Socket.IO server
      socketService.publishMessage(newMessage);
    } else {
      // Local fallback mode when server is disconnected
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [isConnected]);

  /**
   * Handle liking a message
   * For each message, add a like button which on click should increase the count
   */
  const handleLikeMessage = useCallback((messageId) => {
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, likes: (msg.likes || 0) + 1 } : msg
      )
    );

    // Publish like event to server
    if (isConnected) {
      socketService.publishLike(messageId);
    }
  }, [isConnected]);

  /**
   * Publish typing status
   */
  const handleTyping = useCallback((isTyping) => {
    if (isConnected) {
      socketService.publishTyping(currentUser, isTyping);
    }
  }, [isConnected, currentUser]);

  return (
    <div className="chat-app-root">
      {/* Optional sidebar replicating the reference UI in team-chat-intro.gif */}
      <aside className="chat-sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            RR
            <span className="online-indicator"></span>
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">Rolande Raimondi</span>
            <span className="sidebar-user-role">Research Nurse</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span>Conversations</span>
            <button type="button" className="sidebar-add-btn" title="Add conversation">
              <Plus size={16} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <button type="button" className="sidebar-channel-item">
              <Hash size={16} className="channel-hash-icon" />
              <span>Poland Office</span>
            </button>
            <button type="button" className="sidebar-channel-item active">
              <Hash size={16} className="channel-hash-icon" />
              <span>Introductions</span>
            </button>
            <button type="button" className="sidebar-channel-item">
              <Hash size={16} className="channel-hash-icon" />
              <span>India Office</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-members-list">
          <div className="sidebar-section-header">
            <span>Team Members</span>
          </div>
          <div className="sidebar-users">
            {user_list.map((user) => (
              <div key={user} className="sidebar-user-row">
                <span
                  className="sidebar-user-dot"
                  style={{ backgroundColor: getUserColor(user) }}
                >
                  {getInitials(user)}
                </span>
                <span className="sidebar-user-name-text">@{user}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Pane */}
      <main className="chat-main-pane">
        <ChatHeader
          isConnected={isConnected}
          userCount={userCount}
          onToggleMembers={() => setShowMembersDrawer(!showMembersDrawer)}
        />

        {/* Real-time sync notification bar */}
        <div className="chat-banner">
          <Info size={14} />
          <span>
            {isConnected
              ? '⚡ Real-time Socket.io active: messages & likes sync across all open tabs/clients!'
              : '⚡ Running in local mode. Start the Express server with npm run server for live Socket.io sync.'}
          </span>
        </div>

        {/* Chat message thread */}
        <ChatMessageList
          messages={messages}
          onLike={handleLikeMessage}
          typingUser={typingUser}
        />

        {/* Chat input box at bottom */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </main>

      {/* Slide-out members drawer */}
      {showMembersDrawer && (
        <aside className="chat-members-drawer">
          <div className="drawer-header">
            <h3>Channel Members</h3>
            <button
              type="button"
              className="drawer-close"
              onClick={() => setShowMembersDrawer(false)}
            >
              ×
            </button>
          </div>
          <p className="drawer-subtitle">Users randomly assigned to chat messages:</p>
          <ul className="drawer-user-list">
            {user_list.map((u) => (
              <li key={u} className="drawer-user-item">
                <span
                  className="drawer-avatar"
                  style={{ backgroundColor: getUserColor(u) }}
                >
                  {getInitials(u)}
                </span>
                <span className="drawer-username">@{u}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
