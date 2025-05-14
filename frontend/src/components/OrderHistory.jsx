const OrderHistory = ({ orders }) => {
  return (
    <div className="profile-table-wrapper">
      <table className="profile-table">
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Tên đơn hàng</th>
            <th>Giá tiền</th>
            <th>Địa chỉ</th>
            <th>Phương thức thanh toán</th>
            <th>Trạng thái</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={{ fontWeight: 600 }}>#{order.orderCode}</td>
              <td>{order.product}</td>
              <td>{order.price}</td>
              <td>{order.location}</td>
              <td>{order.paymentMethod}</td>
              <td>{order.status}</td>
              <td>
                <span className="profile-label">Xem chi tiết</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistory;
