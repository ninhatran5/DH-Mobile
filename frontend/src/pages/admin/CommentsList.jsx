import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminComments, deleteComment, clearError, fetchCommentReplyById } from "../../slices/adminComments";
import { FiTrash2, FiEye, FiSearch } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../../assets/admin/adminComment.css"
const MySwal = withReactContent(Swal);

const CommentsList = () => {
  const dispatch = useDispatch();
  const { comments: rawComments = [], ...rest } = useSelector(
    (state) => state.adminComments
  );
  const comments = Array.isArray(rawComments) ? rawComments : [];
  const { pagination, loading, error, deleteLoading, deleteError } = rest;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const replyDetail = useSelector(state => state.adminComments.replyDetail);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

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
      (comment.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedComment) return;
    setReplySubmitting(true);
    try {
      // Gửi phản hồi lên server bằng fetchCommentReplyById (dùng dispatch)
      await dispatch(fetchCommentReplyById({ commentId: selectedComment.comment_id, reply: replyInput })).unwrap();
      setReplyInput("");
      // Sau khi gửi thành công, có thể gọi lại fetchAdminComments hoặc fetchCommentReplyById để cập nhật giao diện nếu cần
      await dispatch(fetchCommentReplyById(selectedComment.comment_id));
    } catch (err) {
      // Xử lý lỗi nếu cần
    }
    setReplySubmitting(false);
  };

  return (
    <div className="admin-comment-container">
        <br/>
      <div className="admin-comment-header">
        <div className="admin-comment-header-title">
          <h1>Quản lý bình luận</h1>
          <p className="text-muted">Quản lý tất cả các bình luận của người dùng</p>
        </div>
      </div>

      <div className="admin-comment-search-container" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <div className="admin-comment-search-box" style={{ maxWidth: '600px', width: '100%' }}>
          <FiSearch className="admin-comment-search-icon" />
          <input
            type="text"
            className="admin-comment-search-input"
            placeholder="Tìm kiếm bình luận, sản phẩm, người dùng..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-comment-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="admin-comment-table-container">
          <table className="admin-comment-table">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>STT</th>
                <th style={{ width: "18%" }}>Người dùng</th>
                <th style={{ width: "18%" }}>Sản phẩm</th>
                <th style={{ width: "24%" }}>Nội dung</th>
                <th style={{ width: "10%" }}>Đánh giá</th>
                <th style={{ width: "15%" }}>Ngày tạo</th>
                <th style={{ width: "10%" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.length > 0 ? (
                filteredComments.map((comment, index) => (
                  <tr key={comment.comment_id}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    <td>
                      <div className="admin-comment-user-info">
                        <img
                          src={comment.user.image_url}
                          alt={comment.user.username}
                          className="admin-comment-user-avatar"
                        />
                        <div>
                          <div className="admin-comment-user-name">{comment.user.username}</div>
                          <div className="admin-comment-user-email">{comment.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-comment-product-info">
                        <img
                          src={comment.product.image_url}
                          alt={comment.product.name}
                          className="admin-comment-product-image"
                        />
                        <div className="admin-comment-product-name">{comment.product.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-comment-content">
                        {comment.content.length > 100
                          ? `${comment.content.substring(0, 100)}...`
                          : comment.content}
                      </div>
                    </td>
                    <td>
                      <div className="admin-comment-rating">{renderStars(comment.rating)}</div>
                    </td>
                    <td>{formatDate(comment.created_at)}</td>
                    <td>
                      <div className="admin-comment-actions">
                        <button
                          className="admin-comment-btn admin-comment-btn-view"
                          onClick={() => handleViewComment(comment)}
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          className="admin-comment-btn admin-comment-btn-delete"
                          onClick={() => handleDeleteComment(comment.comment_id)}
                          disabled={deleteLoading}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="admin-comment-empty-table">
                    <i className="bi bi-chat-square-text" style={{ fontSize: "2rem" }}></i>
                    <p>Không tìm thấy bình luận nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedComment && (
        <div className="admin-comment-modal-backdrop">
          <div className="admin-comment-modal">
            <div className="admin-comment-modal-header">
              <h2>Chi tiết bình luận</h2>
              <button
                className="admin-comment-modal-close"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="admin-comment-modal-body">
              <div className="admin-comment-detail">
                <div className="admin-comment-user">
                  <img
                    src={selectedComment.user.image_url}
                    alt={selectedComment.user.username}
                    className="admin-comment-user-avatar-large"
                  />
                  <div>
                    <h3>{selectedComment.user.full_name}</h3>
                    <p>@{selectedComment.user.username}</p>
                    <p>{selectedComment.user.email}</p>
                  </div>
                </div>
                
                <div className="admin-comment-product">
                  <h4>Sản phẩm:</h4>
                  <div className="admin-comment-product-detail">
                    <img
                      src={selectedComment.product.image_url}
                      alt={selectedComment.product.name}
                      className="admin-comment-product-image-large"
                    />
                    <div>
                      <h3>{selectedComment.product.name}</h3>
                      <p className="admin-comment-product-price">
                        {parseInt(selectedComment.product.price).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="admin-comment-content-full">
                  <h4>Bình Luận:</h4>
                  <p>{selectedComment.content}</p>
                </div>

                <div className="admin-comment-content-full">
                  <h4>Phản hồi :</h4>
                  <p>{selectedComment.reply}</p>
                </div>

                <div className="admin-comment-rating">
                  <h4>Đánh giá: {selectedComment.rating}/5</h4>
                  <div>{renderStars(selectedComment.rating)}</div>
                </div>
                
                <div className="admin-comment-date">
                  <h4>Ngày đăng:</h4>
                  <p>{formatDate(selectedComment.created_at)}</p>
                </div>
                
               
                <form
                  onSubmit={handleReplySubmit}
                  style={{ marginTop: 16 }}
                >
                  <input
                    type="text"
                    placeholder="Nhập phản hồi..."
                    value={replyInput}
                    onChange={e => setReplyInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      marginBottom: 8
                    }}
                    disabled={replySubmitting}
                  />
                  <button
                    type="submit"
                    disabled={replySubmitting || !replyInput.trim()}
                    style={{
                      padding: "8px 16px",
                      background: "#0071e3",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: replySubmitting ? "not-allowed" : "pointer"
                    }}
                  >
                    {replySubmitting ? "Đang gửi..." : "Gửi phản hồi"}
                  </button>
                </form>
              </div>
            </div>
            <div className="admin-comment-modal-footer">
              <button
                className="admin-comment-btn admin-comment-btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
              <button
                className="admin-comment-btn admin-comment-btn-danger"
                onClick={() => {
                  handleDeleteComment(selectedComment.comment_id);
                  setShowModal(false);
                }}
                disabled={deleteLoading}
              >
                Xóa bình luận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsList;