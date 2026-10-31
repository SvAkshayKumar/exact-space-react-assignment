import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';
import { socketService } from './services/socketService';
import { getPersistentUser, user_list } from './constants/users';
import './App.css';

export default function App() {
  // Messages start empty at join instant; refreshes restart from that instant
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  // Persistent user name stored in cache (localStorage)
  const [currentUser, setCurrentUser] = useState(() => getPersistentUser());

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
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) {
          return prev;
        }
        return [...prev, newMsg];
      });
    });

    // Subscribe to like updates broadcast across clients
    const unsubLikes = socketService.subscribeToLikes(({ messageId, likes, likedBy }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, likes, likedBy: likedBy || [] } : m
        )
      );
    });

    // Subscribe to real-time online users
    const unsubOnline = socketService.subscribeToOnlineUsers(({ count, users }) => {
      setOnlineCount(count || 1);
      setOnlineUsers(users || []);
    });

    // Subscribe to typing notifications
    const unsubTyping = socketService.subscribeToTyping(({ user, isTyping }) => {
      setTypingUser(isTyping ? user : null);
    });

    return () => {
      unsubConnection();
      unsubNewMsg();
      unsubLikes();
      unsubOnline();
      unsubTyping();
    };
  }, [currentUser]);

  /**
   * Reset user name cache and assign a new constant name
   */
  const handleResetUser = () => {
    localStorage.removeItem('exactspace_chat_username');
    const remaining = user_list.filter((u) => u !== currentUser);
    const newUser = remaining[Math.floor(Math.random() * remaining.length)] || user_list[0];
    localStorage.setItem('exactspace_chat_username', newUser);
    setCurrentUser(newUser);
    socketService.join(newUser);
  };

  /**
   * Send a chat message as the constant current user
   */
  const handleSendMessage = useCallback((text) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user: currentUser,
      text,
      timestamp,
      likes: 0,
      likedBy: []
    };

    if (isConnected) {
      socketService.publishMessage(newMessage);
    } else {
      // Local fallback mode if server is offline
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [currentUser, isConnected]);

  /**
   * Handle liking/unliking a message:
   * If already liked by current user, clicking again removes the like!
   */
  const handleLikeMessage = useCallback((messageId) => {
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const currentLikedBy = Array.isArray(msg.likedBy) ? [...msg.likedBy] : [];
        const index = currentLikedBy.indexOf(currentUser);
        let updatedLikedBy;
        let updatedLikes;

        if (index !== -1) {
          // Already liked -> remove like
          updatedLikedBy = currentLikedBy.filter((u) => u !== currentUser);
          updatedLikes = Math.max(0, (msg.likes || 1) - 1);
        } else {
          // Not yet liked -> add like
          updatedLikedBy = [...currentLikedBy, currentUser];
          updatedLikes = (msg.likes || 0) + 1;
        }

        return {
          ...msg,
          likes: updatedLikes,
          likedBy: updatedLikedBy
        };
      })
    );

    // Publish like toggle event to socket server
    if (isConnected) {
      socketService.publishLike(messageId, currentUser);
    }
  }, [currentUser, isConnected]);

  /**
   * Publish typing status
   */
  const handleTyping = useCallback((isTyping) => {
    if (isConnected) {
      socketService.publishTyping(currentUser, isTyping);
    }
  }, [isConnected, currentUser]);

  // Active users available for @mentions (filter to active users online right now)
  const activeMembersForMention = onlineUsers.length > 0 ? onlineUsers : [currentUser];

  return (
    <div className="chat-app-root">
      <main className="chat-main-pane">
        <ChatHeader
          onlineCount={onlineCount}
          currentUser={currentUser}
          onResetUser={handleResetUser}
        />

        {/* Chat message thread starting from user's join instant */}
        <ChatMessageList
          messages={messages}
          onLike={handleLikeMessage}
          typingUser={typingUser}
          currentUser={currentUser}
        />

        {/* Chat input box at bottom */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          activeUsers={activeMembersForMention}
        />
      </main>
    </div>
  );
}
