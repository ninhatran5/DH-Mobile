import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders, fetchPaginatedAdminOrders, updateOrderStatus, cancelOrder } from "../../slices/adminOrderSlice";
import "../../assets/admin/HomeAdmin.css";
import "../../assets/admin/order.css";
import "../../assets/admin/OrdersList.css";
import "../../assets/admin/order-status-colors.css";
import { FiEdit, FiEye, FiX, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);
import DefaultImage from "../../assets/images/adminacccount.jpg";
import CodImage from "../../assets/images/COD.webp";
import VnpayImage from "../../assets/images/vnpay.jpg";
import Loading from "../../components/Loading";
import { useSearchParams } from "react-router-dom";

const OrdersList = () => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, error } = useSelector(
    (state) => state.adminOrder
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatusTab, setSelectedStatusTab] = useState("Tất cả");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltering, setIsFiltering] = useState(false); 

  const navigate = useNavigate();

  const currentPage = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
   
    
    if (selectedStatusTab === "Tất cả") {
      setIsFiltering(false);
      dispatch(fetchPaginatedAdminOrders(currentPage));
    } else {
      setIsFiltering(true);
      dispatch(fetchAdminOrders());
    }
  }, [selectedStatusTab, currentPage, dispatch]);
  useEffect(() => {
    if (!searchParams.has("page")) {
      setSearchParams({ page: "1" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handlePageChange = (newPage) => {
    
    
    const pageNumber = parseInt(newPage);
    
    if (isFiltering) {
      if (pageNumber && pageNumber > 0) {
        setSearchParams({ page: pageNumber.toString() });
      }
    } else {
      if (pageNumber && pageNumber > 0 && pageNumber <= (pagination?.lastPage || 1)) {
        setSearchParams({ page: pageNumber.toString() });
      } else {
        console.log("❌ Invalid page:", pageNumber);
      }
    }
  };

  // Function để xử lý thay đổi tab trạng thái
  const handleStatusTabChange = (status) => {
    setSelectedStatusTab(status);
    // Reset về trang 1 khi thay đổi trạng thái
    setSearchParams({ page: "1" });
  };

  const normalizeString = (str) =>
    str?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-") || "";

  const statusTabs = [
    "Tất cả",
    "Chờ xác nhận", 
    "Đã xác nhận",
    "Đang vận chuyển",
    "Đã giao hàng",
    "Hoàn thành",
    "Đã huỷ"
  ];

  // Danh sách các trạng thái cần ẩn
  const hiddenStatuses = [
    "Yêu cầu hoàn hàng",
    "Đã chấp thuận",
    "Đã từ chối", 
    "Đang xử lý",
    "Đã trả hàng"
  ];

  // Cập nhật filteredOrders để xử lý cả hai trường hợp
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((order) => {
      const normalizedStatus = normalizeString(order.status);
      
      // Kiểm tra xem trạng thái có trong danh sách ẩn không
      const isHiddenStatus = hiddenStatuses.some(hiddenStatus => 
        normalizedStatus === normalizeString(hiddenStatus)
      );
      
      // Lọc theo search term
      const matchesSearch = normalizeString(order.order_code).includes(normalizeString(searchTerm)) ||
                           normalizeString(order.customer).includes(normalizeString(searchTerm));
      
      // Lọc theo status tab
      const matchesStatus = selectedStatusTab === "Tất cả" || 
                           normalizedStatus === normalizeString(selectedStatusTab);
      
      return !isHiddenStatus && matchesSearch && matchesStatus;
    });

    // Nếu đang lọc theo trạng thái (không phải "Tất cả"), thực hiện phân trang client-side
    if (isFiltering && selectedStatusTab !== "Tất cả") {
      const itemsPerPage = 15;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filtered.slice(startIndex, endIndex);
    }

    return filtered;
  }, [orders, searchTerm, selectedStatusTab, hiddenStatuses, isFiltering, currentPage]);

  // Tính toán thông tin pagination cho client-side filtering
  const clientPagination = useMemo(() => {
    if (!isFiltering || selectedStatusTab === "Tất cả") {
      return pagination;
    }

    // Lọc tất cả orders theo điều kiện (không phân trang)
    const allFilteredOrders = orders.filter((order) => {
      const normalizedStatus = normalizeString(order.status);
      
      const isHiddenStatus = hiddenStatuses.some(hiddenStatus => 
        normalizedStatus === normalizeString(hiddenStatus)
      );
      
      const matchesSearch = normalizeString(order.order_code).includes(normalizeString(searchTerm)) ||
                           normalizeString(order.customer).includes(normalizeString(searchTerm));
      
      const matchesStatus = selectedStatusTab === "Tất cả" || 
                           normalizedStatus === normalizeString(selectedStatusTab);
      
      return !isHiddenStatus && matchesSearch && matchesStatus;
    });

    const itemsPerPage = 15;
    const totalItems = allFilteredOrders.length;
    const lastPage = Math.ceil(totalItems / itemsPerPage) || 1;

    return {
      currentPage: currentPage,
      lastPage: lastPage,
      perPage: itemsPerPage,
      total: totalItems
    };
  }, [orders, searchTerm, selectedStatusTab, hiddenStatuses, isFiltering, currentPage, pagination]);

  // Hàm refresh data sau khi cập nhật
  const refreshCurrentPage = () => {
    if (selectedStatusTab === "Tất cả") {
      dispatch(fetchPaginatedAdminOrders(currentPage));
    } else {
      dispatch(fetchAdminOrders());
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/admin/orderdetail/${order.order_id}`, {
      state: { order },
    });
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    MySwal.fire({
      title: "Xác nhận cập nhật",
      text: `Bạn có chắc muốn cập nhật trạng thái đơn hàng sang \"${newStatus}\" không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#007aff",
      cancelButtonColor: "#d33",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setIsUpdatingStatus(true);
        dispatch(updateOrderStatus({ orderId, status: newStatus }))
          .then((action) => {
            setIsUpdatingStatus(false);
            if (action?.type?.endsWith("/fulfilled")) {
              setSelectedOrder(null);
              Swal.fire("Thành công", "Trạng thái đơn hàng đã được cập nhật.", "success");
              refreshCurrentPage(); // Refresh data
            } else {
              Swal.fire("Lỗi", "Cập nhật trạng thái đơn hàng thất bại.", "error");
            }
          })
          .catch(() => {
            setIsUpdatingStatus(false);
            Swal.fire("Lỗi", "Cập nhật trạng thái đơn hàng thất bại.", "error");
          });
      }
    });
  };

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = () => {
    if (!cancelReason.trim()) {
      Swal.fire("Lý do huỷ không được để trống", "", "warning");
      return;
    }
    setIsUpdatingStatus(true);
    dispatch(cancelOrder({ orderId: orderToCancel.order_id, cancel_reason: cancelReason }))
      .then(() => {
        setShowCancelModal(false);
        setOrderToCancel(null);
        Swal.fire("Đã huỷ đơn hàng", "Đơn hàng đã được huỷ thành công.", "success");
        refreshCurrentPage(); // Refresh data
      })
      .finally(() => {
        setIsUpdatingStatus(false);
      });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const getStatusColorClass = (status) => {
    switch (normalizeString(status)) {
      case 'cho-xac-nhan':
        return 'admin_order-status-pending';
      case 'đa-xac-nhan':
        return 'admin_order-status-confirmed';
      case 'đang-van-chuyen':
        return 'admin_order-status-shipping';
      case 'đa-giao-hang':
        return 'admin_order-status-delivered';
      case 'hoan-thanh':
        return 'admin_order-status-success';
      case 'đa-huy':
        return 'admin_order-status-cancel';
      default:
        return 'admin_order-status-default';
    }
  };

  // Debug logs
  console.log("=== RENDER INFO ===");
  console.log("Current Page:", currentPage);
  console.log("Selected Status Tab:", selectedStatusTab);
  console.log("Is Filtering:", isFiltering);
  console.log("Pagination:", clientPagination);
  console.log("Orders length:", orders.length);
  console.log("Filtered orders length:", filteredOrders.length);

  return (
    <div className="admin_order-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {isUpdatingStatus && <Loading />}
      
      <div className="admin_order-header">
        <div className="admin_order-title">
          <h1>Danh sách đơn hàng</h1>
          <p className="text-muted">Quản lý tất cả các đơn hàng trong hệ thống</p>
        </div>
      </div>

      {/* Search box */}
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', marginBottom: 16 }}>
        <div className="admin_order-search-box" style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <i
            className="bi bi-search admin_order-search-icon"
            style={{
              color: "#0071e3",
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none"
            }}
          ></i>
          <input
            type="text"
            className="admin_order-search-input"
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Status tabs - cập nhật để sử dụng handleStatusTabChange */}
      <div className="admin_order-status-tabs" style={{ margin: '16px 0', width: '100%', maxWidth: 1200 }}>
        {statusTabs.map((status) => (
          <button
            key={status}
            className={`admin_order-status-tab${selectedStatusTab === status ? ' active' : ''}`}
            onClick={() => handleStatusTabChange(status)}
            style={{
              marginRight: 8,
              padding: '6px 16px',
              border: 'none',
              borderRadius: 16,
              background: selectedStatusTab === status ? '#007aff' : '#f1f1f1',
              color: selectedStatusTab === status ? '#fff' : '#222',
              fontWeight: selectedStatusTab === status ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            {status}
            {status !== "Tất cả" && (
              <span
                className="admin_order-status-count"
                style={{
                  marginLeft: 6,
                  background: '#fff',
                  color: '#007aff',
                  borderRadius: '50%',
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-block'
                }}
              >
                {orders.filter(order => {
                  const normalizedOrderStatus = normalizeString(order.status);
                  const normalizedTabStatus = normalizeString(status);
                  
                  const isHiddenStatus = hiddenStatuses.some(hiddenStatus => 
                    normalizedOrderStatus === normalizeString(hiddenStatus)
                  );
                  
                  return !isHiddenStatus && normalizedOrderStatus === normalizedTabStatus;
                }).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {loading ? (
        <div className="admin_order-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="admin_order-list" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', marginTop: 16 }}>
          <table className="admin_order-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>STT</th>
                <th style={{ width: '40px' }}>Ảnh</th>
                <th style={{ width: '15%' }}>Mã đơn / Khách hàng</th>
                <th style={{ width: '15%' }}>Ngày đặt</th>
                <th className="admin_order-hide-sm" style={{ width: '20%' }}>Tổng tiền</th>
                <th style={{ width: '20%' }}>Phương thức</th>
                <th style={{ width: '30%' }}>Trạng thái thanh toán</th>
                <th style={{ width: '25%' }}>Trạng thái</th>
                <th style={{ width: '80px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => {
                  const stt = (currentPage - 1) * (clientPagination?.perPage || 15) + idx + 1;
                  return (
                    <tr key={order.order_id}>
                      <td>
                        <div className="admin_order-stt">{stt}</div>
                      </td>
                      <td>
                       <td>
  <div 
    className="admin_order-avatar"
    style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      border: '2px solid #e0e0e0'
    }}
  >
    <img 
      src={order.image_url || DefaultImage} 
      alt={order.customer}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '50%'
      }}
    />
  </div>
</td>

                      </td>
                      <td>
                        <div className="admin_order-code">{order.order_code}</div>
                        <div className="admin_order-customer">{order.customer}</div>
                      </td>
                      <td>
                        <div>{order.created_at}</div>
                      </td>
                      <td className="admin_order-hide-sm">
                        <div className="admin_order-amount">{formatCurrency(order.total_amount)}</div>
                        <div className="admin_order-items">{order.totalProduct || 0} sản phẩm</div>
                      </td>
                      <td>
                        {order.payment_method === 'COD' ? (
                          <span className="">
                            <img src={CodImage} alt="COD" style={{ width: 70, height: 70, verticalAlign: 'middle' }} />
                          </span>
                        ) : order.payment_method === 'VNPay' ? (
                          <span className="">
                            <img src={VnpayImage} alt="VNPay" style={{ width: 70, height: 52, verticalAlign: 'middle' }} />
                          </span>
                        ) : (
                          <span className="admin_order-payment">{order.payment_method}</span>
                        )}
                      </td>
                      <td><span className="admin_order-payment1">{order.payment_status}</span></td>
                      <td>
                        <span className={`admin_order-status ${getStatusColorClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div
                          className="adminorder-action-group"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0px',
                            justifyContent: 'center',
                            minWidth: 90
                          }}
                        >
                          <button
                            className="adminorder-icon-btn"
                            onClick={() => setSelectedOrder(order)}
                            title="Sửa trạng thái"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#007aff',
                              padding: 0,
                              margin: '0 6px',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              transition: 'background 0.2s'
                            }}
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            className="adminorder-icon-btn"
                            onClick={() => handleViewOrder(order)}
                            title="Xem chi tiết"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#007aff',
                              padding: 0,
                              margin: '0 6px',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              transition: 'background 0.2s'
                            }}
                          >
                            <FiEye size={18} />
                          </button>
                          {normalizeString(order.status) === normalizeString("Chờ xác nhận") && (
                            <button
                              className="adminorder-icon-btn"
                              onClick={() => handleCancelOrder(order)}
                              title="Huỷ đơn hàng"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#d33',
                                padding: 0,
                                margin: '0 6px',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'background 0.2s'
                              }}
                            >
                              <FiX size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="admin_order-empty">
                    <div>
                      <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                      <p>Không tìm thấy đơn hàng nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination - cập nhật để sử dụng clientPagination */}
      <div style={{ 
        marginTop: '20px', 
        width: '100%',
        maxWidth: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {/* First page button */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1}
            style={{
              padding: '8px 12px',
              border: '1px solid #007aff',
              borderRadius: '6px',
              background: currentPage <= 1 ? '#f5f5f5' : '#007aff',
              color: currentPage <= 1 ? '#999' : '#fff',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FiChevronsLeft size={16} />
            Đầu
          </button>

          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{
              padding: '8px 12px',
              border: '1px solid #007aff',
              borderRadius: '6px',
              background: currentPage <= 1 ? '#f5f5f5' : '#007aff',
              color: currentPage <= 1 ? '#999' : '#fff',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FiChevronLeft size={16} />
            Trước
          </button>

          {/* Current page indicator */}
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#007aff',
            color: 'white',
            borderRadius: '6px',
            fontWeight: 'bold',
            border: '2px solid #007aff'
          }}>
            {currentPage}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= (clientPagination?.lastPage || 1)}
            style={{
              padding: '8px 12px',
              border: '1px solid #007aff',
              borderRadius: '6px',
              background: currentPage >= (clientPagination?.lastPage || 1) ? '#f5f5f5' : '#007aff',
              color: currentPage >= (clientPagination?.lastPage || 1) ? '#999' : '#fff',
              cursor: currentPage >= (clientPagination?.lastPage || 1) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Sau
            <FiChevronRight size={16} />
          </button>

          <button
            onClick={() => handlePageChange(clientPagination?.lastPage || 1)}
            disabled={currentPage >= (clientPagination?.lastPage || 1)}
            style={{
              padding: '8px 12px',
              border: '1px solid #007aff',
              borderRadius: '6px',
              background: currentPage >= (clientPagination?.lastPage || 1) ? '#f5f5f5' : '#007aff',
              color: currentPage >= (clientPagination?.lastPage || 1) ? '#999' : '#fff',
              cursor: currentPage >= (clientPagination?.lastPage || 1) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Cuối
            <FiChevronsRight size={16} />
          </button>
        </div>

        {/* Page info */}
        <div style={{
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          Trang {currentPage} / {clientPagination?.lastPage || 1} - 
          Hiển thị {filteredOrders.length} đơn hàng
          {clientPagination && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              Tổng: {clientPagination.total || 0} đơn hàng
              {isFiltering && selectedStatusTab !== "Tất cả" && (
                <span style={{ color: '#007aff', fontWeight: 500 }}>
                  {" "}(Đang lọc theo: {selectedStatusTab})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Các modal giữ nguyên như code trước */}
      {selectedOrder && (
        <div className="adminorder-modal-backdrop">
          <div className="adminorder-modal">
            <h2>Chi tiết đơn hàng</h2>
            <table className="adminorder-details-table">
              <tbody>
                <tr><td><strong>Mã đơn:</strong></td><td>{selectedOrder.order_code}</td></tr>
                <tr><td><strong>Khách hàng:</strong></td><td>{selectedOrder.customer}</td></tr>
                <tr><td><strong>Phương thức:</strong></td><td>{selectedOrder.payment_method}</td></tr>
                <tr><td><strong>Tổng tiền:</strong></td><td>{formatCurrency(selectedOrder.total_amount)}</td></tr>
                <tr>
                  <td><strong>Trạng thái:</strong></td>
                  <td>
                    <div className="adminorder-status-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`admin_order-status ${getStatusColorClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Trạng thái thanh toán:</strong></td>
                  <td><span className="admin_order-payment">{selectedOrder.payment_status}</span></td>
                </tr>
                <tr><td><strong>Số lượng sản phẩm:</strong></td><td>{selectedOrder.totalProduct} sản phẩm</td></tr>
                <tr><td><strong>Ngày tạo:</strong></td><td>{selectedOrder.created_at}</td></tr>
                {selectedOrder.cancel_reason && (
                  <tr><td><strong>Lý do hủy:</strong></td><td>{selectedOrder.cancel_reason}</td></tr>
                )}
              </tbody>
            </table>
            <div className="adminorder-modal-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="adminorder-btn-cancel"
                onClick={() => setSelectedOrder(null)}
                disabled={isUpdatingStatus}
              >
                Hủy
              </button>
              {(() => {
                const statusFlow = [
                  "Chờ xác nhận",
                  "Đã xác nhận",
                  "Đang vận chuyển",
                  "Đã giao hàng"
                ];
                const currentIdx = statusFlow.indexOf(selectedOrder.status);
                const nextStatus = currentIdx !== -1 && currentIdx < statusFlow.length - 1
                  ? statusFlow[currentIdx + 1]
                  : null;
                if (
                  nextStatus &&
                  selectedOrder.status !== "Đã huỷ"
                ) {
                  return (
                    <button
                      className="adminorder-btn-submit"
                      style={{
                        background: "#007aff",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontWeight: 500,
                        cursor: "pointer"
                      }}
                      onClick={() => handleStatusUpdate(selectedOrder.order_id, nextStatus)}
                      disabled={isUpdatingStatus}
                    >
                      Cập nhật sang "{nextStatus}"
                    </button>
                  );
                }
                if (
                  selectedOrder.status === "Đã giao hàng" ||
                  selectedOrder.status === "Hoàn thành"
                ) {
                  return (
                    <button
                      className="adminorder-btn-submit"
                      style={{
                        background: "#007afe",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 24px",
                        fontWeight: 500,
                        cursor: "pointer"
                      }}
                      onClick={() => setSelectedOrder(null)}
                      disabled={isUpdatingStatus}
                    >
                      OK
                    </button>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal huỷ đơn hàng */}
      {showCancelModal && (
        <div className="adminorder-modal-backdrop">
          <div className="adminorder-modal">
            <h2>Huỷ đơn hàng</h2>
            <p>Bạn có chắc chắn muốn huỷ đơn hàng <b>{orderToCancel?.order_code}</b>?</p>
            <div style={{ margin: "12px 0" }}>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                Lý do huỷ đơn hàng:
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                className="adminorder-cancel-reason-textarea"
                disabled={isUpdatingStatus}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div className="adminorder-modal-actions">
              <button
                className="adminorder-btn-cancel"
                onClick={() => setShowCancelModal(false)}
                disabled={isUpdatingStatus}
              >
                Đóng
              </button>
              <button
                className="adminorder-btn-submit"
                onClick={handleConfirmCancelOrder}
                disabled={isUpdatingStatus}
                style={{ background: "#d33" }}
              >
                Xác nhận huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
