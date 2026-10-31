import React, { useEffect, useRef } from 'react';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🚀', '🔥', '👏', '😮', '👀', '💯'];

export default function ReactionPicker({ onSelectEmoji, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="reaction-picker-popup" ref={containerRef}>
      <div className="reaction-picker-emojis">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="reaction-picker-item"
            onClick={() => {
              onSelectEmoji(emoji);
              onClose();
            }}
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
