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
    return moment(date).format("DD/MM/YYYY HH:mm:ss");
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
      <h2 className="adminvoucher-title">Danh sách mã giảm giá</h2>
      <div className="adminvoucher-actions">
        <Link to="/admin/addvoucher" className="adminvoucher-add-btn">
          + Thêm mã giảm giá
        </Link>
      </div>

      <div className="adminvoucher-filters-header">
        <div className="adminvoucher-search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tiêu đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> Bộ lọc
        </button>
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
        <>
          <div className="voucher_margin">
            <div className="row g-3">
              {paginatedVouchers.map((voucher) => (
                <div className="col-12" key={voucher.voucher_id}>
                  <div className="admin-voucher-ticket">
                    <div className="ticket-content">
                      <div className="ticket-code">Mã: {voucher.code}</div>
                      <div className="ticket-title">{voucher.title}</div>
                      <div className="ticket-info-row">
                        <span>ID: {voucher.voucher_id}</span>
                        <span>Giảm giá: {formatCurrency(voucher.discount_amount)}</span>
                        <span>Đơn tối thiểu: {formatCurrency(voucher.min_order_value)}</span>
                      </div>
                      <div className="ticket-info-row">
                        <span>Bắt đầu: {formatDate(voucher.start_date)}</span>
                        <span>Kết thúc: {formatDate(voucher.end_date)}</span>
                      </div>
                      <div className="ticket-info-row">
                        <span>Trạng thái: {voucher.is_active ? "Đang hoạt động" : "Không hoạt động"}</span>
                        <span>Tạo lúc: {formatDate(voucher.created_at)}</span>
                        <span>Cập nhật: {formatDate(voucher.updated_at)}</span>
                      </div>
                      {voucher.deleted_at && (
                        <div className="ticket-info-row">
                          <span>Đã xóa lúc: {formatDate(voucher.deleted_at)}</span>
                        </div>
                      )}
                    </div>
                    <div className="admin-actions">
                      <Link to={`/admin/EditVoucher/${voucher.voucher_id}`}>
                        <FaEdit className="icon-edit" />
                      </Link>
                      <FaTrash
                        className="icon-delete"
                        onClick={() => handleDelete(voucher.voucher_id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pagination">
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
        </>
      )}
    </div>
  );
};

export default VoucherList;
