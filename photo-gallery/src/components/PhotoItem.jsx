import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

export default function PhotoItem({ photo, onLike }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use download_url as required by assignment; provide a fallback if needed
  const imageUrl = photo.download_url;

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

        {/* FontAwesome thumbs up icon and click counter as specified */}
        <button
          type="button"
          className="photo-like-btn"
          onClick={() => onLike(photo.id)}
          aria-label={`Like photo by ${photo.author}, currently ${photo.likes || 0} likes`}
          title="Like this photo"
        >
          <FontAwesomeIcon icon={faThumbsUp} className="photo-like-icon" />
          <span className="photo-like-count">{photo.likes || 0}</span>
        </button>
      </div>
    </article>
  );
}
