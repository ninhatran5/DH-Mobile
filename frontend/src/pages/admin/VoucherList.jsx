import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminVouchers,
  deleteAdminVoucher,
} from "../../slices/AdminVoucher";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../assets/admin/VoucherList.css";

const VoucherList = () => {
  const dispatch = useDispatch();
  const { vouchers, loading, error } = useSelector((state) => state.adminVoucher);

  const [searchTerm, setSearchTerm] = useState("");

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
    return vouchers.filter(
      (v) =>
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vouchers, searchTerm]);

  if (loading) {
    return <div className="adminvoucher-loading">Đang tải danh sách voucher...</div>;
  }

  if (error) {
    return <div className="adminvoucher-error">Lỗi: {error}</div>;
  }

  return (
    <div className="adminvoucher-container">
      <h2 className="adminvoucher-title">Danh sách Voucher</h2>

      <div className="adminvoucher-search">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã hoặc tiêu đề..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredVouchers.length === 0 ? (
        <p className="adminvoucher-empty">Không tìm thấy voucher nào.</p>
      ) : (
        <table className="adminvoucher-table">
          <thead>
            <tr>
              <th>ID</th>
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
            {filteredVouchers.map((voucher) => (
              <tr key={voucher.voucher_id}>
                <td className="td-id">{voucher.voucher_id}</td>
  <td className="td-code">{voucher.code}</td>
  <td className="td-title">{voucher.title}</td>
  <td className="td-discount">{voucher.discount_amount}₫</td>
  <td className="td-minorder">{voucher.min_order_value}₫</td>
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
