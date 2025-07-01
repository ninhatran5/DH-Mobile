import React, { useState, useEffect } from "react";
import '../../assets/admin/Chart.css';
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../../slices/adminuserSlice";
import { fetchAdminProducts } from "../../slices/adminproductsSlice";
import { fetchAdminOrders } from "../../slices/adminOrderSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const Chart = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.adminuser);
  const { adminproducts } = useSelector((state) => state.adminproduct);
  const { orders, completedOrders } = useSelector((state) => state.adminOrder);

  const [activeTab, setActiveTab] = useState('day');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(false);

  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchUsers());
      dispatch(fetchAdminProducts());
      dispatch(fetchAdminOrders());
    }, 2000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  const getMonthlyRevenueData = () => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      months.push({ key, label: 12 - i }); 
    }

    const monthlyData = {};
    completedOrders.forEach((order) => {
      const date = new Date(order.created_at);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = 0;
      monthlyData[key] += Number(order.total_amount || 0);
    });

    return months.map(({ key, label }) => ({
      month: key,
      revenue: monthlyData[key] || 0,
      label: label.toString()
    }));
  };

  return (
    <div className="container admin_thongke-dashboard">
      <div className="admin_thongke-dashboard-header">
        <h4>Tổng quan hệ thống</h4>
        <div className="admin_thongke-chart-period-selector">
          {['day', 'week', 'month', 'year'].map((tab) => (
            <button
              key={tab}
              className={`admin_thongke-chart-period-btn ${
                activeTab === tab ? 'admin_thongke-chart-period-btn-active' : ''
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {{
                day: 'Hôm nay',
                week: 'Tuần này',
                month: 'Tháng này',
                year: 'Năm nay'
              }[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="row stats-row">
        <div className="col-md-3 col-sm-6">
          <div className="admin_thongke-card admin_thongke-stat-card admin_thongke-users-card">
            <div className="admin_thongke-card-icon admin_thongke-icon-larger">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="admin_thongke-card-content">
              <h5>Tổng người dùng</h5>
              <div className="admin_thongke-stat-value">{users?.length || 0}</div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="admin_thongke-card admin_thongke-stat-card admin_thongke-revenue-card">
            <div className="admin_thongke-card-icon admin_thongke-icon-larger">
              <i className="bi bi-currency-dollar"></i>
            </div>
            <div className="admin_thongke-card-content">
              <h5>Doanh thu</h5>
              <div className="admin_thongke-stat-value">
                {totalRevenue.toLocaleString("vi-VN")} đ
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="admin_thongke-card admin_thongke-stat-card admin_thongke-orders-card">
            <div className="admin_thongke-card-icon admin_thongke-icon-larger">
              <i className="bi bi-bag-check"></i>
            </div>
            <div className="admin_thongke-card-content">
              <h5>Đơn hàng</h5>
              <div className="admin_thongke-stat-value">{orders?.length || 0}</div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="admin_thongke-card admin_thongke-stat-card admin_thongke-products-card">
            <div className="admin_thongke-card-icon admin_thongke-icon-larger">
              <i className="bi bi-box-seam"></i>
            </div>
            <div className="admin_thongke-card-content">
              <h5>Sản phẩm</h5>
              <div className="admin_thongke-stat-value">{adminproducts?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="admin_thongke-chart-container">
        <h5 className="mt-4 mb-3">Biểu đồ doanh thu theo tháng</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getMonthlyRevenueData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}tr`} />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{ background: "#fff", border: "1px solid #ccc", padding: 10 }}>
                      <div><strong>Tháng: {label}</strong></div>
                      <div style={{color:"red"}}>Doanh thu: {Number(payload[0].value).toLocaleString('vi-VN')} đ</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="revenue" fill="#4caf50" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {/* Thêm doanh thu cao nhất và thấp nhất */}
        {(() => {
          const data = getMonthlyRevenueData();
          if (!data.length) return null;
          const max = data.reduce((a, b) => (a.revenue > b.revenue ? a : b));
          const min = data.reduce((a, b) => (a.revenue < b.revenue ? a : b));
          return (
            <div style={{ marginTop: 20, display: "flex", gap: 40, flexWrap: "wrap" }}>
              <div>
                <strong>Doanh thu cao nhất:</strong>{" "}
                Tháng {max.label} ({max.month}) -{" "}
                <span style={{ color: "green" }}>{max.revenue.toLocaleString("vi-VN")} đ</span>
              </div>
              <div>
                <strong>Doanh thu thấp nhất:</strong>{" "}
                Tháng {min.label} ({min.month}) -{" "}
                <span style={{ color: "red" }}>{min.revenue.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Chart;
