import React, { useState, useEffect, useRef } from 'react';

const EMOJI_CATEGORIES = {
  'Smileys & Emotion': [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯',
    '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁',
    '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨',
    '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞'
  ],
  'Gestures & Hands': [
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏',
    '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊',
    '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'
  ],
  'Hearts & Celebration': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤',
    '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '🎉', '🎊', '✨', '🔥', '⭐', '🌟',
    '💫', '💥', '🎈', '🏆', '🥇', '🎁', '🚀', '💯'
  ],
  'Objects & Symbols': [
    '☕', '🍕', '🍔', '🍟', '🍻', '🥂', '💡', '💬',
    '💻', '📱', '📷', '⏰', '⏳', '📌', '📎', '✏️',
    '📝', '🔍', '🔒', '🔑', '🏷️', '📦', '🔔', '📣'
  ]
};

export default function EmojiPicker({ onSelectEmoji, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Smileys & Emotion');
  const [searchQuery, setSearchQuery] = useState('');
  const pickerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const categories = Object.keys(EMOJI_CATEGORIES);

  // Filter emojis if search is typed
  const filteredEmojis = searchQuery.trim()
    ? Object.values(EMOJI_CATEGORIES).flat()
    : EMOJI_CATEGORIES[activeCategory];

  return (
    <div className="emoji-picker-container" ref={pickerRef}>
      <div className="emoji-picker-header">
        <span className="emoji-picker-title">Pick an Emoji</span>
        <button
          type="button"
          className="emoji-picker-close-btn"
          onClick={onClose}
          aria-label="Close emoji picker"
        >
          ×
        </button>
      </div>

      <div className="emoji-picker-search">
        <input
          type="text"
          placeholder="Search emojis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      {!searchQuery && (
        <div className="emoji-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`emoji-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'Smileys & Emotion' && '😀'}
              {cat === 'Gestures & Hands' && '👋'}
              {cat === 'Hearts & Celebration' && '❤️'}
              {cat === 'Objects & Symbols' && '💡'}
            </button>
          ))}
        </div>
      )}

      <div className="emoji-grid">
        {filteredEmojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            className="emoji-item-btn"
            onClick={() => onSelectEmoji(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

