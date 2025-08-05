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

const TrashVoucherList = () => {
  const dispatch = useDispatch();
  const { trashedVouchers, loading, error } = useSelector((state) => state.adminVoucher);

  const [searchTerm, setSearchTerm] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");
  const [expiryDaysFilter, setExpiryDaysFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [firstLoading, setFirstLoading] = useState(true);
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
    }, 5000); // Polling mỗi 5 giây cho thùng rác

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRestore = async (voucherId) => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục voucher này không?")) {
      try {
        await dispatch(restoreAdminVoucher(voucherId)).unwrap();
        toast.success("Đã khôi phục voucher thành công!");
      } catch (error) {
        toast.error("Lỗi khi khôi phục voucher: " + error);
      }
    }
  };

  const handleForceDelete = async (voucherId) => {
    if (window.confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn voucher này không? Hành động này không thể hoàn tác!")) {
      try {
        await dispatch(forceDeleteAdminVoucher(voucherId)).unwrap();
        toast.success("Đã xóa vĩnh viễn voucher thành công!");
      } catch (error) {
        toast.error("Lỗi khi xóa vĩnh viễn voucher: " + error);
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

  if (firstLoading) return <div className="adminvoucher-loading">Đang tải thùng rác voucher...</div>;
  if (error) return <div className="adminvoucher-error">Lỗi: {error}</div>;

  return (
    <div className="adminvoucher-container">
      <div className="trash-header">
        <h1>🗑️ Thùng rác - Voucher đã xóa</h1>
        <Link to="/admin/vouchers" className="back-to-list-btn">
          ← Quay lại danh sách
        </Link>
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
          <p>Không có voucher nào được xóa.</p>
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
                      onClick={() => handleRestore(voucher.voucher_id)}
                      title="Khôi phục voucher"
                    >
                      <FaUndo className="adminvoucher-icon-restore" />
                    </button>
                    <button
                      className="force-delete-btn"
                      onClick={() => handleForceDelete(voucher.voucher_id)}
                      title="Xóa vĩnh viễn"
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

      <div className="adminvoucher-pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          <FaChevronLeft /> Trước
        </button>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Sau <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default TrashVoucherList;
