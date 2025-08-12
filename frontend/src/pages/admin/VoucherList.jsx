import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminVouchers,
  deleteAdminVoucher,
  fetchTrashedVouchers,
} from "../../slices/AdminVoucher";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../assets/admin/VoucherList.css";
import moment from "moment";
import Swal from "sweetalert2";

const VoucherList = () => {
  const dispatch = useDispatch();
  const { vouchers, loading, error, pagination, trashedCount } = useSelector((state) => state.adminVoucher);

  const [searchTerm, setSearchTerm] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");
  const [expiryDaysFilter, setExpiryDaysFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [firstLoading, setFirstLoading] = useState(true);
  const pollingRef = useRef(false);

  useEffect(() => {
    setFirstLoading(true);
    dispatch(fetchAdminVouchers(currentPage)).finally(() => {
      setFirstLoading(false);
      pollingRef.current = true;
    });
  }, [dispatch, currentPage]);

  useEffect(() => {
    dispatch(fetchTrashedVouchers(1));
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pollingRef.current) {
        dispatch(fetchAdminVouchers(currentPage));
        dispatch(fetchTrashedVouchers(1));
      }
    }, 30000); 
    return () => clearInterval(interval);
  }, [dispatch, currentPage]);

  // Cập nhật handleDelete với SweetAlert2
  const handleDelete = async (voucherId, voucherCode) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa voucher',
      html: `
        <div style="text-align: left;">
          <strong>Mã voucher:</strong> ${voucherCode}<br>
          <strong>ID:</strong> ${voucherId}<br><br>
          <span style="color: #e74c3c;">
            ⚠️ Voucher sẽ được chuyển vào thùng rác và có thể khôi phục sau.
          </span>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '🗑️ Xóa voucher',
      cancelButtonText: '❌ Hủy bỏ',
      reverseButtons: true,
      customClass: {
        popup: 'swal-delete-popup',
        title: 'swal-delete-title',
        htmlContainer: 'swal-delete-content',
        confirmButton: 'swal-delete-confirm',
        cancelButton: 'swal-delete-cancel'
      },
      backdrop: `
        rgba(0,0,0,0.7)
        left top
        no-repeat
      `,
      allowOutsideClick: false,
      allowEscapeKey: true,
      focusConfirm: false,
      focusCancel: true
    });

    if (result.isConfirmed) {
      try {
        // Hiển thị loading toast
        const loadingToast = toast.loading("⏳ Đang xóa voucher...");
        
        await dispatch(deleteAdminVoucher(voucherId)).unwrap();
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        // Reload danh sách
        dispatch(fetchAdminVouchers(currentPage));
        
        // Hiển thị success toast
        toast.success("🗑️ Đã xóa voucher thành công!", {
          position: "top-right",
          autoClose: 3000,
        });

        // Optional: Hiển thị SweetAlert success
        Swal.fire({
          title: 'Thành công!',
          text: `Voucher ${voucherCode} đã được chuyển vào thùng rác.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-success-popup'
          }
        });

      } catch (error) {
        toast.error(`❌ Lỗi khi xóa voucher: ${error}`, {
          position: "top-right",
          autoClose: 5000,
        });

        Swal.fire({
          title: 'Lỗi!',
          text: `Không thể xóa voucher: ${error}`,
          icon: 'error',
          confirmButtonText: 'Đóng',
          customClass: {
            popup: 'swal-error-popup'
          }
        });
      }
    }
  };

  const formatDate = (date) => {
    return moment(date).format("HH:mm | DD.MM.YYYY");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const filteredVouchers = useMemo(() => {
    const today = new Date();
    const plusDays = (days) => {
      const result = new Date(today);
      result.setDate(result.getDate() + days);
      return result;
    };

    return vouchers.filter((v) => {
      const endDate = new Date(v.end_date);
      const matchesSearch =
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.title.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDiscount = true;
      if (discountFilter !== "") {
        const discount = parseFloat(v.discount_amount);
        if (discountFilter === "0-50000") {
          matchesDiscount = discount <= 50000;
        } else if (discountFilter === "50000-100000") {
          matchesDiscount = discount > 50000 && discount <= 100000;
        } else if (discountFilter === "100000-200000") {
          matchesDiscount = discount > 100000 && discount <= 200000;
        } else if (discountFilter === "200000+") {
          matchesDiscount = discount > 200000;
        }
      }

      let matchesExpiry = true;
      if (expiryDaysFilter !== "") {
        if (expiryDaysFilter === "expired") {
          matchesExpiry = endDate < today;
        } else {
          const endRange = plusDays(parseInt(expiryDaysFilter));
          matchesExpiry = endDate >= today && endDate <= endRange;
        }
      }

      return matchesSearch && matchesDiscount && matchesExpiry;
    });
  }, [vouchers, searchTerm, discountFilter, expiryDaysFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, discountFilter, expiryDaysFilter]);

  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.last_page;
    const current = pagination.current_page;
    
    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (firstLoading) return <div className="adminvoucher-loading">Đang tải danh sách voucher...</div>;
  if (error) return <div className="adminvoucher-error">Lỗi: {error}</div>;

  return (
    <div className="adminvoucher-container">
      <h1>Danh sách mã giảm giá</h1>

      <div className="adminvoucher-header">
        <div className="adminvoucher-search-wrapper">
          <FaSearch className="adminvoucher-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tiêu đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="adminvoucher-actions">
          <Link to="/admin/addvoucher" className="adminvoucher-add-btn">
            + Thêm voucher
          </Link>
          <Link to="/admin/trashvouchers" className="trash1-btn1">
            Thùng rác
            {trashedCount > 0 && (
              <span className="trash-count-badge">{trashedCount}</span>
            )}
          </Link>
          <button 
            className="adminvoucher1-filter-btn1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Bộ lọc
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="adminvoucher-filters">
          <div className="adminvoucher-filter-item">
            <label>Khoảng giảm giá</label>
            <select
              value={discountFilter}
              onChange={(e) => setDiscountFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="0-50000">Dưới 50,000₫</option>
              <option value="50000-100000">50,000₫ - 100,000₫</option>
              <option value="100000-200000">100,000₫ - 200,000₫</option>
              <option value="200000+">Trên 200,000₫</option>
            </select>
          </div>

          <div className="adminvoucher-filter-item">
            <label>Hạn sử dụng</label>
            <select
              value={expiryDaysFilter}
              onChange={(e) => setExpiryDaysFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="expired">Đã hết hạn</option>
              <option value="7">Hết hạn trong 7 ngày</option>
              <option value="15">Hết hạn trong 15 ngày</option>
              <option value="30">Hết hạn trong 30 ngày</option>
            </select>
          </div>
        </div>
      )}

      <div className="adminvoucher-summary">
        <p>
          Hiển thị {filteredVouchers.length} trong tổng số {pagination.total} voucher
          (Trang {pagination.current_page} / {pagination.last_page})
        </p>
      </div>

      {filteredVouchers.length === 0 ? (
        <p className="adminvoucher-empty">Không tìm thấy mã giảm giá nào.</p>
      ) : (
        <div className="adminvoucher-list">
          {filteredVouchers.map((voucher) => (
            <div className="adminvoucher-card" key={voucher.voucher_id}>
              <div className="adminvoucher-card-left">
                <h2 className="adminvoucher-card-title">GIFT VOUCHER</h2>
                <div className="adminvoucher-card-code">{voucher.code}</div>
                <div className="adminvoucher-card-id">ID: {voucher.voucher_id}</div>
              </div>
              
              <div className="adminvoucher-card-divider"></div>
              
              <div className="adminvoucher-card-center">
                <div className="adminvoucher-card-name">{voucher.title}</div>
                <div className="adminvoucher-info-row">
                  <div className="adminvoucher-info-item">
                    <span>Giảm giá:</span>
                    <strong>
                      {voucher.discount_type === 'percent' 
                        ? `${voucher.discount_amount}%` 
                        : formatCurrency(voucher.discount_amount)
                      }
                    </strong>
                  </div>
                  <div className="adminvoucher-info-item">
                    <span>Đơn tối thiểu:</span>
                    <strong>{formatCurrency(voucher.min_order_value)}</strong>
                  </div>
                  <div className="adminvoucher-info-item">
                    <span>Số lượng:</span>
                    <strong>{voucher.quantity}</strong>
                  </div>
                  <div className="adminvoucher-info-item">
                    <span>Tối đa:</span>
                    <strong>
                      {voucher.max_discount 
                        ? formatCurrency(voucher.max_discount) 
                        : "Không có"
                      }
                    </strong>
                  </div>
                </div>
              </div>

              <div className="adminvoucher-card-divider"></div>
              
              <div className="adminvoucher-card-right">
                <div className="adminvoucher-content-wrapper">
                  <div className="adminvoucher-date-group">
                    <div className="adminvoucher-date-row">
                      <div className="adminvoucher-date">
                        <div className="date-label-value">
                          <span>Bắt đầu:</span>
                          <div className="date-value">{formatDate(voucher.start_date)}</div>
                        </div>
                      </div>
                      <div className="adminvoucher-date">
                        <div className="date-label-value">
                          <span>Kết thúc:</span>
                          <div className="date-value">{formatDate(voucher.end_date)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="adminvoucher-card-actions">
                    <Link to={`/admin/EditVoucher/${voucher.voucher_id}`}>
                      <FaEdit className="adminvoucher-icon-edit" />
                    </Link>
                    <FaTrash
                      className="adminvoucher-icon-delete"
                      onClick={() => handleDelete(voucher.voucher_id, voucher.code)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="adminvoucher-pagination">
        <button
          disabled={pagination.current_page === 1}
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          Đầu
        </button>
        <button
          disabled={pagination.current_page === 1}
          onClick={() => handlePageChange(pagination.current_page - 1)}
          className="pagination-btn"
        >
          <FaChevronLeft /> Trước
        </button>

        <div className="pagination-numbers">
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              className={`pagination-number ${pageNum === pagination.current_page ? 'active' : ''}`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}
        </div>

        <button
          disabled={pagination.current_page === pagination.last_page}
          onClick={() => handlePageChange(pagination.current_page + 1)}
          className="pagination-btn"
        >
          Sau <FaChevronRight />
        </button>
        <button
          disabled={pagination.current_page === pagination.last_page}
          onClick={() => handlePageChange(pagination.last_page)}
          className="pagination-btn"
        >
          Cuối
        </button>
      </div>

      <div className="pagination-info">
        <span>
          Trang {pagination.current_page} / {pagination.last_page} 
          - Tổng {pagination.total} voucher
        </span>
      </div>
    </div>
  );
};

export default VoucherList;
