import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminVouchers,
  deleteAdminVoucher,
} from "../../slices/AdminVoucher";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../assets/admin/VoucherList.css";

const VoucherList = () => {
  const dispatch = useDispatch();
  const { vouchers, loading, error } = useSelector((state) => state.adminVoucher);

  const [searchTerm, setSearchTerm] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");
  const [expiryDaysFilter, setExpiryDaysFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminVouchers());
  }, [dispatch]);

  const handleDelete = (voucherId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này không?")) {
      dispatch(deleteAdminVoucher(voucherId));
      toast.success("Đã xóa voucher thành công!");
    }
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

      // Tìm kiếm theo mã hoặc tiêu đề (không phân biệt hoa thường)
      const matchesSearch =
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Lọc theo khoảng giảm giá
      let matchesDiscount = true;
      if (discountFilter !== "") {
        const discount = v.discount_amount;
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

      // Lọc theo hạn sử dụng
      let matchesExpiry = true;
      if (expiryDaysFilter !== "") {
        if (expiryDaysFilter === "expired") {
          // Đã hết hạn (endDate < ngày hiện tại)
          matchesExpiry = endDate < today;
        } else {
          // Hết hạn trong X ngày (endDate từ hôm nay đến ngày trong tương lai)
          const endRange = plusDays(parseInt(expiryDaysFilter));
          matchesExpiry = endDate >= today && endDate <= endRange;
        }
      }

      return matchesSearch && matchesDiscount && matchesExpiry;
    });
  }, [vouchers, searchTerm, discountFilter, expiryDaysFilter]);

  if (loading) return <div className="adminvoucher-loading">Đang tải danh sách voucher...</div>;
  if (error) return <div className="adminvoucher-error">Lỗi: {error}</div>;

  return (
    <div className="adminvoucher-container">
      <h2 className="adminvoucher-title">Danh sách mã giảm giá</h2>

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

      {filteredVouchers.length === 0 ? (
        <p className="adminvoucher-empty">Không tìm thấy mã giảm giá nào.</p>
      ) : (
        <table className="adminvoucher-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã Voucher</th>
              <th>Tiêu đề</th>
              <th>Giảm giá</th>
              <th>Đơn hàng tối thiểu</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.map((voucher, index) => (
              <tr key={voucher.voucher_id}>
                <td className="td-id">{index + 1}</td>
                <td className="td-code">{voucher.code}</td>
                <td className="td-title">{voucher.title}</td>
                <td className="td-discount">{voucher.discount_amount.toLocaleString()}₫</td>
                <td className="td-minorder">{voucher.min_order_value.toLocaleString()}₫</td>
                <td className="td-start">{voucher.start_date}</td>
                <td className="td-end">{voucher.end_date}</td>
                <td>
                  <Link to={`/admin/EditVoucher/${voucher.voucher_id}`}>
                    <FaEdit className="icon-edit" />
                  </Link>
                  <FaTrash
                    className="icon-delete"
                    onClick={() => handleDelete(voucher.voucher_id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VoucherList;
