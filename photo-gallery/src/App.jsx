import React, { useState, useEffect, useRef, useCallback } from 'react';
import PhotoItem from './components/PhotoItem';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import './App.css';

const LIMIT = 20;

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const observerTargetRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Fetch photos for a specific page
  const fetchPhotos = useCallback(async (pageNumber) => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    const directUrl = `https://picsum.photos/v2/list?page=${pageNumber}&limit=${LIMIT}`;
    const proxyUrl = `/api/picsum/v2/list?page=${pageNumber}&limit=${LIMIT}`;

    try {
      let response;
      try {
        response = await fetch(directUrl);
      } catch (err) {
        // Fallback to proxy if direct fetch fails (e.g. CORS)
        console.warn('Direct fetch failed, falling back to proxy:', err);
        response = await fetch(proxyUrl);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch photos (HTTP ${response.status})`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setHasMore(false);
      } else {
        // Initialize likes to 0 as required
        const formatted = data.map((item) => ({
          ...item,
          likes: 0
        }));

        setPhotos((prev) => {
          // Prevent duplicates by ID
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = formatted.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });

        // If returned fewer than limit, no more data
        if (data.length < LIMIT) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError(err.message || 'Could not load photos. Please check your connection.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [hasMore]);

  // Load first page on mount
  useEffect(() => {
    fetchPhotos(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && hasMore && !isFetchingRef.current) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchPhotos(nextPage);
            return nextPage;
          });
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0.1
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchPhotos, loading, hasMore]);

  // Handle like button click
  // "On clicking this icon, increase the count. The count should be increase as many clicks performed."
  const handleLike = useCallback((photoId) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) =>
        photo.id === photoId
          ? { ...photo, likes: (photo.likes || 0) + 1 }
          : photo
      )
    );
  }, []);

  const handleRetry = () => {
    fetchPhotos(page);
  };

  return (
    <div className="gallery-layout-container">
      {/* Header section matching photo-gallery.jpg */}
      <header className="gallery-header">
        <h1 className="gallery-title">Photo gallery</h1>
      </header>

      {/* 1 Column View */}
      <main className="gallery-main-column">
        <div className="photo-list">
          {photos.map((photo) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              onLike={handleLike}
            />
          ))}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="gallery-status-loader">
            <Loader2 className="spinner-icon" size={28} />
            <span>Loading more photos...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="gallery-error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button type="button" className="retry-btn" onClick={handleRetry}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* End of list */}
        {!hasMore && photos.length > 0 && (
          <div className="gallery-end-message">
            <p>✓ You have reached the end of the gallery.</p>
          </div>
        )}

        {/* Sentinel element observed by IntersectionObserver */}
        <div ref={observerTargetRef} className="gallery-scroll-sentinel" />
      </main>
    </div>
  );
}
