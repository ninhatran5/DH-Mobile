import React, { useEffect, useState } from "react";
import { useDispatch, useSelector }  from "react-redux";
import { fetchAdminComments, deleteComment, clearError, fetchCommentReplyById } from "../../slices/adminComments";
import { FiTrash2, FiEye, FiSearch } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../../assets/admin/adminComment.css"
import DefaultImage from "../../assets/images/adminacccount.jpg";

const MySwal = withReactContent(Swal);

const CommentsList = () => {
  const dispatch = useDispatch();
  const { comments, pagination, loading, error, deleteLoading, deleteError } = useSelector(
    (state) => state.adminComments
  );
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
console.log(comments)
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

  const filteredComments = comments.filter(
    (comment) =>
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewComment = (comment) => {
    setSelectedComment(comment);
    setShowModal(true);
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
          .catch((err) => {
          });
      }
    });
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedComment) return;
    setReplySubmitting(true);
    try {
      // Gửi phản hồi lên server
      await dispatch(
        fetchCommentReplyById({ commentId: selectedComment.comment_id, reply: replyInput })
      ).unwrap();
      setReplyInput("");
      // Có thể reload lại bình luận nếu muốn cập nhật giao diện
      dispatch(fetchAdminComments());
    } catch (err) {
      // Xử lý lỗi nếu cần
    }
    setReplySubmitting(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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
        <div className="admin-comments-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
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
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.length > 0 ? (
                filteredComments.map((comment, index) => (
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
                            <div className="comment-user-name">{comment.user.username}</div>
                            <div className="comment-user-email">{comment.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="comment-product-info">
                          <img
                            src={comment.product.image_url}
                            alt={comment.product.name}
                            className="comment-product-image"
                          />
                          <div className="comment-product-name">
                            {comment.product.name}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          className={`comment-content${!comment.reply ? " comment-content-pointer" : ""}`}
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
                        {comment.reply && (
                          <div className="comment-reply-bubble">
                            <span className="comment-reply-label">Phản hồi:</span>
                            <span>{comment.reply}</span>
                          </div>
                        )}
                        {!comment.reply && activeReplyId === comment.comment_id && (
                          <form
                            className="comment-reply-form"
                            onSubmit={async e => {
                              e.preventDefault();
                              if (!replyInput.trim()) return;
                              setReplySubmitting(true);
                              try {
                                await dispatch(
                                  fetchCommentReplyById({ commentId: comment.comment_id, reply: replyInput })
                                ).unwrap();
                                setReplyInput("");
                                setActiveReplyId(null);
                                dispatch(fetchAdminComments());
                              } catch (err) {}
                              setReplySubmitting(false);
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Nhập phản hồi..."
                              value={replyInput}
                              onChange={e => setReplyInput(e.target.value)}
                              className="comment-reply-input"
                              disabled={replySubmitting}
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="comment-reply-btn"
                              disabled={replySubmitting || !replyInput.trim()}
                            >
                              {replySubmitting ? "..." : "Gửi"}
                            </button>
                          </form>
                        )}
                      </td>
                      <td>
                        <div className="comment-rating-stars">
                          {renderStars(comment.rating)}
                        </div>
                      </td>
                      <td className="comment-date">{formatDate(comment.created_at)}</td>
                      <td>
                        <div className="comment-actions">
                          <button
                            className="comment-delete-btn"
                            onClick={() => handleDeleteComment(comment.comment_id)}
                            disabled={deleteLoading}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin-comments-empty">
                    <i className="bi bi-chat-square-text" style={{ fontSize: "2rem" }}></i>
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