import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Components.css';
import { auth } from '../utils/auth';

const API_BASE = 'http://localhost:3001/api';

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
  const [activeTab, setActiveTab] = useState('all-time');
  const [roasts, setRoasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [commentModal, setCommentModal] = useState({ isOpen: false, roastId: null });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const limit = endpoint === 'recent' ? 6 : 10;
      const response = await fetch(`${API_BASE}/leaderboard/${endpoint}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      setRoasts(data);
    } catch (err) {
      setError(err.message);
      setRoasts([]);
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setRoasts([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const openCommentModal = async (roastId) => {
    setCommentModal({ isOpen: true, roastId });
    setCommentLoading(true);
    try {
      const response = await fetch(`${API_BASE}/comments/${roastId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const closeCommentModal = () => {
    setCommentModal({ isOpen: false, roastId: null });
    setComments([]);
    setNewComment('');
  };

  const submitComment = async () => {
    if (!newComment.trim() || !commentModal.roastId) return;
    
    const token = auth.getToken();
    if (!token) {
      alert('You must be logged in to comment');
      return;
    }
    
    setCommentLoading(true);
    try {
      const response = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roastId: commentModal.roastId,
          comment: newComment.trim()
        }),
      });
      
      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [...prev, newCommentData]);
        setNewComment('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit comment');
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
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
                <div className="roast-actions">
                  <button className="like-btn" title="Like">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <button className="comment-btn" title="Comments" onClick={() => openCommentModal(roast.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {roast.commentCount > 0 && (
                      <span className="comment-count">{roast.commentCount}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {commentModal.isOpen && (
        <div className="modal-overlay" onClick={closeCommentModal}>
          <div className="modal-content comment-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeCommentModal}>
              ✕
            </button>
            <h3 className="modal-title">Comments</h3>
            
            <div className="comments-list">
              {commentLoading ? (
                <div className="comment-loading">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="no-comments">No comments yet. Be the first to comment!</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.username}</span>
                      <span className="comment-time">{formatDateTime(comment.date)}</span>
                    </div>
                    <div className="comment-text">{comment.comment}</div>
                  </div>
                ))
              )}
            </div>

            <div className="add-comment-section">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
                rows="3"
                maxLength="200"
              />
              <div className="comment-actions">
                <span className="char-counter">{newComment.length}/200</span>
                <button 
                  className="submit-comment-btn"
                  onClick={submitComment}
                  disabled={!newComment.trim() || commentLoading}
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
