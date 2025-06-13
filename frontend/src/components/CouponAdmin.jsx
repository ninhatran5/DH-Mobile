import { RiShoppingBag3Fill } from "react-icons/ri";
import dayjs from "dayjs";

const CouponAdmin = ({ voucher, children }) => {
  return (
    <div className="admin-voucher-ticket" style={{ position: "relative", paddingRight: 100 }}>
      <div className="admin-actions-wrapper">
        {children}
      </div>
      <div className="ticket-icon">
        <RiShoppingBag3Fill />
      </div>
      <div className="ticket-dash"></div>
      
      <div className="ticket-content" style={{ marginLeft: 72 }}>
      <div className="ticket-circle top-circle"></div>
      <div className="ticket-circle bottom-circle"></div>
        <div className="ticket-header-row" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="ticket-code" style={{ fontSize: 16, fontWeight: 600, letterSpacing: 2 }}>{voucher.code}</span>
          <span className="ticket-title" style={{ fontSize: 22, fontWeight: 700, marginLeft: 12 }}>{voucher.title}</span>
        </div>
        <div className="ticket-date">
          <span><b>Thời gian sử dụng:</b> </span>  {dayjs(voucher.start_date).format("HH:mm | DD.MM.YYYY")} - {dayjs(voucher.end_date).format("HH:mm | DD.MM.YYYY")}
        </div>
        <div className="ticket-info-row">
          <span><b>Giảm:</b> {Number(voucher.discount_amount).toLocaleString()}₫</span>
          <span><b>Đơn tối thiểu:</b> {Number(voucher.min_order_value).toLocaleString()}₫</span>
          <span><b>Trạng thái:</b> {voucher.is_active ? 'Đang hoạt động' : 'Ngừng'}</span>
        </div>
        <div className="ticket-info-row">
          <span><b>Ngày tạo:</b> {voucher.created_at ? dayjs(voucher.created_at).format("HH:mm | DD.MM.YYYY") : '-'}</span>
          <span><b>Cập nhật:</b> {voucher.updated_at ? dayjs(voucher.updated_at).format("HH:mm | DD.MM.YYYY") : '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default CouponAdmin;
