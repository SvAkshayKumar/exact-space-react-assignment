import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatSidebar from './components/ChatSidebar';
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';
import { socketService } from './services/socketService';
import { getPersistentProfile, resetPersistentProfile } from './constants/users';
import { CHANNELS, DEFAULT_CHANNEL_ID } from './constants/channels';
import './App.css';

export default function App() {
  // Active conversation channel
  const [activeChannelId, setActiveChannelId] = useState(DEFAULT_CHANNEL_ID);

  // Each channel maintains its separate chat messages in memory.
  // Switching between channels retains all messages; only a page refresh resets them.
  const [channelMessages, setChannelMessages] = useState(() => ({
    'introductions': [],
    'poland-office': [],
    'india-office': []
  }));

  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState([]); // Array of { userId, username }
  const [typingUser, setTypingUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set of message IDs sent by this client device during this session
  const [mySentMessageIds, setMySentMessageIds] = useState(() => new Set());

  // Persistent user profile with constant userId and assigned username
  const [currentUser, setCurrentUser] = useState(() => getPersistentProfile());

  // Current active channel object
  const currentChannel = useMemo(
    () => CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0],
    [activeChannelId]
  );

  // Connect socket and register persistent user on mount
  useEffect(() => {
    socketService.connect(currentUser);

    const unsubConnection = socketService.onConnectionChange((connected) => {
      setIsConnected(connected);
      if (connected) {
        socketService.join(currentUser);
      }
    });

    // Subscribe to new incoming messages broadcast from that instant onward
    const unsubNewMsg = socketService.subscribeToNewMessages((newMsg) => {
      const channel = newMsg.channelId || 'introductions';
      setChannelMessages((prev) => {
        const existingList = prev[channel] || [];
        if (existingList.some((m) => m.id === newMsg.id)) {
          return prev;
        }
        return {
          ...prev,
          [channel]: [...existingList, newMsg]
        };
      });
    });

    // Subscribe to like updates broadcast across clients
    const unsubLikes = socketService.subscribeToLikes(({ messageId, channelId, likes, likedBy }) => {
      setChannelMessages((prev) => {
        const targetChannel = channelId || Object.keys(prev).find((ch) =>
          prev[ch].some((m) => m.id === messageId)
        );
        if (!targetChannel || !prev[targetChannel]) return prev;

        return {
          ...prev,
          [targetChannel]: prev[targetChannel].map((m) =>
            m.id === messageId ? { ...m, likes, likedBy: likedBy || [] } : m
          )
        };
      });
    });

    // Subscribe to emoji reaction updates broadcast across clients
    const unsubReactions = socketService.subscribeToReactions(({ messageId, channelId, reactions }) => {
      setChannelMessages((prev) => {
        const targetChannel = channelId || Object.keys(prev).find((ch) =>
          prev[ch].some((m) => m.id === messageId)
        );
        if (!targetChannel || !prev[targetChannel]) return prev;

        return {
          ...prev,
          [targetChannel]: prev[targetChannel].map((m) =>
            m.id === messageId ? { ...m, reactions: reactions || {} } : m
          )
        };
      });
    });

    // Subscribe to real-time online users
    const unsubOnline = socketService.subscribeToOnlineUsers(({ count, users }) => {
      setOnlineCount(count || 1);
      setOnlineUsers(users || []);
    });

    // Subscribe to typing notifications
    const unsubTyping = socketService.subscribeToTyping(({ userId, user, isTyping, channelId }) => {
      if (!channelId || channelId === activeChannelId) {
        setTypingUser(isTyping ? { userId, username: user } : null);
      }
    });

    return () => {
      unsubConnection();
      unsubNewMsg();
      unsubLikes();
      unsubReactions();
      unsubOnline();
      unsubTyping();
    };
  }, [currentUser, activeChannelId]);

  /**
   * Reset user name while PRESERVING constant client identity.
   * This guarantees messages previously sent by this client always remain "(You)".
   */
  const handleResetUser = () => {
    const newProfile = resetPersistentProfile(currentUser.username);
    setCurrentUser(newProfile);
    socketService.join(newProfile);
  };

  /**
   * Send a chat message in the active channel as the constant current user
   * Attaches sender's unique userId so messages are never confused even if usernames match!
   */
  const handleSendMessage = useCallback((text) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      channelId: activeChannelId,
      userId: currentUser.userId,      // Constant unique sender ID
      user: currentUser.username,      // Display name at time of sending
      text,
      timestamp,
      likes: 0,
      likedBy: [],
      reactions: {}
    };

    // Record that this message was sent by this client device
    setMySentMessageIds((prev) => new Set(prev).add(newMessage.id));

    if (isConnected) {
      socketService.publishMessage(newMessage);
    } else {
      // Local fallback mode if server is offline
      setChannelMessages((prev) => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), newMessage]
      }));
    }
  }, [currentUser, activeChannelId, isConnected]);

  /**
   * Handle liking/unliking a message:
   * Tracked by unique userId so duplicate usernames don't conflict!
   */
  const handleLikeMessage = useCallback((messageId) => {
    const myId = currentUser.userId;

    // Optimistic UI update
    setChannelMessages((prev) => {
      const msgs = prev[activeChannelId] || [];
      const updated = msgs.map((msg) => {
        if (msg.id !== messageId) return msg;

        const currentLikedBy = Array.isArray(msg.likedBy) ? [...msg.likedBy] : [];
        const index = currentLikedBy.indexOf(myId);
        let updatedLikedBy;
        let updatedLikes;

        if (index !== -1) {
          // Already liked by this user -> remove like
          updatedLikedBy = currentLikedBy.filter((id) => id !== myId);
          updatedLikes = Math.max(0, (msg.likes || 1) - 1);
        } else {
          // Not yet liked by this user -> add like
          updatedLikedBy = [...currentLikedBy, myId];
          updatedLikes = (msg.likes || 0) + 1;
        }

        return {
          ...msg,
          likes: updatedLikes,
          likedBy: updatedLikedBy
        };
      });

      return {
        ...prev,
        [activeChannelId]: updated
      };
    });

    if (isConnected) {
      socketService.publishLike(messageId, currentUser.userId, currentUser.username, activeChannelId);
    }
  }, [currentUser, activeChannelId, isConnected]);

  /**
   * Handle adding or toggling an emoji reaction on any chat message:
   * Tracked by unique userId so duplicate usernames don't conflict!
   */
  const handleToggleReaction = useCallback((messageId, emoji) => {
    const myId = currentUser.userId;

    // Optimistic UI update
    setChannelMessages((prev) => {
      const msgs = prev[activeChannelId] || [];
      const updated = msgs.map((msg) => {
        if (msg.id !== messageId) return msg;

        const currentReactions = { ...(msg.reactions || {}) };
        const userList = Array.isArray(currentReactions[emoji]) ? [...currentReactions[emoji]] : [];
        const userIdx = userList.indexOf(myId);

        if (userIdx !== -1) {
          // User already reacted -> remove reaction (toggle off)
          userList.splice(userIdx, 1);
          if (userList.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = userList;
          }
        } else {
          // User hasn't reacted -> add reaction (toggle on)
          userList.push(myId);
          currentReactions[emoji] = userList;
        }

        return {
          ...msg,
          reactions: currentReactions
        };
      });

      return {
        ...prev,
        [activeChannelId]: updated
      };
    });

    if (isConnected) {
      socketService.publishReaction(messageId, currentUser.userId, currentUser.username, emoji, activeChannelId);
    }
  }, [currentUser, activeChannelId, isConnected]);

  /**
   * Publish typing status
   */
  const handleTyping = useCallback((isTyping) => {
    if (isConnected) {
      socketService.publishTyping(currentUser.userId, currentUser.username, isTyping, activeChannelId);
    }
  }, [isConnected, currentUser, activeChannelId]);

  // Current messages for the active channel
  const activeMessages = channelMessages[activeChannelId] || [];

  return (
    <div className="chat-app-root">
      {/* Sidebar containing conversations & online members */}
      <div className={`chat-sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
        <ChatSidebar
          activeChannelId={activeChannelId}
          onSelectChannel={(chId) => {
            setActiveChannelId(chId);
            setIsSidebarOpen(false);
          }}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          channelMessages={channelMessages}
        />
      </div>

      {/* Main Chat Pane */}
      <main className="chat-main-pane">
        <ChatHeader
          channel={currentChannel}
          onlineCount={onlineCount}
          currentUser={currentUser}
          onResetUser={handleResetUser}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Chat message thread for the active channel */}
        <ChatMessageList
          messages={activeMessages}
          onLike={handleLikeMessage}
          onToggleReaction={handleToggleReaction}
          typingUser={typingUser}
          currentUserId={currentUser.userId}
          currentUsername={currentUser.username}
          channelName={currentChannel.name}
          mySentMessageIds={mySentMessageIds}
        />

        {/* Chat input box at bottom */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          activeUsers={onlineUsers.length > 0 ? onlineUsers : [currentUser]}
        />
      </main>

      {/* Mobile backdrop for sidebar */}
      {isSidebarOpen && (
        <div
          className="chat-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
