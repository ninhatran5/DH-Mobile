import { useEffect, useState } from "react";
import {
  FaQrcode,
  FaTimes,
  FaCheck,
  FaClock,
  FaBan,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaCopy,
  FaEllipsisV,
} from "react-icons/fa";
import "../../assets/admin/withdrawmoney.css";
import { useDispatch, useSelector } from "react-redux";
import {
  adminListWithdrawal,
  confirmWithdrawal,
} from "../../slices/withDrawSlice";
import dayjs from "dayjs";
import numberFomat from "../../../utils/numberFormat";
import Loading from "../../components/Loading";

const WithdrawMoney = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedQrImage, setSelectedQrImage] = useState("");
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dispatch = useDispatch();
  const { adminWithdraws, loading } = useSelector((state) => state.withDraw);

  const totalPages = Math.ceil(adminWithdraws?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = adminWithdraws?.slice(startIndex, endIndex);

  const handleStatusChange = (withdrawId, newStatus) => {
    console.log(`Changing status of withdraw ${withdrawId} to ${newStatus}`);
    setOpenDropdown(null);
  };

  const openQrModal = (qrImageUrl, withdrawData) => {
    setSelectedQrImage(qrImageUrl);
    setSelectedWithdraw(withdrawData);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQrImage("");
    setSelectedWithdraw(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCopyQrLink = () => {
    navigator.clipboard.writeText(selectedQrImage);
  };

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = selectedQrImage;
    link.download = `qr-code-${selectedWithdraw?.withdraw_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDropdown = (withdrawId) => {
    setOpenDropdown(openDropdown === withdrawId ? null : withdrawId);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FaChevronLeft size={12} />
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className={`pagination-btn ${
          currentPage === totalPages ? "disabled" : ""
        }`}
        onClick={() =>
          currentPage < totalPages && handlePageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
      >
        <FaChevronRight size={12} />
      </button>
    );

    return pages;
  };

  const handleConfirmWithdrawal = (id) => {
    dispatch(confirmWithdrawal(id));
  };

  useEffect(() => {
    dispatch(adminListWithdrawal());
  }, [dispatch]);

  return (
    <>
      {loading && <Loading />}
      <div className="withdraw-money-container">
        <div className="page-header">
          <h1 className="page-title">Quản lý trạng thái rút tiền</h1>
          <div className="page-subtitle">
            Quản lý và xử lý các yêu cầu rút tiền từ người dùng
          </div>
        </div>

        <div className="withdraw-money-card">
          {/* Desktop Table Header */}
          <div className="withdraw-money-header desktop-only">
            <div className="header-row">
              <div>NGƯỜI DÙNG</div>
              <div>SỐ TIỀN</div>
              <div>NGÂN HÀNG</div>
              <div>NGÀY YÊU CẦU</div>
              <div>TRẠNG THÁI</div>
              <div>HÀNH ĐỘNG</div>
            </div>
          </div>

          <div className="withdraw-money-body">
            {currentData?.map((withdraw) => {
              return (
                <div key={withdraw?.withdraw_id} className="withdraw-row">
                  {/* Desktop Grid Layout */}
                  <div className="desktop-row">
                    <div className="user-info">
                      <div className="user-avatar">
                        <img src={withdraw?.user?.image_url} alt="" />
                      </div>
                      <div className="user-details">
                        <h6>{withdraw.user.full_name}</h6>
                        <div className="email">{withdraw.user.email}</div>
                      </div>
                    </div>

                    <div className="amount-info">
                      <div className="amount-display">
                        {numberFomat(withdraw.amount)}
                      </div>
                    </div>

                    <div className="bank-info">
                      <div className="bank-name d-flex">
                        {withdraw.bank_name}
                        <button
                          className="action-btn qr-btn"
                          onClick={() => openQrModal(withdraw.img_qr, withdraw)}
                        >
                          <FaQrcode size={14} />
                        </button>
                      </div>
                      <div className="bank-account">
                        {withdraw.bank_account_number}
                      </div>
                    </div>

                    <div className="date-display">
                      {dayjs(withdraw.created_at).format("HH:mm - DD/MM/YYYY")}
                    </div>

                    <div className="status-cell">
                      <span className="status-badge">
                        <span className="status-text">{withdraw.status}</span>
                      </span>
                    </div>

                    <div className="actions-cell">
                      <div className="dropdown">
                        <button
                          className="action-btn dropdown-btn"
                          onClick={() =>
                            handleConfirmWithdrawal(withdraw.withdraw_id)
                          }
                        >
                          <span className="dropdown-text">Hoàn thành</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="mobile-card">
                    <div className="card-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          {withdraw.user.avatar_letter}
                        </div>
                        <div className="user-details">
                          <h6>{withdraw.user.full_name}</h6>
                          <div className="email">{withdraw.user.email}</div>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-btn qr-btn"
                          onClick={() => openQrModal(withdraw.img_qr, withdraw)}
                          title="Xem QR Code"
                        >
                          <FaQrcode size={16} />
                        </button>
                        <div className="dropdown">
                          <button
                            className="action-btn more-btn"
                            onClick={() => toggleDropdown(withdraw.withdraw_id)}
                          >
                            <FaEllipsisV size={14} />
                          </button>
                          <div
                            className={`dropdown-menu ${
                              openDropdown === withdraw.withdraw_id
                                ? "show"
                                : ""
                            }`}
                          >
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(
                                  withdraw.withdraw_id,
                                  "Đang xử lý"
                                )
                              }
                            >
                              <FaClock style={{ color: "#007BFF" }} size={12} />
                              <span>Đang xử lý</span>
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(
                                  withdraw.withdraw_id,
                                  "Đã duyệt"
                                )
                              }
                            >
                              <FaCheck style={{ color: "#28A745" }} size={12} />
                              <span>Đã duyệt</span>
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(
                                  withdraw.withdraw_id,
                                  "Từ chối"
                                )
                              }
                            >
                              <FaBan style={{ color: "#DC3545" }} size={12} />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="card-row">
                        <div className="card-item">
                          <span className="card-label">Số tiền</span>
                          <span className="card-value amount">
                            {numberFomat(withdraw.amount)}
                          </span>
                        </div>
                        <div className="card-item">
                          <span className="card-label">Mã GD</span>
                          <span className="card-value">
                            {withdraw.withdraw_id}
                          </span>
                        </div>
                      </div>

                      <div className="card-row">
                        <div className="card-item">
                          <span className="card-label">Ngân hàng</span>
                          <span className="card-value">
                            {withdraw.bank_name}
                          </span>
                        </div>
                        <div className="card-item">
                          <span className="card-label">STK</span>
                          <span className="card-value">
                            {withdraw.bank_account_number}
                          </span>
                        </div>
                      </div>

                      <div className="card-row">
                        <div className="card-item">
                          <span className="card-label">Ngày yêu cầu</span>
                          <span className="card-value">
                            {withdraw.created_at}
                          </span>
                        </div>
                        <div className="card-item">
                          <span className="card-label">Trạng thái</span>
                          <span className="status-badge mobile">
                            <span className="status-text">
                              {withdraw.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Hiển thị {startIndex + 1}-
              {Math.min(endIndex, adminWithdraws?.length)} của{" "}
              {adminWithdraws?.length} kết quả
            </div>
            <div className="pagination">{renderPagination()}</div>
          </div>
        </div>

        {/* Enhanced QR Modal */}
        {showModal && selectedWithdraw && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="qr-modal-header">
                <div className="modal-header-content">
                  <div className="modal-icon">
                    <FaQrcode size={24} />
                  </div>
                  <div className="modal-title-section">
                    <h3 className="modal-title">QR Code Chuyển Khoản</h3>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={closeModal}>
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="qr-modal-body">
                <div className="qr-container">
                  <div className="qr-image-wrapper">
                    <img
                      src={selectedQrImage}
                      alt="QR Code"
                      className="qr-image"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5RUiBDb2RlPC90ZXh0Pgo8L3N2Zz4K";
                      }}
                    />
                    <div className="qr-overlay">
                      <div className="qr-scan-line"></div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mã giao dịch:</span>
                    <span className="detail-value">
                      {selectedWithdraw.withdraw_id}
                    </span>
                  </div>
                  <div className="transaction-details">
                    <div className="detail-row">
                      <span className="detail-label">Người nhận:</span>
                      <span className="detail-value">
                        {selectedWithdraw.user.full_name}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ngân hàng:</span>
                      <span className="detail-value">
                        {selectedWithdraw.bank_name}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Số tài khoản:</span>
                      <span className="detail-value">
                        {selectedWithdraw.bank_account_number}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Số tiền:</span>
                      <span className="detail-value amount">
                        {numberFomat(selectedWithdraw.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="qr-modal-footer">
                <button
                  className="modal-action-btn secondary"
                  onClick={handleCopyQrLink}
                >
                  <FaCopy size={14} />
                  <span>Sao chép số tài khoản</span>
                </button>
                <button
                  className="modal-action-btn primary"
                  onClick={handleDownloadQr}
                >
                  <FaDownload size={14} />
                  <span>Tải xuống</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WithdrawMoney;
