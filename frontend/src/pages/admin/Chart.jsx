import React, { useState, useEffect } from "react";
import '../../assets/admin/Chart.css';
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../../slices/adminuserSlice";
import { fetchAdminProducts } from "../../slices/adminproductsSlice";
import { fetchAdminOrders  } from "../../slices/adminOrderSlice";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
const Chart = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.adminuser);
  const { adminproducts } = useSelector((state) => state.adminproduct);
  const { orders, completedOrders,cancelledOrders } = useSelector((state) => state.adminOrder);

  const [activeTab, setActiveTab] = useState('day');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(false);
  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  // Tính doanh thu trong ngày
  const today = new Date();
  const todayRevenue = completedOrders && completedOrders.length > 0
    ? completedOrders.reduce((sum, order) => {
        const orderDate = new Date(order.created_at);
        if (
          orderDate.getFullYear() === today.getFullYear() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getDate() === today.getDate()
        ) {
          return sum + Number(order.total_amount || 0);
        }
        return sum;
      }, 0)
    : 0;

  // Tính doanh thu trong tháng hiện tại
  const monthRevenue = completedOrders && completedOrders.length > 0
    ? completedOrders.reduce((sum, order) => {
        const orderDate = new Date(order.created_at);
        if (
          orderDate.getFullYear() === today.getFullYear() &&
          orderDate.getMonth() === today.getMonth()
        ) {
          return sum + Number(order.total_amount || 0);
        }
        return sum;
      }, 0)
    : 0;


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
const getMostViewedProduct = () => {
  if (!adminproducts || adminproducts.length === 0) return null;

  const sorted = [...adminproducts].sort((a, b) => b.view_count - a.view_count);
  return sorted[0]; // sản phẩm có lượt xem cao nhất
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

  const getTotalSoldProducts = () => {
  return orders
    .filter((order) => order.status === "Hoàn thành")
    .reduce((sum, order) => sum + Number(order.totalProduct || 0), 0);
};

  const getMonthRevenueData = () => {
    // Doanh thu từng ngày trong tháng hiện tại
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dailyData = {};
    completedOrders.forEach((order) => {
      const date = new Date(order.created_at);
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      ) {
        const day = date.getDate();
        if (!dailyData[day]) dailyData[day] = 0;
        dailyData[day] += Number(order.total_amount || 0);
      }
    });
    return days.map((d) => ({
      day: d,
      revenue: dailyData[d] || 0,
      label: d.toString(),
    }));
  };


const getCancelVsCompleteData = () => {
  const cancelled = orders.filter(order => order.status === "Đã hủy").length;
  const completed = orders.filter(order => order.status === "Hoàn thành").length;

  return [
    { name: "Đã hủy", value: cancelled },
    { name: "Hoàn thành", value: completed }
  ];
};

const getBestAndWorstSellingProducts = () => {
  const productSales = {};

  orders
    .filter(order => order.status === "Hoàn thành")
    .forEach(order => {
      order.products.forEach(product => {
        const { product_id, product_name, product_image, quantity } = product;
        if (!productSales[product_id]) {
          productSales[product_id] = {
            product_id,
            product_name,
            product_image,
            totalSold: 0,
          };
        }
        productSales[product_id].totalSold += Number(quantity);
      });
    });

  const productList = Object.values(productSales);
  if (productList.length === 0) return { best: null, worst: null };

  const sorted = productList.sort((a, b) => b.totalSold - a.totalSold);
  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
  };
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

      <div className="row stats-row" style={{ marginBottom: 30 }}>
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
                {totalRevenue.toLocaleString("vi-VN")} 
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
              <h5>Sản phẩm đã bán</h5>
               <strong>{getTotalSoldProducts().toLocaleString("vi-VN")}</strong>
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

 <div className="thongke-flex">
  {/* Cột trái: Danh sách sản phẩm (70%) */}
  <div className="col-left">
  <h5 className="mt-4 mb-3">Thống kê sản phẩm</h5>
  <div className="product-list">
    {(() => {
      const { best, worst } = getBestAndWorstSellingProducts();
      const mostViewed = getMostViewedProduct();

      if (!best && !worst && !mostViewed) return <p>Chưa có dữ liệu sản phẩm.</p>;

      return (
        <>
          {best && (
            <div className="product-card">
              <h6>🔥 Sản phẩm bán chạy nhất</h6>
              <div className="product-info">
                <img src={best.product_image} alt={best.product_name} />
                <div>
                  <strong>{best.product_name}</strong>
                  <p>Đã bán: {best.totalSold} sản phẩm</p>
                </div>
              </div>
            </div>
          )}

          {worst && (
            <div className="product-card">
              <h6>🐢 Sản phẩm bán chậm nhất</h6>
              <div className="product-info">
                <img src={worst.product_image} alt={worst.product_name} />
                <div>
                  <strong>{worst.product_name}</strong>
                  <p>Đã bán: {worst.totalSold} sản phẩm</p>
                </div>
              </div>
            </div>
          )}

          {mostViewed && (
            <div className="product-card">
              <h6>👀 Sản phẩm được xem nhiều nhất</h6>
              <div className="product-info">
                <img src={mostViewed.image_url} alt={mostViewed.name} />
                <div>
                  <strong>{mostViewed.name}</strong>
                  <p>Đã xem: {mostViewed.view_count} lần</p>
                </div>
              </div>
            </div>
          )}
        </>
      );
    })()}
  </div>
</div>


  {/* Cột phải: Pie chart (30%) */}
 <div className="col-right">
  <div className="admin_thongke-chart-container">
    <h5 className="mb-3">Tỷ lệ huỷ đơn hàng</h5>
    
    <ResponsiveContainer width="100%" height={260}>
  <PieChart>
    <Pie
      data={getCancelVsCompleteData()}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={90}
      paddingAngle={3}
      stroke="#fff"
      strokeWidth={2}
    >
      <Cell fill="#f44336" />
      <Cell fill="#4caf50" />
    </Pie>
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight={600}>
      Tỷ lệ
    </text>
  </PieChart>
</ResponsiveContainer>


    <div className="pie-legend">
      {(() => {
        const data = getCancelVsCompleteData();
        const total = data.reduce((sum, item) => sum + item.value, 0);
        return data.map((entry, i) => {
          const color = entry.name === "Đã hủy" ? "#f44336" : "#4caf50";
          const percent = total === 0 ? 0 : ((entry.value / total) * 100).toFixed(1);
          return (
            <div key={i} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: color }}></div>
              <span style={{ color }}>{entry.name}: {entry.value} đơn ({percent}%)</span>
            </div>
          );
        });
      })()}
    </div>
  </div>
</div>

</div>

      {/* Biểu đồ doanh thu theo tháng (12 tháng) */}
      <div className="admin_thongke-chart-container" style={{ marginBottom: 40 }}>
        <h5 className="mt-4 mb-3">Biểu đồ doanh thu theo tháng</h5>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={getMonthlyRevenueData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4caf50"
              fill="#c8e6c9"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#388e3c", strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
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
