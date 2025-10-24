import React, { useState, useEffect, useCallback } from 'react';
import './Components.css';
import { auth } from '../utils/auth';

const API_BASE = 'https://roastbattles-backend.azurewebsites.net/api';

const getScoreGradient = (score) => {
  if (score >= 90) {
    return 'linear-gradient(135deg,rgb(129, 11, 255) 0%,rgb(170, 0, 153) 100%)';
  } else if (score >= 80) {
    return 'linear-gradient(135deg, #22ff88 0%, #00aa44 100%)';
  } else if (score >= 60) {
      return 'linear-gradient(135deg, #ffff00 0%, #88dd00 100%)';
  } else if (score >= 40) {
    return 'linear-gradient(135deg, #ffdd00 0%,rgb(255, 168, 28) 100%)';
  } else if (score >= 20) {
    return 'linear-gradient(135deg,rgb(255, 149, 0) 0%,rgb(221, 55, 0) 100%)';
  } else {
    return 'linear-gradient(135deg,rgb(255, 37, 37) 0%,rgb(177, 1, 1) 100%)';
  }
};

function Leaderboard() {
  const [activeTab, setActiveTab] = useState('recent');
  const [roasts, setRoasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [showCommentsScreen, setShowCommentsScreen] = useState(false);
  const [commentsForRoast, setCommentsForRoast] = useState(null);

  const fetchLeaderboard = useCallback(async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const limit = endpoint === 'recent' ? 6 : 10;
      const response = await fetch(`${API_BASE}/leaderboard/${endpoint}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      setRoasts(data);
      
      await fetchLikesAndComments(data);
    } catch (err) {
      setError(err.message);
      setRoasts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLikesAndComments = useCallback(async (roastsData) => {
    const likesData = {};
    const commentsData = {};
    
    for (const roast of roastsData) {
      try {
        const likesResponse = await fetch(`${API_BASE}/likes/${roast.id}`);
        if (likesResponse.ok) {
          const likesResult = await likesResponse.json();
          likesData[roast.id] = likesResult.likeCount;
        }
        
        const commentsResponse = await fetch(`${API_BASE}/comments/${roast.id}`);
        if (commentsResponse.ok) {
          const commentsResult = await commentsResponse.json();
          commentsData[roast.id] = commentsResult;
        }
      } catch (err) {
        console.error(`Error fetching data for roast ${roast.id}:`, err);
      }
    }
    
    setLikes(likesData);
    setComments(commentsData);
  }, []);

  const searchDatabase = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/leaderboard/search?q=${encodeURIComponent(query)}&limit=100`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }
      const data = await response.json();
      setRoasts(data);
      
      await fetchLikesAndComments(data);
    } catch (err) {
      setError(err.message);
      setRoasts([]);
    } finally {
      setLoading(false);
    }
  }, [fetchLikesAndComments]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchDatabase(searchQuery);
    } else {
      fetchLeaderboard(activeTab);
    }
  }, [searchQuery, activeTab, fetchLeaderboard, searchDatabase]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      const interval = setInterval(() => {
        fetchLeaderboard(activeTab);
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [activeTab, searchQuery, fetchLeaderboard]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLike = async (roastId) => {
    const token = auth.getToken();
    if (!token) {
      alert('Please log in to like roasts');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/likes/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roastId })
      });

      if (response.ok) {
        const result = await response.json();
        setLikes(prev => ({
          ...prev,
          [roastId]: result.likeCount
        }));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to like roast');
      }
    } catch (err) {
      console.error('Error liking roast:', err);
      alert('Failed to like roast');
    }
  };

  const handleCommentClick = (roastId) => {
    const roast = roasts.find(r => r.id === roastId);
    setCommentsForRoast(roast);
    setShowCommentsScreen(true);
  };



  const handleAddComment = async () => {
    const token = auth.getToken();
    if (!token) {
      alert('Please log in to comment');
      return;
    }

    if (newComment.trim() && commentsForRoast) {
      try {
        const response = await fetch(`${API_BASE}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            roastId: commentsForRoast.id,
            commentText: newComment.trim()
          })
        });

        if (response.ok) {
          const commentsResponse = await fetch(`${API_BASE}/comments/${commentsForRoast.id}`);
          if (commentsResponse.ok) {
            const commentsResult = await commentsResponse.json();
            setComments(prev => ({
              ...prev,
              [commentsForRoast.id]: commentsResult
            }));
          }
          setNewComment('');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Failed to add comment');
        }
      } catch (err) {
        console.error('Error adding comment:', err);
        alert('Failed to add comment');
      }
    }
  };

  const handleBackToLeaderboard = () => {
    setShowCommentsScreen(false);
    setCommentsForRoast(null);
    setNewComment('');
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="component-container leaderboard">
      <h2>Leaderboard</h2>
      
      <div className="leaderboard-tabs">
        <button
          className={`leaderboard-tab ${activeTab === 'all-time' ? 'active' : ''}`}
          onClick={() => handleTabChange('all-time')}
        >
          All-time
        </button>
        <button
          className={`leaderboard-tab ${activeTab === 'past-7-days' ? 'active' : ''}`}
          onClick={() => handleTabChange('past-7-days')}
        >
          Past 7 days
        </button>
        <button
          className={`leaderboard-tab ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => handleTabChange('recent')}
        >
          Recent
        </button>
      </div>

      <div className="leaderboard-search">
        <input
          type="text"
          placeholder="Search players or roasts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="leaderboard-search-input" 
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="search-clear-btn"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className={`leaderboard-entries ${activeTab === 'recent' ? 'recent-tab' : ''}`}>
        {loading ? (
          <div className="leaderboard-message">Loading...</div>
        ) : error ? (
          <div className="leaderboard-message">Error: {error}</div>
        ) : roasts.length === 0 ? (
          <div className="leaderboard-message">
            {searchQuery ? `No results found for "${searchQuery}"` : 'No roasts yet. Be the first to submit!'}
          </div>
        ) : (
          roasts.map((roast, index) => (
            <div key={roast.id} className="leaderboard-entry">
              <div 
                className="score" 
                style={{ 
                  background: getScoreGradient(roast.score),
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                {roast.score}
              </div>
              <div className="roast-content">
                <p className="author">
                  {activeTab !== 'recent' && index === 0 && '👑 '}
                  {roast.username}
                </p>
                <p className="text">{roast.roast}</p>
                <p className="time-stamp">{formatDateTime(roast.date)}</p>
                <div className="entry-actions">
                  <button 
                    className="like-btn"
                    onClick={() => handleLike(roast.id)}
                    title="Like this roast"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {likes[roast.id] || 0}
                  </button>
                  <button 
                    className="comment-btn"
                    onClick={() => handleCommentClick(roast.id)}
                    title="Add a comment"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                    {comments[roast.id]?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCommentsScreen && commentsForRoast && (
        <div className="modal-overlay">
          <div className="comments-modal">
            <h2 className="modal-title">Comments</h2>
            <button 
              className="modal-close-btn"
              onClick={handleBackToLeaderboard}
            >
              ✕
            </button>
            
            <div className="comments-roast-info">
              <p className="comments-roast-text">"{commentsForRoast.roast}"</p>
              <p className="comments-roast-author">by {commentsForRoast.username}</p>
            </div>
            
            <div className="comments-list">
              {comments[commentsForRoast.id]?.length > 0 ? (
                comments[commentsForRoast.id].map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.username}</span>
                      <span className="comment-time">{formatDateTime(comment.created_at)}</span>
                    </div>
                    <p className="comment-text">{comment.comment_text}</p>
                  </div>
                ))
              ) : (
                <div className="no-comments">No comments yet. Be the first to comment!</div>
              )}
            </div>

            <div className="add-comment-section">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                className="comment-input"
                rows="3"
              />
              <button 
                className="modal-submit-btn"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Leaderboard;
