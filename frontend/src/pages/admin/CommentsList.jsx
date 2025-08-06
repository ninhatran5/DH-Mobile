/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminComments,
  deleteComment,
  clearError,
  fetchCommentReplyById,
  toggleCommentVisibility,
} from "../../slices/adminComments";
import { FiTrash2, FiEye, FiSearch } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../../assets/admin/adminComment.css";
import DefaultImage from "../../assets/images/adminacccount.jpg";
import Loading from "../../components/Loading";

const MySwal = withReactContent(Swal);

const CommentsList = () => {
  const dispatch = useDispatch();
  const { comments, pagination, loading, error, deleteLoading, deleteError } =
    useSelector((state) => state.adminComments);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminComments());
  }, [dispatch]);
  useEffect(() => {
    if (error) {
      MySwal.fire({
        title: "Lỗi",
        text: error,
        icon: "error",
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (deleteError) {
      MySwal.fire({
        title: "Lỗi",
        text: deleteError,
        icon: "error",
      });
      dispatch(clearError());
    }
  }, [deleteError, dispatch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredComments = comments?.filter(
    (comment) =>
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleVisibility = async (commentId) => {
    try {
      await dispatch(toggleCommentVisibility(commentId)).unwrap();
      MySwal.fire("Thành công", "Đã cập nhật trạng thái hiển thị", "success");
    } catch (err) {
      console.error("Toggle visibility error:", err);
      MySwal.fire("Lỗi", err?.message || "Đã xảy ra lỗi", "error");
    }
  };

  const handleDeleteComment = (commentId) => {
    MySwal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc muốn xóa bình luận này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteComment(commentId))
          .unwrap()
          .then(() => {
            MySwal.fire("Thành công", "Đã xóa bình luận thành công", "success");
          })
          .catch((err) => {});
      }
    });
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedComment) return;
    setReplySubmitting(true);
    try {
      await dispatch(
        fetchCommentReplyById({
          commentId: selectedComment.comment_id,
          reply: replyInput,
        })
      ).unwrap();
      setReplyInput("");
      dispatch(fetchAdminComments());
    } catch (err) {
      MySwal.fire("Lỗi", err?.message || "Đã xảy ra lỗi", "error");
    }
    setReplySubmitting(false);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <AiFillStar
          key={i}
          size={18}
          color={i < rating ? "#FFD700" : "#e4e5e9"}
        />
      );
    }
    return stars;
  };

  return (
    <div className="admin-comments-container">
      <div className="admin-comments-header">
        <h1>Quản lý bình luận</h1>
      </div>

      <div className="admin-comments-search-row">
        <div className="admin-comments-search-box">
          <FiSearch className="admin-comments-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bình luận, sản phẩm, người dùng..."
            value={searchTerm}
            onChange={handleSearch}
            className="admin-comments-search-input"
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="admin-comments-table-wrapper">
          <table className="admin-comments-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Người dùng</th>
                <th>Sản phẩm</th>
                <th>Bình luận</th>
                <th>Phản Hồi</th>
                <th>Đánh giá</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments?.length > 0 ? (
                filteredComments?.map((comment, index) => (
                  <React.Fragment key={comment.comment_id}>
                    <tr>
                      <td>{(currentPage - 1) * 10 + index + 1}</td>
                      <td>
                        <div className="comment-user-info">
                          <img
                            src={comment.user.image_url || DefaultImage}
                            alt={comment.user.username}
                            className="comment-user-avatar"
                          />
                          <div>
                            <div className="comment-user-name">
                              {comment.user.username}
                            </div>
                            <div className="comment-user-email">
                              {comment.user.email}
                            </div>
                          </div>
                          <div className="comment-user-name">
                            {comment.user.name}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          className="comment-product-info comment-product-flex"
                          style={{ fontSize: "0.92em" }}
                        >
                          {comment.variant ? (
                            <>
                              <a
                                href={`/product-detail/${comment.product_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={comment.variant.image_url}
                                  alt={comment.variant.sku}
                                  className="comment-product-image"
                                />
                              </a>
                              <div
                                className="comment-product-name"
                                style={{ fontSize: "0.95em" }}
                              >
                                <p>{comment?.product?.name}</p>
                                {comment.variant_attributes &&
                                  comment.variant_attributes.length > 0 && (
                                    <div
                                      className="comment-variant-attributes"
                                      style={{
                                        fontSize: "0.85em",
                                        color: "#555",
                                        display: "flex",
                                        gap: "8px",
                                        marginTop: "2px",
                                        fontWeight: 500,
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                      }}
                                    >
                                      {comment.variant_attributes.map(
                                        (attr, idx) => (
                                          <span
                                            key={idx}
                                            style={{ whiteSpace: "nowrap" }}
                                          >
                                            {attr.attribute_name}:{" "}
                                            {attr.attribute_value}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            </>
                          ) : (
                            <>
                              <img
                                src={comment.product.image_url}
                                alt={comment.product.name}
                                className="comment-product-image"
                              />
                              <div
                                className="comment-product-name"
                                style={{ fontSize: "0.95em" }}
                              >
                                {comment.product.name}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <div
                          className={`comment-content${
                            !comment.reply ? " comment-content-pointer" : ""
                          }`}
                          onClick={() => {
                            if (!comment.reply) {
                              setActiveReplyId(comment.comment_id);
                              setReplyInput("");
                            }
                          }}
                        >
                          {comment.content.length > 100
                            ? `${comment.content.substring(0, 100)}...`
                            : comment.content}
                        </div>
                      </td>
                      <td>
                        {comment.reply ? (
                          // Đã có phản hồi
                          <div className="comment-reply-bubble">
                            <span className="comment-reply-label">
                              Phản hồi:
                            </span>
                            <span>{comment.reply}</span>
                          </div>
                        ) : (
                          <div>
                            {activeReplyId === comment.comment_id ? (
                              <form
                                className="comment-reply-form"
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  if (!replyInput.trim()) return;
                                  setReplySubmitting(true);
                                  try {
                                    await dispatch(
                                      fetchCommentReplyById({
                                        commentId: comment.comment_id,
                                        reply: replyInput,
                                      })
                                    ).unwrap();
                                    setReplyInput("");
                                    setActiveReplyId(null);
                                    dispatch(fetchAdminComments());
                                  } catch (err) {
                                    MySwal.fire(
                                      "Lỗi",
                                      err?.message || "Đã xảy ra lỗi",
                                      "error"
                                    );
                                  }
                                  setReplySubmitting(false);
                                }}
                              >
                                <input
                                  type="text"
                                  placeholder="Nhập phản hồi..."
                                  value={replyInput}
                                  onChange={(e) =>
                                    setReplyInput(e.target.value)
                                  }
                                  className="comment-reply-input"
                                  disabled={replySubmitting}
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  className="comment-reply-btn"
                                  disabled={
                                    replySubmitting || !replyInput.trim()
                                  }
                                >
                                  {replySubmitting ? "..." : "Gửi"}
                                </button>
                              </form>
                            ) : (
                              <button
                                className="comment-reply-toggle-btn"
                                onClick={() => {
                                  setActiveReplyId(comment.comment_id);
                                  setReplyInput("");
                                }}
                                style={{
                                  fontSize: "0.8em",
                                  padding: "4px 8px",
                                  backgroundColor: "#007bff",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  textAlign: "center",
                                }}
                              >
                                Trả lời bình luận
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="comment-rating-stars">
                          {renderStars(comment.rating)}
                        </div>
                      </td>
                      <td>
                        <div
                          className="comment-actions"
                          style={{ display: "flex", gap: "6px" }}
                        >
                          <button
                            className="comment-delete-btn"
                            onClick={() =>
                              handleDeleteComment(comment.comment_id)
                            }
                            disabled={deleteLoading}
                            title="Xoá bình luận"
                            style={{
                              padding: "4px",
                              borderRadius: "4px",
                              border: "none",
                              backgroundColor: "#fff",
                              color: "#dc3545",
                              cursor: "pointer",
                              fontSize: "0.9em",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <FiTrash2 size={14} />
                          </button>

                          <button
                            className={`comment-toggle-btn ${
                              !comment.is_visible ? "hidden" : "visible"
                            }`}
                            onClick={() =>
                              handleToggleVisibility(comment.comment_id)
                            }
                            title={
                              comment.is_visible
                                ? "Ẩn bình luận"
                                : "Hiện bình luận"
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 6px",
                              fontSize: "0.75em",
                              border: "1px solid #cce5cc",
                              borderRadius: "4px",
                              backgroundColor: "#e6f5e6",
                              color: "#28a745",
                              cursor: "pointer",
                            }}
                          >
                            <FiEye
                              size={13}
                              style={{
                                opacity: comment.is_visible ? 1 : 0.4,
                                color: "#28a745",
                              }}
                            />
                            <span style={{ fontWeight: 500 }}>
                              {comment.is_visible ? "Hiện" : "Ẩn"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin-comments-empty">
                    <i
                      className="bi bi-chat-square-text"
                      style={{ fontSize: "2rem" }}
                    ></i>
                    <p>Không tìm thấy bình luận nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CommentsList;
