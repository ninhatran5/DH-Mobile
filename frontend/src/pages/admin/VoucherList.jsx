import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminVouchers,
  deleteAdminVoucher,
} from "../../slices/AdminVoucher";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../assets/admin/VoucherList.css";
import moment from "moment";

const VoucherList = () => {
  const dispatch = useDispatch();
  const { vouchers, loading, error } = useSelector((state) => state.adminVoucher);

  const [searchTerm, setSearchTerm] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");
  const [expiryDaysFilter, setExpiryDaysFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const vouchersPerPage = 10;

  useEffect(() => {
    dispatch(fetchAdminVouchers());
  }, [dispatch]);

  const handleDelete = (voucherId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này không?")) {
      dispatch(deleteAdminVoucher(voucherId));
      toast.success("Đã xóa voucher thành công!");
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

  const totalPages = Math.ceil(filteredVouchers.length / vouchersPerPage);
  const paginatedVouchers = filteredVouchers.slice(
    (currentPage - 1) * vouchersPerPage,
    currentPage * vouchersPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, discountFilter, expiryDaysFilter]);

  if (loading) return <div className="adminvoucher-loading">Đang tải danh sách voucher...</div>;
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
            + Thêm mã giảm giá
          </Link>
          <button 
            className="adminvoucher-filter-btn"
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
        <p className="adminvoucher-empty">Không tìm thấy mã giảm giá nào.</p>
      ) : (
        <div className="adminvoucher-list">
          {paginatedVouchers.map((voucher) => (
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
                    <strong>{formatCurrency(voucher.discount_amount)}</strong>
                  </div>
                  <div className="adminvoucher-info-item">
                    <span>Đơn tối thiểu:</span>
                    <strong>{formatCurrency(voucher.min_order_value)}</strong>
                  </div>
                  <div className="adminvoucher-info-item">
                    <span>Số lượng:</span>
                    <strong>{voucher.min_order_value}</strong>
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
                      onClick={() => handleDelete(voucher.voucher_id)}
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

export default VoucherList;
