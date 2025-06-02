import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminVouchers,
  deleteAdminVoucher,
} from "../../slices/AdminVoucher";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../../assets/admin/VoucherList.css";

const VoucherList = () => {
  const dispatch = useDispatch();
  const { vouchers, loading, error } = useSelector((state) => state.adminVoucher);

  const voucherList = useMemo(() => vouchers, [vouchers]);

  useEffect(() => {
    dispatch(fetchAdminVouchers());
  }, [dispatch]);

  const handleDelete = (voucherId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này không?")) {
      dispatch(deleteAdminVoucher(voucherId));
      toast.success("Đã xóa voucher thành công!");
    }
  };

  const handleEdit = (voucherId) => {
    toast.info(`Chuyển đến trang sửa voucher ID: ${voucherId}`);
    // Chuyển hướng đến trang sửa nếu cần
  };

  if (loading) {
    return <div className="adminvoucher-loading">Đang tải danh sách voucher...</div>;
  }

  if (error) {
    return <div className="adminvoucher-error">Lỗi: {error}</div>;
  }

  return (
    <div className="adminvoucher-container">
      <h2 className="adminvoucher-title">Danh sách Voucher</h2>
      {voucherList.length === 0 ? (
        <p className="adminvoucher-empty">Chưa có voucher nào.</p>
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
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {voucherList.map((voucher) => (
              <tr key={voucher.voucher_id}>
                <td>{voucher.voucher_id}</td>
                <td>{voucher.code}</td>
                <td>{voucher.title}</td>
                <td>{voucher.discount_amount}₫</td>
                <td>{voucher.min_order_value}₫</td>
                <td>{voucher.start_date}</td>
                <td>{voucher.end_date}</td>
                <td>
                  <span className="adminvoucher-status">
                    {voucher.is_active ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </td>
                <td>
                  <FaEdit
                    className="icon-edit"
                    onClick={() => handleEdit(voucher.voucher_id)}
                  />
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
