import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrashedVouchers,
  restoreAdminVoucher,
  forceDeleteAdminVoucher,
} from "../slices/AdminVoucher";
import { toast } from "react-toastify";
import { FaUndo, FaTrash, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../assets/admin/VoucherList.css";
import moment from "moment";
import "../assets/admin/TrashVoucherList.css";
import Loading from "./Loading";
import Swal from "sweetalert2";

const TrashVoucherList = () => {
  const dispatch = useDispatch();
  const { trashedVouchers, loading, error } = useSelector((state) => state.adminVoucher);

  const [searchTerm, setSearchTerm] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");
  const [expiryDaysFilter, setExpiryDaysFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [firstLoading, setFirstLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const pollingRef = useRef(false);

  const vouchersPerPage = 10;

  useEffect(() => {
    setFirstLoading(true);
    dispatch(fetchTrashedVouchers()).finally(() => {
      setFirstLoading(false);
      pollingRef.current = true;
    });

    const interval = setInterval(() => {
      if (pollingRef.current) {
        dispatch(fetchTrashedVouchers());
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      pollingRef.current = false;
    };
  }, [dispatch]);

  const handleRestore = async (voucherId, voucherCode) => {
    const result = await Swal.fire({
      title: 'Khôi phục voucher?',
      html: `
        <p>Bạn có chắc chắn muốn khôi phục voucher này không?</p>
        <p><strong>Mã voucher:</strong> ${voucherCode}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: ' Có, khôi phục!',
      cancelButtonText: ' Hủy',
      reverseButtons: true,
      focusConfirm: false,
      focusCancel: true
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Đang khôi phục...',
        text: 'Vui lòng đợi trong giây lát',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await dispatch(restoreAdminVoucher(voucherId)).unwrap();
        
        Swal.close();
        
        toast.success(`✅ Đã khôi phục voucher ${voucherCode} thành công!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
      } catch (error) {
        Swal.close();
        
        toast.error(`❌ Lỗi khi khôi phục voucher: ${error}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleForceDelete = async (voucherId, voucherCode) => {
    // Bước 1: Cảnh báo đầu tiên
    const firstWarning = await Swal.fire({
      title: '⚠️ CẢNH BÁO NGHIÊM TRỌNG!',
      html: `
        <div style="text-align: left; color: #721c24;">
          <p><strong>Bạn sắp xóa vĩnh viễn voucher:</strong></p>
          <p style="background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0;">
            <strong>Mã:</strong> ${voucherCode}
          </p>
          <p style="color: #dc3545; font-weight: bold;">
            ⚠️ Hành động này sẽ XÓA VĨNH VIỄN voucher khỏi hệ thống!
          </p>
          <p style="color: #dc3545;">
            • Không thể khôi phục sau khi xóa<br/>
            • Tất cả dữ liệu liên quan sẽ bị mất<br/>
            • Không thể hoàn tác thao tác này
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Tiếp tục',
      cancelButtonText: 'Hủy bỏ',
      reverseButtons: true,
      focusCancel: true
    });

    if (firstWarning.isConfirmed) {
      // Bước 2: Xác nhận lần cuối
      const finalConfirm = await Swal.fire({
        title: 'XÁC NHẬN LẦN CUỐI',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 18px; color: #dc3545; font-weight: bold;">
              🗑️ XÓA VĨNH VIỄN VOUCHER
            </p>
            <p style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>${voucherCode}</strong>
            </p>
            <p style="color: #721c24;">
              Nhập "<strong>XOA VINH VIEN</strong>" để xác nhận:
            </p>
          </div>
        `,
        input: 'text',
        inputPlaceholder: 'Nhập: XOA VINH VIEN',
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#28a745',
        confirmButtonText: '🗑️ Xóa vĩnh viễn',
        cancelButtonText: '🛡️ Hủy bỏ (An toàn)',
        reverseButtons: true,
        focusCancel: true,
        preConfirm: (inputValue) => {
          if (inputValue !== 'XOA VINH VIEN') {
            Swal.showValidationMessage('Vui lòng nhập chính xác "XOA VINH VIEN"');
            return false;
          }
          return true;
        }
      });

      if (finalConfirm.isConfirmed) {
        // Hiển thị loading
        Swal.fire({
          title: 'Đang xóa vĩnh viễn...',
          text: 'Vui lòng đợi trong giây lát',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        try {
          await dispatch(forceDeleteAdminVoucher(voucherId)).unwrap();
          
          // Đóng loading dialog
          Swal.close();
          
          // Hiển thị toast thành công
          toast.success(`🗑️ Đã xóa vĩnh viễn voucher ${voucherCode} thành công!`, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
        } catch (error) {
          // Đóng loading dialog
          Swal.close();
          
          // Hiển thị toast lỗi
          toast.error(`❌ Lỗi khi xóa vĩnh viễn voucher: ${error}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
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

    return trashedVouchers.filter((v) => {
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
  }, [trashedVouchers, searchTerm, discountFilter, expiryDaysFilter]);

  const totalPages = Math.ceil(filteredVouchers.length / vouchersPerPage);
  const paginatedVouchers = filteredVouchers.slice(
    (currentPage - 1) * vouchersPerPage,
    currentPage * vouchersPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, discountFilter, expiryDaysFilter]);

  // Loading states
  if (firstLoading) return <Loading message="Đang tải thùng rác voucher..." />;
  if (error) return <div className="adminvoucher-error">Lỗi: {error}</div>;

  return (
    <div className="adminvoucher-container">
      {/* Loading overlay cho các action */}
      {actionLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Loading message="Đang xử lý..." />
        </div>
      )}

      <div className="trash-header">
        <h1> Thùng rác - Voucher đã xóa</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '14px', 
            color: '#6c757d',
            background: '#f8f9fa',
            padding: '5px 10px',
            borderRadius: '15px',
            border: '1px solid #dee2e6'
          }}>
            Tổng: {filteredVouchers.length} voucher
          </span>
          <Link to="/admin/vouchers" className="back-to-list-btn">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>

      <div className="adminvoucher-header">
        <div className="adminvoucher-search-wrapper">
          <FaSearch className="adminvoucher-search-icon" />
          <input
            type="text"
            placeholder="Tìm voucher đã xóa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="adminvoucher-actions">
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

      {paginatedVouchers.length === 0 ? (
        <div className="adminvoucher-empty">
          <p>📭 Thùng rác trống.</p>
          <p>Không có voucher nào được xóa{searchTerm || discountFilter || expiryDaysFilter ? ' phù hợp với bộ lọc' : ''}.</p>
          {(searchTerm || discountFilter || expiryDaysFilter) && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setDiscountFilter('');
                setExpiryDaysFilter('');
                toast.info("🔄 Đã xóa tất cả bộ lọc", {
                  position: "top-right",
                  autoClose: 2000,
                });
              }}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="adminvoucher-list">
          {paginatedVouchers.map((voucher) => (
            <div className="adminvoucher-card trash-voucher-card" key={voucher.voucher_id}>
              <div className="trash-overlay">
                <span className="trash-label">ĐÃ XÓA</span>
              </div>
              
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
                    <strong>{formatCurrency(voucher.discount_amount)}</strong>
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
                    <strong>{voucher.max_discount || "Không có"}</strong>
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
                  
                  <div className="adminvoucher-card-actions trash-actions">
                    <button
                      className="restore-btn"
                      onClick={() => handleRestore(voucher.voucher_id, voucher.code)}
                      title="Khôi phục voucher"
                      disabled={loading}
                    >
                      <FaUndo className="adminvoucher-icon-restore" />
                    </button>
                    <button
                      className="force-delete-btn"
                      onClick={() => handleForceDelete(voucher.voucher_id, voucher.code)}
                      title="Xóa vĩnh viễn"
                      disabled={loading}
                    >
                      <FaTrash className="adminvoucher-icon-force-delete" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="adminvoucher-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <FaChevronLeft /> Trước
          </button>
          <span>
            Trang {currentPage} / {totalPages} 
            <small style={{ marginLeft: '10px', color: '#6c757d' }}>
              ({filteredVouchers.length} voucher)
            </small>
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Sau <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default TrashVoucherList;
