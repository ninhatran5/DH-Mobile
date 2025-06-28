import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNews } from "../../slices/newsSlice";
import { Link } from "react-router-dom";
import "../../assets/admin/article.css";

const ArticlesList = () => {
  const dispatch = useDispatch();
  const { newsList, loading, error } = useSelector((state) => state.adminNews);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="articles-container">
      <div className="article-header">
        <div className="article-header-content">
          <div>
            <h1 className="article-title">Bài viết</h1>
            <p className="article-count">
              {newsList?.length || 0} bài viết
            </p>
          </div>
          <button className="add-article-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Thêm bài viết
          </button>
        </div>
      </div>

      {newsList && newsList.map((news) => (
        <article key={news._id} className="article-card">
          <div className="article-content">
            <div className="article-meta">
              <img
                src={news.user?.image_url || "https://via.placeholder.com/40"}
                alt={news.user?.full_name}
                className="article-author-avatar"
              />
              <div className="article-author-info">
                <div className="article-author-name">
                  {news.user?.full_name || "Admin"}
                </div>
                <div className="article-timestamp">
                  {new Date(news.created_at).toLocaleDateString("vi-VN")}
                </div>
              </div>
             
            </div>

            <div className="article-text">
              <h2 className="article-main-title">{news.title}</h2>
              <p className="article-description">
                {news.description || news.content}
              </p>
            </div>
          </div>

          {news.image_url && (
            <img
              src={news.image_url}
              alt={news.title}
              className="article-image"
            />
          )}

          <div className="article-actions">
            <Link 
              to={`/admin/news/${news.news_id}`}
              className="action-button view-button"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Chi tiết
            </Link>
            <button className="action-button delete-button">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa
            </button>
          </div>
        </article>
      ))}

      {newsList && newsList.length === 0 && (
        <div className="empty-state">
          <svg className="empty-icon" width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="empty-text">Chưa có bài viết nào</p>
        </div>
      )}
    </div>
  );
};

export default ArticlesList;
