import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

export default function PhotoItem({ photo, onLike }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = photo.download_url;
  const isLiked = photo.liked === true;

  return (
    <article className="photo-card">
      <div className="photo-image-container">
        {!imageLoaded && !imageError && (
          <div className="photo-skeleton-loader" aria-hidden="true" />
        )}
        <img
          src={imageUrl}
          alt={`Photo by ${photo.author}`}
          loading="lazy"
          className={`photo-image ${imageLoaded ? 'loaded' : 'loading'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
        {imageError && (
          <div className="photo-error-fallback">
            <span>Image unavailable</span>
          </div>
        )}
      </div>

      <div className="photo-info-container">
        <span className="photo-author-label">
          Author: <strong className="photo-author-name">{photo.author}</strong>
        </span>

        {/* Like toggle button — click to like, click again to unlike */}
        <button
          type="button"
          className={`photo-like-btn ${isLiked ? 'liked-active' : ''}`}
          onClick={() => onLike(photo.id)}
          aria-label={`${isLiked ? 'Remove like from' : 'Like'} photo by ${photo.author}, ${photo.likes || 0} likes`}
          title={isLiked ? 'Remove like' : 'Like this photo'}
        >
          <FontAwesomeIcon icon={faThumbsUp} className="photo-like-icon" />
          <span className="photo-like-count">{photo.likes || 0}</span>
        </button>
      </div>
    </article>
  );
}
