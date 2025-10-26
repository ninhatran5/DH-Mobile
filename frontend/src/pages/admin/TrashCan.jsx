/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { IoTrashBin } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  deletePermanently,
  getDeletePost,
  restoreNews,
} from "../../slices/newsSlice";
import Loading from "../../components/Loading";
import { MdOutlineRestore } from "react-icons/md";
import Swal from "sweetalert2";

const TrashCan = () => {
  const dispatch = useDispatch();
  const { newsList, loading } = useSelector((state) => state.adminNews);

  const handleRestoreNews = async (newsId) => {
    try {
      await dispatch(restoreNews(newsId)).unwrap();
      Swal.fire({
        icon: "success",
        title: "Khôi phục thành công",
        text: "Bài viết đã được khôi phục.",
        timer: 1500,
        showConfirmButton: false,
      });
      dispatch(getDeletePost());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể khôi phục bài viết. Vui lòng thử lại sau.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };
  const handleDeletePermanently = async (newsId) => {
    try {
      await dispatch(deletePermanently(newsId)).unwrap();
      Swal.fire({
        icon: "success",
        title: "Đã xóa vĩnh viễn",
        text: "Bài viết đã được xóa hoàn toàn.",
        timer: 1500,
        showConfirmButton: false,
      });
      dispatch(getDeletePost());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
        text: "Không thể xóa bài viết.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    dispatch(getDeletePost());
  }, [dispatch]);

  return (
    <>
      {loading && <Loading />}
      <div className="articles-container">
        <div className="article-header">
          <div className="article-header-content">
            <div>
              <h1 className="article-title">Thùng rác</h1>
              <p className="article-count">{newsList.length} mục đã bị xóa</p>
            </div>
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
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        color: "#888",
                        fontSize: 13,
                        marginLeft: "auto",
                      }}
                    >
                      {`${new Date(news.deleted_at).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )} - ${new Date(news.deleted_at).toLocaleDateString(
                        "vi-VN"
                      )}`}
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
                        ? news.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 200) + "..."
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
                      onClick={() => handleRestoreNews(news.news_id)}
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
                      <MdOutlineRestore style={{ fontSize: 18 }} />
                      Khôi phục
                    </button>
                    <button
                      onClick={() => handleDeletePermanently(news.news_id)}
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
                      Xóa vĩnh viễn
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {newsList.length === 0 && (
          <div className="empty-state">
            <IoTrashBin
              style={{ width: "50px", height: "50px", marginBottom: 10 }}
            />
            <p className="empty-text">Không có mục nào bị xóa</p>
          </div>
        )}
      </div>
    </>
  );
};
export default TrashCan;
