/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNews, putInTheTrash } from "../../slices/newsSlice";
import { useNavigate } from "react-router-dom";
import "../../assets/admin/article.css";
import { RxUpdate } from "react-icons/rx";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";

const ArticlesList = () => {
  const dispatch = useDispatch();
  const { newsList, loading, error } = useSelector((state) => state.adminNews);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  const navigate = useNavigate();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const handleDelete = async (newsId) => {
    if (newsId) {
      try {
        await dispatch(putInTheTrash(newsId)).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Đã đưa vào thùng rác",
          text: "Bài viết đã được đưa vào thùng rác.",
          confirmButtonText: "OK",
        });
        dispatch(fetchNews());
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Có lỗi xảy ra khi xóa bài viết.",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Không thể xóa",
        text: "Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
      });
    }
  };

  const handleNextPageUpdate = (newsId) => {
    navigate(`/admin/blog/update-blog/${newsId}`);
  };

  const handleNextPageBlogDetail = (newsId) => {
    navigate(`/admin/blog/blog-detail-admin/${newsId}`);
  };

  const handleNextPageAdd = () => {
    navigate(`/admin/blog/add-blog`);
  };

  return (
    <div className="articles-container">
      <div className="article-header">
        <div className="article-header-content">
          <div>
            <h1 className="article-title">Bài viết</h1>
            <p className="article-count">{newsList?.length || 0} bài viết</p>
          </div>
          <button onClick={handleNextPageAdd} className="add-article-btn">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm bài viết
          </button>
        </div>
      </div>

      {newsList && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: 32,
            marginTop: 8,
          }}
        >
          {newsList.map((news, idx) => (
            <article
              key={news.news_id}
              className="article-card"
              style={{
                borderRadius: 20,
                boxShadow: "0 4px 24px #0002",
                background: "#fff",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                position: "relative",
                transition:
                  "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)",
                animation: `fadeInUp 0.5s ${0.05 * idx}s both`,
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-6px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 32px #0003";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 24px #0002";
              }}
            >
              {news.image_url && (
                <img
                  src={news.image_url}
                  alt={news.title}
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderBottom: "1px solid #eee",
                    boxShadow: "0 2px 8px #0001",
                  }}
                />
              )}
              <div
                style={{
                  padding: "24px 24px 18px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <img
                    src={
                      news.user?.image_url || "https://via.placeholder.com/40"
                    }
                    alt={news.user?.full_name}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #e5e7eb",
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {news.user?.full_name || "Admin"}
                  </div>
                  <div
                    style={{ color: "#888", fontSize: 13, marginLeft: "auto" }}
                  >
                    {new Date(news.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    margin: "8px 0 12px 0",
                    color: "#222",
                    lineHeight: 1.2,
                  }}
                >
                  {news.title}
                </h2>
                {news.category && (
                  <span
                    style={{
                      display: "inline-block",
                      background: "#e3f2fd",
                      color: "#1976d2",
                      fontWeight: 500,
                      fontSize: 13,
                      borderRadius: 6,
                      padding: "2px 12px",
                      marginBottom: 8,
                      width: "fit-content",
                    }}
                  >
                    {news.category}
                  </span>
                )}
                <p
                  style={{
                    color: "#444",
                    fontSize: 15,
                    marginBottom: 0,
                    lineHeight: 1.6,
                    minHeight: 60,
                  }}
                >
                  {news?.content
                    ? news.content.replace(/<[^>]*>/g, "").length > 200
                      ? news.content.replace(/<[^>]*>/g, "").substring(0, 200) +
                        "..."
                      : news.content.replace(/<[^>]*>/g, "")
                    : ""}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 18,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => handleNextPageBlogDetail(news.news_id)}
                    style={{
                      background: "#f3f4f6",
                      color: "#222",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 20px",
                      fontWeight: 500,
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#e0e7ef")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#f3f4f6")
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Chi tiết
                  </button>
                  <button
                    onClick={() => handleNextPageUpdate(news.news_id)}
                    style={{
                      background: "#b3e5fc",
                      color: "#222",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 20px",
                      fontWeight: 500,
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#81d4fa")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#b3e5fc")
                    }
                  >
                    <RxUpdate />
                    Cập nhật
                  </button>
                  <button
                    onClick={() => handleDelete(news.news_id)}
                    style={{
                      background: "#ffebee",
                      color: "#d32f2f",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 20px",
                      fontWeight: 500,
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#ffcdd2")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#ffebee")
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {newsList && newsList.length === 0 && (
        <div className="empty-state">
          <svg
            className="empty-icon"
            width="48"
            height="48"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <p className="empty-text">Chưa có bài viết nào</p>
        </div>
      )}
    </div>
  );
};

export default ArticlesList;
