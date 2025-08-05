import { useEffect, useState } from "react";
import {
  FaQrcode,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaCopy,
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
import { toast, ToastContainer } from "react-toastify";
import InvoiceUploadModal from "../../components/InvoiceUploadModal";
import Swal from "sweetalert2";
import { BsBank2 } from "react-icons/bs";


const WithdrawMoney = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedQrImage, setSelectedQrImage] = useState("");
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedWithdrawId, setSelectedWithdrawId] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const { adminWithdraws, loading } = useSelector((state) => state.withDraw);

  let withdrawList = Array.isArray(adminWithdraws)
    ? adminWithdraws
    : Array.isArray(adminWithdraws?.data)
    ? adminWithdraws.data
    : [];

  function removeVietnameseTones(str) {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  if (searchTerm) {
    const search = removeVietnameseTones(searchTerm.toLowerCase());
    withdrawList = withdrawList.filter((item) => {
      const name = removeVietnameseTones(item.user?.full_name?.toLowerCase() || '');
      return name.includes(search);
    });
  }
  if (statusFilter) {
    withdrawList = withdrawList.filter((item) =>
      item.status === statusFilter
    );
  }

  const totalPages = Math.ceil(withdrawList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = withdrawList.slice(startIndex, endIndex);

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
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleCopyAccountNumber = async () => {
    const accountNumber = selectedWithdraw?.bank_account_number;
    if (!accountNumber) {
      toast.error("Không có số tài khoản để sao chép", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(accountNumber);
      toast.success("Đã sao chép số tài khoản", {
        position: "top-right",
        autoClose: 1500,
      });
    } catch (err) {
      console.error("Copy failed", err);
      toast.error("Sao chép thất bại", {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  const handleDownloadQr = () => {
    if (!selectedQrImage) {
      toast.error("Không có QR code để tải xuống", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }
    try {
      const link = document.createElement("a");
      link.href = selectedQrImage;
      link.download = `qr-code-${
        selectedWithdraw?.withdraw_id || "unknown"
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Tải xuống thất bại", {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

 

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

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
    setSelectedWithdrawId(id);
    setInvoiceFile(null);
    setShowInvoiceModal(true);
  };

  const handleSubmitInvoice = async () => {
    if (!invoiceFile) {
      await Swal.fire({
        icon: "error",
        title: "Vui lòng chọn hóa đơn",
        timer: 1800,
        showConfirmButton: false,
      });
      return;
    }
    setUploading(true);
    try {
      await dispatch(
        confirmWithdrawal({ id: selectedWithdrawId, img_bill: invoiceFile })
      ).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Xác nhận rút tiền thành công.",
        timer: 1800,
        showConfirmButton: false,
      });
      setShowInvoiceModal(false);
      setInvoiceFile(null);
      setSelectedWithdrawId(null);
      dispatch(adminListWithdrawal());
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Xác nhận thất bại",
        text: err?.message || "",
        timer: 2200,
        showConfirmButton: false,
      });
    } finally {
      setUploading(false);
    }
  };
    const statusClasses = {
    'Chờ xử lý': 'status-pending',
    'Đã hoàn tất': 'status-completed',
  };

  useEffect(() => {
    dispatch(adminListWithdrawal());
  }, [dispatch]);

  return (
    <>
      {loading && <Loading />}
      <ToastContainer />
      <div className="withdraw-money-container">
        <div className="page-header">
          <h1 className="page-title">Quản lý trạng thái rút tiền</h1>
          <div className="page-subtitle">
            Quản lý và xử lý các yêu cầu rút tiền từ người dùng
          </div>
          <div className="search-filter-row">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên người dùng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="status-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Chờ xử lý">Chờ xử lý</option>
              <option value="Đã hoàn tất">Đã hoàn tất</option>
            </select>
          </div>
        </div>

        <div className="withdraw-money-card">
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
            {currentData.map((withdraw) => {
              return (
                <div key={withdraw?.withdraw_id} className="withdraw-row">
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
                      <div
                        className={`amount-display ${
                          withdraw.status === "Chờ xử lý"
                            ? "amount-pending"
                            : withdraw.status === "Đã hoàn tất"
                            ? "amount-success"
                            : ""
                        }`}
                      >
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
                    <div className="status-cell ">
                      <span
                        className={`status-badge ${
                          statusClasses[withdraw.status] 
                        }`}
                      >
                        <span className="status-text">{withdraw.status}</span>
                      </span>
                    </div>
                    <div className="actions-cell">
                      {withdraw?.status === "Chờ xử lý" && (
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
                      )}
                    </div>
                  </div>
                  <div className="mobile-card-withdraw">
                    <div className="card-header-withdraw">
                      <div className="user-info">
                        <div className="user-avatar">
                          <img src={withdraw?.user?.image_url} alt="" />
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
                        >
                          <FaQrcode size={16} />
                        </button>
                        {withdraw?.status === "Chờ xử lý" && (
                          <button
                            className="action-btn dropdown-btn"
                            style={{marginLeft: 8}}
                            onClick={() => handleConfirmWithdrawal(withdraw.withdraw_id)}
                          >
                            <span className="dropdown-text">Hoàn thành</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="card-body-withdraw">
                      <div className="card-row">
                        <div className="card-item">
                          <span className="card-label">Số tiền</span>
                          <span className={`card-value amount ${withdraw.status === "Chờ xử lý" ? "amount-pending" : withdraw.status === "Đã hoàn tất" ? "amount-success" : ""}`}>
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
                            {dayjs(withdraw.created_at).format(
                              "HH:mm - DD/MM/YYYY"
                            )}
                          </span>
                        </div>
                        <div className="card-item">
                          <span className="card-label">Trạng thái</span>
                          <span className={`status-badge mobile ${statusClasses[withdraw.status]}`}>
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
            {currentData.length === 0 && !loading && (
              <>
                <div className="icon-no-data"><BsBank2 /></div>
                <div className="no-data">
                  {searchTerm || statusFilter
                    ? "Không tìm thấy kết quả phù hợp."
                    : "Không có yêu cầu rút tiền nào."}
                </div>
              </>
            )}
            {/* Đặt modal ngoài map để modal không bị lồng trong từng row */}
            <InvoiceUploadModal
              show={showInvoiceModal}
              onClose={() => setShowInvoiceModal(false)}
              onSubmit={handleSubmitInvoice}
              uploading={uploading}
              invoiceFile={invoiceFile}
              setInvoiceFile={setInvoiceFile}
            />
          </div>

          <div className="pagination-container">
            <div className="pagination-info">
              Hiển thị {withdrawList.length === 0 ? 0 : startIndex + 1}-
              {Math.min(endIndex, withdrawList.length)} của{" "}
              {withdrawList.length} kết quả
            </div>
            <div className="pagination">{renderPagination()}</div>
          </div>
        </div>

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
                  onClick={handleCopyAccountNumber}
                >
                  <FaCopy size={14} />
                  <span>Sao chép STK</span>
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
