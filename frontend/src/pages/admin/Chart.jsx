import React, { useState, useEffect } from "react";
import '../../assets/admin/Chart.css';
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../../slices/adminuserSlice";
import { fetchAdminProducts } from "../../slices/adminproductsSlice";
import { fetchAdminOrders } from "../../slices/adminOrderSlice";
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
  Cell,
  BarChart,
  Bar
} from "recharts";

const Chart = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.adminuser);
  const { adminproducts } = useSelector((state) => state.adminproduct);
  const { orders } = useSelector((state) => state.adminOrder);

  const [activeTab, setActiveTab] = useState('day');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(false);

  // State cho bộ lọc ngày
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    specificDate: '',
    isEnabled: false
  });

  // Hàm lấy tên tháng hiện tại
  const getCurrentMonthName = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `Tháng ${month}/${year}`;
  };

  // Hàm lọc orders theo ngày
  const getFilteredOrders = () => {
    if (!dateFilter.isEnabled) {
      return orders;
    }

    return orders.filter(order => {
      if (!order.created_at) return false;

      try {
        const [datePart] = order.created_at.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        const orderDate = new Date(year, month - 1, day);

        if (dateFilter.specificDate) {
          const [specificDay, specificMonth, specificYear] = dateFilter.specificDate.split("/").map(Number);
          const specificDateObj = new Date(specificYear, specificMonth - 1, specificDay);
          return orderDate.getTime() === specificDateObj.getTime();
        }

        if (dateFilter.startDate && dateFilter.endDate) {
          const [startDay, startMonth, startYear] = dateFilter.startDate.split("/").map(Number);
          const [endDay, endMonth, endYear] = dateFilter.endDate.split("/").map(Number);
          const startDateObj = new Date(startYear, startMonth - 1, startDay);
          const endDateObj = new Date(endYear, endMonth - 1, endDay);
          
          return orderDate >= startDateObj && orderDate <= endDateObj;
        }

        return true;
      } catch (error) {
        console.error('Lỗi parse ngày khi lọc:', error);
        return false;
      }
    });
  };

  // Các hàm tính toán sử dụng filtered orders
  const getValidCompletedOrders = () => {
    const filteredOrders = getFilteredOrders();
    return filteredOrders.filter(order => {
      const validStatuses = ["Hoàn thành", "Đã giao hàng"];
      return validStatuses.includes(order.status) && 
             order.total_amount && 
             parseFloat(order.total_amount) > 0 &&
             order.created_at;
    });
  };

  const getTotalSoldProducts = () => {
    const validOrders = getValidCompletedOrders();
    
    return validOrders.reduce((total, order) => {
      if (order.products && Array.isArray(order.products)) {
        const orderTotal = order.products.reduce((orderSum, product) => {
          return orderSum + (Number(product.quantity) || 0);
        }, 0);
        return total + orderTotal;
      }
      return total;
    }, 0);
  };

  const getYearlyAverageRevenue = () => {
    const validOrders = getValidCompletedOrders();
    const totalRevenue = validOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.total_amount) || 0);
    }, 0);
    
    return Math.round(totalRevenue / 12);
  };

  const getThisMonthSoldProducts = () => {
    const today = new Date();
    const validOrders = getValidCompletedOrders();
    
    return validOrders.reduce((total, order) => {
      try {
        const [datePart] = order.created_at.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        const orderDate = new Date(year, month - 1, day);
        
        if (
          orderDate.getFullYear() === today.getFullYear() &&
          orderDate.getMonth() === today.getMonth()
        ) {
          if (order.products && Array.isArray(order.products)) {
            const orderTotal = order.products.reduce((orderSum, product) => {
              return orderSum + (Number(product.quantity) || 0);
            }, 0);
            return total + orderTotal;
          }
        }
        return total;
      } catch (error) {
        console.error('Lỗi tính sản phẩm bán trong tháng:', error);
        return total;
      }
    }, 0);
  };

  const getThisMonthCompletedOrders = () => {
    const today = new Date();
    const validOrders = getValidCompletedOrders();
    
    return validOrders.filter(order => {
      try {
        const [datePart] = order.created_at.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        const orderDate = new Date(year, month - 1, day);
        
        return (
          orderDate.getFullYear() === today.getFullYear() &&
          orderDate.getMonth() === today.getMonth()
        );
      } catch (error) {
        console.error('Lỗi tính đơn hoàn thành trong tháng:', error);
        return false;
      }
    }).length;
  };

  const getThisMonthCancelledOrders = () => {
    const today = new Date();
    const filteredOrders = getFilteredOrders();
    
    return filteredOrders.filter(order => {
      try {
        if (order.status !== "Đã hủy" || !order.created_at) return false;
        
        const [datePart] = order.created_at.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        const orderDate = new Date(year, month - 1, day);
        
        return (
          orderDate.getFullYear() === today.getFullYear() &&
          orderDate.getMonth() === today.getMonth()
        );
      } catch (error) {
        console.error('Lỗi tính đơn hủy trong tháng:', error);
        return false;
      }
    }).length;
  };

  const getThisMonthStatistics = () => {
    const revenue = getThisMonthRevenue();
    const soldProducts = getThisMonthSoldProducts();
    const completedOrders = getThisMonthCompletedOrders();
    const cancelledOrders = getThisMonthCancelledOrders();
    
    return {
      revenue,
      soldProducts,
      completedOrders,
      cancelledOrders,
      totalOrders: completedOrders + cancelledOrders
    };
  };

  const calculateRevenueStatistics = () => {
    const validOrders = getValidCompletedOrders();
    const monthlyRevenue = {};
    
    validOrders.forEach(order => {
      try {
        const [datePart] = order.created_at.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        
        if (!day || !month || !year) return;
        
        const monthKey = `${year}-${String(month).padStart(2, "0")}`;
        const amount = parseFloat(order.total_amount);
        
        if (isNaN(amount)) return;
        
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = {
            month: monthKey,
            total: 0,
            orderCount: 0,
            monthName: `Tháng ${month}/${year}`
          };
        }
        
        monthlyRevenue[monthKey].total += amount;
        monthlyRevenue[monthKey].orderCount += 1;
      } catch (error) {
        console.error('Lỗi parse ngày:', order.created_at, error);
      }
    });

    const monthlyData = Object.values(monthlyRevenue);
    
    if (monthlyData.length === 0) {
      return {
        totalRevenue: 0,
        highest: null,
        lowest: null,
        average: 0,
        monthlyData: [],
        validOrdersCount: 0
      };
    }

    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.total, 0);
    const highest = monthlyData.reduce((max, cur) => cur.total > max.total ? cur : max);
    const lowest = monthlyData.reduce((min, cur) => cur.total < min.total ? cur : min);
    const average = totalRevenue / monthlyData.length;

    return {
      totalRevenue,
      highest,
      lowest,
      average: Math.round(average),
      monthlyData: monthlyData.sort((a, b) => a.month.localeCompare(b.month)),
      validOrdersCount: validOrders.length
    };
  };

  const getTodayRevenue = () => {
    const today = new Date();
    const validOrders = getValidCompletedOrders();
    
    return validOrders.reduce((sum, order) => {
      try {
        const [datePart] = order.created_at.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        const orderDate = new Date(year, month - 1, day);
        
        if (
          orderDate.getFullYear() === today.getFullYear() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getDate() === today.getDate()
        ) {
          return sum + parseFloat(order.total_amount);
        }
        return sum;
      } catch (error) {
        console.error('Lỗi tính doanh thu hôm nay:', error);
        return sum;
      }
    }, 0);
  };

  const getThisMonthRevenue = () => {
    const today = new Date();
    const validOrders = getValidCompletedOrders();
    
    return validOrders.reduce((sum, order) => {
      try {
        const [datePart] = order.created_at.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        const orderDate = new Date(year, month - 1, day);
        
        if (
          orderDate.getFullYear() === today.getFullYear() &&
          orderDate.getMonth() === today.getMonth()
        ) {
          return sum + parseFloat(order.total_amount);
        }
        return sum;
      } catch (error) {
        console.error('Lỗi tính doanh thu tháng này:', error);
        return sum;
      }
    }, 0);
  };

  const getMonthlyRevenueData = () => {
    const now = new Date();
    const months = [];
    const revenueStats = calculateRevenueStatistics();
    const monthlyDataMap = {};
    
    revenueStats.monthlyData.forEach(item => {
      monthlyDataMap[item.month] = item.total;
    });
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = `T${d.getMonth() + 1}/${d.getFullYear()}`;
      
      months.push({
        month: key,
        revenue: monthlyDataMap[key] || 0,
        label: label
      });
    }

    return months;
  };

  const getUserStatsFromOrders = () => {
    const userStats = {};
    const filteredOrders = getFilteredOrders();
    
    users.forEach(user => {
      userStats[user.email] = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        image_url: user.image_url || null,
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        cancelledOrders: 0
      };
    });

    filteredOrders.forEach(order => {
      const email = order.email;
      const customer = order.customer;
      const totalAmount = parseFloat(order.total_amount) || 0;
      const status = order.status;

      if (!userStats[email]) {
        userStats[email] = {
          id: null,
          full_name: customer,
          email: email,
          image_url: order.image_url || null,
          totalOrders: 0,
          totalSpent: 0,
          completedOrders: 0,
          cancelledOrders: 0
        };
      }

      if (customer && !userStats[email].full_name) {
        userStats[email].full_name = customer;
      }

      if (order.image_url && !userStats[email].image_url) {
        userStats[email].image_url = order.image_url;
      }

      userStats[email].totalOrders += 1;

      if (status === "Hoàn thành" || status === "Đã giao hàng") {
        userStats[email].totalSpent += totalAmount;
        userStats[email].completedOrders += 1;
      } else if (status === "Đã hủy") {
        userStats[email].cancelledOrders += 1;
      }
    });

    return userStats;
  };

  const getTopBuyersFromOrders = (topN = 10) => {
    const userStats = getUserStatsFromOrders();
    
    return Object.values(userStats)
      .filter(user => user.totalSpent > 0)
      .sort((a, b) => {
        if (b.totalSpent !== a.totalSpent) {
          return b.totalSpent - a.totalSpent;
        }
        return b.completedOrders - a.completedOrders;
      })
      .slice(0, topN);
  };

  const getAccountsList = (limit = 9) => {
    const userStats = getUserStatsFromOrders();
    
    return Object.values(userStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  };

  const getTopSellingProducts = (limit = 5) => {
    const productSales = {};
    const validOrders = getValidCompletedOrders();

    validOrders.forEach(order => {
      if (order.products && Array.isArray(order.products)) {
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
          productSales[product_id].totalSold += Number(quantity) || 0;
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);
  };

  const getMostViewedProducts = (limit = 5) => {
    if (!adminproducts || adminproducts.length === 0) return [];
    return [...adminproducts]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, limit);
  };

  // Xử lý events cho bộ lọc ngày
  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilter = () => {
    setDateFilter(prev => ({ ...prev, isEnabled: true }));
    console.log('Áp dụng bộ lọc:', dateFilter);
  };

  const handleClearFilter = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
      specificDate: '',
      isEnabled: false
    });
    console.log('Đã xóa bộ lọc');
  };

  // USE EFFECTS
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
    }, 30000);
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

  // TÍNH TOÁN DỮ LIỆU CHO HIỂN THỊ
  const revenueStats = calculateRevenueStatistics();
  const todayRevenue = getTodayRevenue();
  const thisMonthRevenue = getThisMonthRevenue();
  const validOrders = getValidCompletedOrders();
  const totalSoldProducts = getTotalSoldProducts();
  const yearlyAverageRevenue = getYearlyAverageRevenue();
  const monthlyStats = getThisMonthStatistics();
  const filteredOrders = getFilteredOrders();
  const currentMonthName = getCurrentMonthName();

  return (
    <div className="chart-admin-dashboard">
      {/* Header chỉ có bộ lọc ngày */}
      <div className="chart-admin-dashboard-header">
        <div className="chart-admin-date-controls">
          <div className="chart-admin-date-group">
            <label>Từ ngày</label>
            <input 
              type="text" 
              placeholder="dd/mm/yyyy"
              value={dateFilter.startDate}
              onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="chart-admin-date-group">
            <label>Đến ngày</label>
            <input 
              type="text" 
              placeholder="dd/mm/yyyy"
              value={dateFilter.endDate}
              onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="chart-admin-date-group">
            <label>Ngày cụ thể</label>
            <input 
              type="text" 
              placeholder="dd/mm/yyyy"
              value={dateFilter.specificDate}
              onChange={(e) => handleDateFilterChange('specificDate', e.target.value)}
            />
          </div>
          <button className="chart-admin-apply-button" onClick={handleApplyFilter}>
            Áp dụng
          </button>
          <button className="chart-admin-clear-button" onClick={handleClearFilter}>
            Xóa lọc
          </button>
        </div>
      </div>

      {/* Filter Status */}
      {dateFilter.isEnabled && (
        <div className="chart-admin-filter-status">
          <div className="chart-admin-filter-info">
            🔍 <strong>Đang lọc:</strong>
            {dateFilter.specificDate && ` Ngày ${dateFilter.specificDate}`}
            {dateFilter.startDate && dateFilter.endDate && 
             ` Từ ${dateFilter.startDate} đến ${dateFilter.endDate}`}
            <span className="chart-admin-filter-result">
              ({filteredOrders.length} đơn hàng)
            </span>
          </div>
          <button className="chart-admin-remove-filter" onClick={handleClearFilter}>
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="chart-admin-kpi-section">
        <div className="chart-admin-kpi-card chart-admin-kpi-blue">
          <div className="chart-admin-kpi-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="chart-admin-kpi-info">
            <div className="chart-admin-kpi-title">Tổng tài khoản</div>
            <div className="chart-admin-kpi-number">{users?.length?.toLocaleString() || '0'} tài khoản</div>
          </div>
        </div>

        <div className="chart-admin-kpi-card chart-admin-kpi-green">
          <div className="chart-admin-kpi-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="chart-admin-kpi-info">
            <div className="chart-admin-kpi-title">Đơn hoàn thành</div>
            <div className="chart-admin-kpi-number">{validOrders.length.toLocaleString()} đơn hàng</div>
          </div>
        </div>

        <div className="chart-admin-kpi-card chart-admin-kpi-orange">
          <div className="chart-admin-kpi-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="chart-admin-kpi-info">
            <div className="chart-admin-kpi-title">Sản phẩm đã bán</div>
            <div className="chart-admin-kpi-number">{totalSoldProducts.toLocaleString()} sản phẩm</div>
          </div>
        </div>

        <div className="chart-admin-kpi-card chart-admin-kpi-purple">
          <div className="chart-admin-kpi-icon">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <div className="chart-admin-kpi-info">
            <div className="chart-admin-kpi-title">Tổng doanh thu</div>
            <div className="chart-admin-kpi-number">
              {revenueStats.totalRevenue > 0 
                ? `${(revenueStats.totalRevenue / 1000000000).toFixed(1)}B VND`
                : '0 VND'
              }
            </div>
           
          </div>
        </div>
      </div>

      {/* Monthly Statistics Section */}
      <div className="chart-admin-monthly-stats-section">
        <h3 className="chart-admin-section-title">📊 Thống Kê {currentMonthName}</h3>
        <div className="chart-admin-monthly-stats-grid">
          <div className="chart-admin-monthly-stat-card">
            <div className="chart-admin-stat-icon">💸</div> 
            <div className="chart-admin-stat-info">
              <div className="chart-admin-stat-label">Doanh thu {currentMonthName}</div>
              <div className="chart-admin-stat-value">{(monthlyStats.revenue / 1000000).toFixed(1)}M VND</div>
            </div>
          </div>
          
          <div className="chart-admin-monthly-stat-card">
            <div className="chart-admin-stat-icon">🛒</div> 
            <div className="chart-admin-stat-info">
              <div className="chart-admin-stat-label">Sản phẩm đã bán {currentMonthName}</div>
              <div className="chart-admin-stat-value">{monthlyStats.soldProducts.toLocaleString()} sản phẩm</div>
            </div>
          </div>
          
          <div className="chart-admin-monthly-stat-card">
            <div className="chart-admin-stat-icon">🎉</div> 
            <div className="chart-admin-stat-info">
              <div className="chart-admin-stat-label">Đơn hoàn thành {currentMonthName}</div>
              <div className="chart-admin-stat-value">{monthlyStats.completedOrders.toLocaleString()} đơn hàng</div>
            </div>
          </div>
          
          <div className="chart-admin-monthly-stat-card">
            <div className="chart-admin-stat-icon">❌</div>
            <div className="chart-admin-stat-info">
              <div className="chart-admin-stat-label">Đơn hủy {currentMonthName}</div>
              <div className="chart-admin-stat-value">{monthlyStats.cancelledOrders.toLocaleString()} đơn huỷ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="chart-admin-revenue-stats-section">
        <div className="chart-admin-revenue-stat-card">
          <div className="chart-admin-stat-label">Doanh thu tháng cao nhất</div>
          <div className="chart-admin-stat-month">
            {revenueStats.highest?.monthName || 'Chưa có dữ liệu'}
          </div>
          <div className="chart-admin-stat-amount chart-admin-positive">
            {revenueStats.highest?.total?.toLocaleString() || '0'} VND
          </div>
          <div className="chart-admin-stat-sublabel">
            {revenueStats.highest?.orderCount || 0} đơn hàng
          </div>
        </div>

        <div className="chart-admin-revenue-stat-card">
          <div className="chart-admin-stat-label">Doanh thu tháng thấp nhất</div>
          <div className="chart-admin-stat-month">
            {revenueStats.lowest?.monthName || 'Chưa có dữ liệu'}
          </div>
          <div className="chart-admin-stat-amount chart-admin-negative">
            {revenueStats.lowest?.total?.toLocaleString() || '0'} VND
          </div>
          <div className="chart-admin-stat-sublabel">
            {revenueStats.lowest?.orderCount || 0} đơn hàng
          </div>
        </div>

        <div className="chart-admin-revenue-stat-card">
          <div className="chart-admin-stat-label">Doanh thu trung bình tháng/năm</div>
          <div className="chart-admin-stat-amount chart-admin-blue">
            {yearlyAverageRevenue.toLocaleString()} VND
          </div>
          <div className="chart-admin-stat-sublabel">
            {currentMonthName}: {(thisMonthRevenue / 1000000).toFixed(1)}M VND
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-admin-chart-container">
        <h3 className="chart-admin-chart-title">
          📊 Biểu Đồ Doanh Thu Theo Tháng 
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={getMonthlyRevenueData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip 
              formatter={(value) => [`${value.toLocaleString()} VND`, 'Doanh thu']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="revenue" 
              fill="#4285f4" 
              radius={[4, 4, 0, 0]}
              name="Doanh thu"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Product Rankings */}
      <div className="chart-admin-product-ranking-section">
        <div className="chart-admin-ranking-card">
          <h4 className="chart-admin-ranking-title">🔥 Top 5 Sản Phẩm Xem Nhiều Nhất</h4>
          <div className="chart-admin-ranking-list">
            {getMostViewedProducts().map((product, index) => (
              <div key={`viewed-${product.id || index}`} className="chart-admin-ranking-item">
                <div className="chart-admin-rank-number">{index + 1}</div>
                <div className="chart-admin-product-info">
                  <span className="chart-admin-product-name">{product.name}</span>
                </div>
                <div className="chart-admin-product-stat">
                  <span className="chart-admin-stat-number">
                    {(product.view_count || 0).toLocaleString()} lượt xem
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-admin-ranking-card">
          <h4 className="chart-admin-ranking-title">💰 Top 5 Sản Phẩm Bán Chạy Nhất</h4>
          <div className="chart-admin-ranking-list">
            {getTopSellingProducts().map((product, index) => (
              <div key={`selling-${product.product_id || index}`} className="chart-admin-ranking-item">
                <div className="chart-admin-rank-number">{index + 1}</div>
                <div className="chart-admin-product-info">
                  <span className="chart-admin-product-name">{product.product_name}</span>
                </div>
                <div className="chart-admin-product-stat">
                  <span className="chart-admin-stat-number">
                    {product.totalSold?.toLocaleString()} đã bán
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="chart-admin-bottom-section">
        <div className="chart-admin-accounts-table">
          <h4 className="chart-admin-section-title">👥 Danh Sách Tài Khoản</h4>
          <div className="chart-admin-table-container">
            <div className="chart-admin-table-header">
              <span>STT</span>
              <span>Tên</span>
              <span>Email</span>
              <span>Đơn</span>
              <span>Chi tiêu</span>
            </div>
            {getAccountsList(9).map((account, index) => (
              <div key={`account-${account.email || index}`} className="chart-admin-table-row">
                <span>{index + 1}</span>
                <span>{account.full_name || 'Chưa cập nhật'}</span>
                <span>{account.email}</span>
                <span>{account.completedOrders}</span>
                <span className="chart-admin-amount">
                  {account.totalSpent > 0 
                    ? `${(account.totalSpent / 1000000).toFixed(1)}M` 
                    : '0M'
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-admin-top-buyers">
          <h4 className="chart-admin-section-title">🏆 Top 5 Khách Hàng VIP</h4>
          <div className="chart-admin-buyers-list">
            {getTopBuyersFromOrders(5).map((buyer, index) => (
              <div key={`buyer-${buyer.email || index}`} className="chart-admin-buyer-item">
                <div className="chart-admin-buyer-rank">{index + 1}</div>
                <div className="chart-admin-buyer-details">
                  <div className="chart-admin-buyer-name">
                    {buyer.full_name || 'Chưa cập nhật'}
                  </div>
                  <div className="chart-admin-buyer-orders">
                    {buyer.completedOrders} đơn hoàn thành
                  </div>
                </div>
                <div className="chart-admin-buyer-amount">
                  {(buyer.totalSpent / 1000000).toFixed(1)}M VND
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chart;
