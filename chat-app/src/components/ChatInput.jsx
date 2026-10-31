import React, { useState, useRef, useEffect } from 'react';
import { Smile, AtSign, Send } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import MentionDropdown from './MentionDropdown';
import { user_list } from '../constants/users';

export default function ChatInput({ onSendMessage, onTyping }) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionState, setMentionState] = useState({
    isOpen: false,
    query: '',
    cursorPosition: 0,
    selectedIndex: 0
  });

  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Focus textarea on initial load
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Handle typing detection for mentions (@)
  const handleInputChange = (e) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    setText(value);

    // Notify typing for Socket.IO
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }

    // Check if the character before or at cursor is part of a mention
    const textBeforeCursor = value.slice(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      // Ensure '@' is at start of string or preceded by whitespace
      if (/\s/.test(charBeforeAt) || lastAtIndex === 0) {
        const query = textBeforeCursor.slice(lastAtIndex + 1);
        // Only consider it a mention if no space exists between '@' and current cursor
        if (!/\s/.test(query)) {
          setMentionState({
            isOpen: true,
            query,
            cursorPosition: cursor,
            selectedIndex: 0
          });
          return;
        }
      }
    }

    if (mentionState.isOpen) {
      setMentionState((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Keyboard navigation for mentions and submission
  const handleKeyDown = (e) => {
    // If mention dropdown is open
    if (mentionState.isOpen) {
      const filtered = user_list.filter((u) =>
        u.toLowerCase().startsWith(mentionState.query.toLowerCase())
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionState((prev) => ({
          ...prev,
          selectedIndex: (prev.selectedIndex + 1) % (filtered.length || 1)
        }));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionState((prev) => ({
          ...prev,
          selectedIndex: (prev.selectedIndex - 1 + filtered.length) % (filtered.length || 1)
        }));
        return;
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        if (filtered.length > 0) {
          e.preventDefault();
          selectMentionUser(filtered[mentionState.selectedIndex] || filtered[0]);
          return;
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionState((prev) => ({ ...prev, isOpen: false }));
        return;
      }
    }

    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Select user from mention dropdown
  const selectMentionUser = (username) => {
    const cursor = textareaRef.current ? textareaRef.current.selectionStart : mentionState.cursorPosition;
    const textBeforeCursor = text.slice(0, cursor);
    const textAfterCursor = text.slice(cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const newTextBefore = textBeforeCursor.slice(0, lastAtIndex) + `@${username} `;
      const updatedText = newTextBefore + textAfterCursor;
      setText(updatedText);

      setMentionState({ isOpen: false, query: '', cursorPosition: 0, selectedIndex: 0 });

      // Reset cursor position right after mention
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = newTextBefore.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  // Explicitly trigger '@' mention menu when clicking the '@' button
  const handleMentionButtonClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const cursor = textareaRef.current.selectionStart;
      const textBefore = text.slice(0, cursor);
      const textAfter = text.slice(cursor);

      // Add a space before '@' if needed
      const prefix = textBefore.length > 0 && !/\s$/.test(textBefore) ? ' ' : '';
      const updatedText = `${textBefore}${prefix}@${textAfter}`;
      setText(updatedText);

      const newPos = (textBefore + prefix + '@').length;
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);

      setMentionState({
        isOpen: true,
        query: '',
        cursorPosition: newPos,
        selectedIndex: 0
      });
    } else {
      setText((prev) => prev + '@');
      setMentionState({
        isOpen: true,
        query: '',
        cursorPosition: text.length + 1,
        selectedIndex: 0
      });
    }
  };

  // Add emoji from picker into current text at cursor
  const handleSelectEmoji = (emoji) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const updatedText = text.substring(0, start) + emoji + text.substring(end);
      setText(updatedText);

      const newPos = start + emoji.length;
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    } else {
      setText((prev) => prev + emoji);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setText('');
    setMentionState({ isOpen: false, query: '', cursorPosition: 0, selectedIndex: 0 });
    setShowEmojiPicker(false);

    if (onTyping) {
      onTyping(false);
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="chat-input-wrapper">
      {/* Mention Dropdown Popover */}
      {mentionState.isOpen && (
        <MentionDropdown
          filterText={mentionState.query}
          selectedIndex={mentionState.selectedIndex}
          onSelectUser={selectMentionUser}
          onClose={() => setMentionState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      <div className="chat-input-box">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Type Message (type @ to mention a member)..."
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <div className="chat-input-actions">
          {/* Mention Button */}
          <button
            type="button"
            className="chat-action-btn"
            title="Mention a user (@)"
            aria-label="Mention a user"
            onClick={handleMentionButtonClick}
          >
            <AtSign size={18} />
          </button>

          {/* Emoji Picker Button */}
          <button
            type="button"
            className={`chat-action-btn ${showEmojiPicker ? 'active' : ''}`}
            title="Add emoji"
            aria-label="Add emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={18} />
          </button>

          {/* Send Button */}
          <button
            type="button"
            className={`chat-send-btn ${text.trim() ? 'can-send' : ''}`}
            onClick={handleSend}
            disabled={!text.trim()}
            title="Send chat message"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
