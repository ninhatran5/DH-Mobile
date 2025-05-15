import React, { useState, useEffect } from 'react';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/comment.css';

const CommentsList = () => {
  // State for comments data
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [posts, setPosts] = useState([]);

  // Mock data for comments
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockPosts = [
        { id: 1, title: 'iPhone 15 Pro Max: Đánh giá chi tiết' },
        { id: 2, title: 'Top 10 phụ kiện không thể thiếu cho smartphone' },
        { id: 3, title: 'So sánh Galaxy S23 Ultra và iPhone 14 Pro Max' },
        { id: 4, title: 'Cách chọn ốp lưng phù hợp cho điện thoại của bạn' },
        { id: 5, title: 'Mẹo tiết kiệm pin cho smartphone trong ngày dài' }
      ];
      
      const mockComments = [
        {
          id: 1,
          userId: 101,
          userName: 'Nguyễn Văn A',
          userAvatar: 'https://i.pravatar.cc/150?img=1',
          postId: 1,
          postTitle: 'iPhone 15 Pro Max: Đánh giá chi tiết',
          content: 'Bài viết rất hay và chi tiết. Cảm ơn admin đã chia sẻ thông tin hữu ích!',
          status: 'published',
          isAdmin: false,
          createdAt: '2023-10-15T09:30:00',
          likes: 5,
          replies: [
            {
              id: 2,
              userId: 999,
              userName: 'Admin',
              userAvatar: 'https://i.pravatar.cc/150?img=70',
              content: 'Cảm ơn bạn đã theo dõi bài viết. Rất vui khi bài viết hữu ích với bạn!',
              createdAt: '2023-10-15T10:45:00',
              isAdmin: true
            }
          ]
        },
        {
          id: 3,
          userId: 102,
          userName: 'Trần Thị B',
          userAvatar: 'https://i.pravatar.cc/150?img=2',
          postId: 1,
          postTitle: 'iPhone 15 Pro Max: Đánh giá chi tiết',
          content: 'iPhone 15 Pro Max quá đắt, không đáng giá so với những gì được cải tiến.',
          status: 'published',
          isAdmin: false,
          createdAt: '2023-10-16T14:20:00',
          likes: 2,
          replies: []
        },
        {
          id: 4,
          userId: 103,
          userName: 'Lê Văn C',
          userAvatar: 'https://i.pravatar.cc/150?img=3',
          postId: 2,
          postTitle: 'Top 10 phụ kiện không thể thiếu cho smartphone',
          content: 'Bài viết thiếu sót phụ kiện sạc dự phòng loại 65W',
          status: 'hidden',
          isAdmin: false,
          createdAt: '2023-10-17T11:15:00',
          likes: 0,
          replies: []
        },
        {
          id: 5,
          userId: 104,
          userName: 'Phạm Thị D',
          userAvatar: 'https://i.pravatar.cc/150?img=4',
          postId: 3,
          postTitle: 'So sánh Galaxy S23 Ultra và iPhone 14 Pro Max',
          content: 'Theo mình thì Galaxy S23 Ultra vẫn nhỉnh hơn về camera và pin.',
          status: 'published',
          isAdmin: false,
          createdAt: '2023-10-18T16:40:00',
          likes: 8,
          replies: []
        },
        {
          id: 6,
          userId: 105,
          userName: 'Hoàng Văn E',
          userAvatar: 'https://i.pravatar.cc/150?img=5',
          postId: 3,
          postTitle: 'So sánh Galaxy S23 Ultra và iPhone 14 Pro Max',
          content: 'Bài viết thiên vị iPhone quá! Không khách quan.',
          status: 'published',
          isAdmin: false,
          createdAt: '2023-10-19T08:25:00',
          likes: 1,
          replies: [
            {
              id: 7,
              userId: 999,
              userName: 'Admin',
              userAvatar: 'https://i.pravatar.cc/150?img=70',
              content: 'Cảm ơn góp ý của bạn. Chúng tôi luôn cố gắng đưa ra đánh giá khách quan nhất. Bạn có thể chỉ ra điểm nào chưa khách quan để chúng tôi cải thiện?',
              createdAt: '2023-10-19T09:10:00',
              isAdmin: true
            }
          ]
        },
        {
          id: 8,
          userId: 106,
          userName: 'Trương Thị F',
          userAvatar: 'https://i.pravatar.cc/150?img=6',
          postId: 4,
          postTitle: 'Cách chọn ốp lưng phù hợp cho điện thoại của bạn',
          content: 'Có thể giới thiệu thêm về ốp lưng chống sốc cao cấp được không ạ?',
          status: 'published',
          isAdmin: false,
          createdAt: '2023-10-20T13:50:00',
          likes: 3,
          replies: []
        },
        {
          id: 9,
          userId: 107,
          userName: 'Ngô Văn G',
          userAvatar: 'https://i.pravatar.cc/150?img=7',
          postId: 5,
          postTitle: 'Mẹo tiết kiệm pin cho smartphone trong ngày dài',
          content: 'Mình đã áp dụng các mẹo trong bài và thấy pin cải thiện đáng kể. Cảm ơn admin!',
          status: 'published',
          isAdmin: false,
          createdAt: '2023-10-21T10:35:00',
          likes: 6,
          replies: []
        },
        {
          id: 10,
          userId: 108,
          userName: 'Đoàn Thị H',
          userAvatar: 'https://i.pravatar.cc/150?img=8',
          postId: 5,
          postTitle: 'Mẹo tiết kiệm pin cho smartphone trong ngày dài',
          content: 'Bài viết copy từ trang khác, không có gì mới.',
          status: 'hidden',
          isAdmin: false,
          createdAt: '2023-10-22T09:20:00',
          likes: 0,
          replies: []
        }
      ];
      
      setComments(mockComments);
      setPosts(mockPosts);
      setLoading(false);
    }, 800);
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedComments = React.useMemo(() => {
    let sortableComments = [...comments];
    if (sortConfig.key) {
      sortableComments.sort((a, b) => {
        if (sortConfig.key === 'createdAt') {
          // Date comparison
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          if (dateA < dateB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (dateA > dateB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        } else if (sortConfig.key === 'likes') {
          // Number comparison
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        } else {
          // String comparison
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableComments;
  }, [comments, sortConfig]);

  // Filter by search term, post, and status
  const filteredComments = sortedComments.filter(comment => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPost = selectedPost === 'all' || comment.postId.toString() === selectedPost;
    
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
    
    return matchesSearch && matchesPost && matchesStatus;
  });

  // Handle reply to comment
  const handleReplyClick = (comment) => {
    setCurrentComment(comment);
    setReplyText('');
    setShowReplyModal(true);
  };

  // Handle submit reply
  const handleSubmitReply = (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) return;
    
    // Create new reply
    const newReply = {
      id: Date.now(), // Simple ID generation for demo
      userId: 999,
      userName: 'Admin',
      userAvatar: 'https://i.pravatar.cc/150?img=70',
      content: replyText,
      createdAt: new Date().toISOString(),
      isAdmin: true
    };
    
    // Update comment with new reply
    const updatedComments = comments.map(comment => 
      comment.id === currentComment.id
        ? { ...comment, replies: [...comment.replies, newReply] }
        : comment
    );
    
    setComments(updatedComments);
    setShowReplyModal(false);
    
    // Here you would typically make an API call to save the reply
    alert('Phản hồi đã được gửi thành công!');
  };

  // Handle hide/show comment
  const handleToggleStatus = (comment) => {
    const newStatus = comment.status === 'published' ? 'hidden' : 'published';
    
    // Update comment status
    const updatedComments = comments.map(c => 
      c.id === comment.id ? { ...c, status: newStatus } : c
    );
    
    setComments(updatedComments);
    
    // Here you would typically make an API call to update the comment status
    alert(`Bình luận đã được ${newStatus === 'published' ? 'hiển thị' : 'ẩn'} thành công!`);
  };

  // Handle delete comment
  const handleDeleteClick = (comment) => {
    setCurrentComment(comment);
    setShowDeleteModal(true);
  };

  // Confirm delete comment
  const confirmDeleteComment = () => {
    // Remove comment from list
    const updatedComments = comments.filter(comment => comment.id !== currentComment.id);
    
    setComments(updatedComments);
    setShowDeleteModal(false);
    
    // Here you would typically make an API call to delete the comment
    alert('Bình luận đã được xóa thành công!');
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="admincomment-container">
      {/* Header */}
      <div className="admincomment-header">
        <div className="admincomment-title">
          <h1>Quản lý Bình luận</h1>
          <p className="text-muted">Quản lý tất cả bình luận trên các bài viết</p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="admincomment-filters">
        <div className="admincomment-filter-group">
          <div className="admincomment-search">
            <i className="bi bi-search admincomment-search-icon"></i>
            <input
              type="text"
              className="admincomment-search-input"
              placeholder="Tìm kiếm bình luận..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="admincomment-select-wrapper">
            <select 
              className="admincomment-select"
              value={selectedPost}
              onChange={(e) => setSelectedPost(e.target.value)}
            >
              <option value="all">Tất cả bài viết</option>
              {posts.map(post => (
                <option key={post.id} value={post.id}>{post.title}</option>
              ))}
            </select>
          </div>
          
          <div className="admincomment-select-wrapper">
            <select 
              className="admincomment-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã đăng</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </div>
        </div>
        
        <div className="admincomment-filters-summary">
          <span>Tổng số: <b>{filteredComments.length}</b> bình luận</span>
        </div>
      </div>

      {/* Comments table */}
      <div className="admincomment-table-container">
        {loading ? (
          <div className="admincomment-loading">
            <i className="bi bi-arrow-repeat admincomment-spinner"></i>
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            {filteredComments.length === 0 ? (
              <div className="admincomment-empty-state">
                <i className="bi bi-chat-left-text"></i>
                <p>Không tìm thấy bình luận nào</p>
              </div>
            ) : (
              <div className="admincomment-comments-list">
                {filteredComments.map((comment) => (
                  <div key={comment.id} className="admincomment-comment-card">
                    <div className="admincomment-comment-header">
                      <div className="admincomment-user-info">
                        <img src={comment.userAvatar} alt={comment.userName} className="admincomment-user-avatar" />
                        <div>
                          <div className="admincomment-user-name">{comment.userName}</div>
                          <div className="admincomment-comment-meta">
                            <span className="admincomment-comment-date">{formatDate(comment.createdAt)}</span>
                            <span className="admincomment-post-title">
                              Bài viết: <a href={`/blogdetails/${comment.postId}`} target="_blank" rel="noreferrer">{comment.postTitle}</a>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="admincomment-comment-status">
                        <span className={`admincomment-badge ${comment.status === 'published' ? 'admincomment-badge-success' : 'admincomment-badge-secondary'}`}>
                          {comment.status === 'published' ? 'Đã đăng' : 'Đã ẩn'}
                        </span>
                        <div className="admincomment-comment-likes">
                          <i className="bi bi-heart-fill"></i> {comment.likes}
                        </div>
                      </div>
                    </div>
                    
                    <div className="admincomment-comment-content">
                      {comment.content}
                    </div>
                    
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="admincomment-replies">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="admincomment-reply">
                            <div className="admincomment-reply-header">
                              <div className="admincomment-user-info">
                                <img src={reply.userAvatar} alt={reply.userName} className="admincomment-user-avatar admincomment-user-avatar-sm" />
                                <div>
                                  <div className="admincomment-user-name">
                                    {reply.userName}
                                    {reply.isAdmin && <span className="admincomment-admin-badge">Admin</span>}
                                  </div>
                                  <div className="admincomment-comment-meta">
                                    <span className="admincomment-comment-date">{formatDate(reply.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="admincomment-reply-content">
                              {reply.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="admincomment-actions">
                      <button 
                        className="admincomment-btn admincomment-btn-outline admincomment-btn-sm"
                        onClick={() => handleReplyClick(comment)}
                      >
                        <i className="bi bi-reply"></i> Phản hồi
                      </button>
                      <button 
                        className={`admincomment-btn admincomment-btn-outline admincomment-btn-sm ${comment.status === 'published' ? 'admincomment-btn-hide' : 'admincomment-btn-show'}`}
                        onClick={() => handleToggleStatus(comment)}
                      >
                        {comment.status === 'published' 
                          ? <><i className="bi bi-eye-slash"></i> Ẩn bình luận</>
                          : <><i className="bi bi-eye"></i> Hiện bình luận</>
                        }
                      </button>
                      <button 
                        className="admincomment-btn admincomment-btn-outline admincomment-btn-sm admincomment-btn-delete"
                        onClick={() => handleDeleteClick(comment)}
                      >
                        <i className="bi bi-trash"></i> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && currentComment && (
        <div className="admincomment-modal-overlay">
          <div className="admincomment-modal">
            <div className="admincomment-modal-header">
              <h2>Phản hồi bình luận</h2>
              <button className="admincomment-modal-close" onClick={() => setShowReplyModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="admincomment-modal-body">
              <div className="admincomment-quoted-comment">
                <div className="admincomment-quoted-header">
                  <img src={currentComment.userAvatar} alt={currentComment.userName} className="admincomment-user-avatar admincomment-user-avatar-sm" />
                  <span className="admincomment-user-name">{currentComment.userName}</span>
                </div>
                <div className="admincomment-quoted-content">
                  {currentComment.content}
                </div>
              </div>
              
              <form onSubmit={handleSubmitReply}>
                <div className="admincomment-form-group">
                  <label className="admincomment-label">Nội dung phản hồi</label>
                  <textarea 
                    className="admincomment-textarea"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    rows="4"
                    required
                  ></textarea>
                </div>
                
                <div className="admincomment-modal-footer">
                  <button 
                    type="button" 
                    className="admincomment-btn admincomment-btn-outline" 
                    onClick={() => setShowReplyModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="admincomment-btn admincomment-btn-primary"
                  >
                    <i className="bi bi-send"></i> Gửi phản hồi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentComment && (
        <div className="admincomment-modal-overlay">
          <div className="admincomment-modal admincomment-modal-sm">
            <div className="admincomment-modal-header">
              <h2>Xác nhận xóa</h2>
              <button 
                className="admincomment-modal-close" 
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="admincomment-modal-body">
              <p className="admincomment-confirm-message">
                Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
              </p>
              <div className="admincomment-quoted-comment">
                <div className="admincomment-quoted-content">
                  {currentComment.content}
                </div>
              </div>
            </div>
            <div className="admincomment-modal-footer">
              <button 
                type="button" 
                className="admincomment-btn admincomment-btn-outline" 
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button 
                type="button" 
                className="admincomment-btn admincomment-btn-danger"
                onClick={confirmDeleteComment}
              >
                <i className="bi bi-trash"></i> Xóa bình luận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsList; 