import React, { useState, useEffect } from "react";
import '../../assets/admin/Chart.css';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../../slices/adminuserSlice";
import { fetchAdminProducts } from "../../slices/adminproductsSlice";
import { fetchAdminOrders } from "../../slices/adminOrderSlice";
import { fetchCategories } from "../../slices/adminCategories";
import { toast } from "react-toastify"; 
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
  const navigate = useNavigate();
  const { users } = useSelector((state) => state.adminuser);
  const { adminproducts } = useSelector((state) => state.adminproduct);
  const { orders } = useSelector((state) => state.adminOrder);
  const { categories } = useSelector((state) => state.category);

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

  // HÀM LẤY NGÀY HÔM NAY CHO MAX DATE
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // **HÀM CHUYỂN ĐỔI NGÀY ĐƯỢC SỬA ĐỂ HANDLE TẤT CẢ FORMAT**
  const parseCreatedAt = (created_at) => {
    if (!created_at) return null;
    
    try {
      // Format ISO: "2025-07-29T18:31:51.000000Z"
      if (created_at.includes('T') && created_at.includes('Z')) {
        return new Date(created_at);
      }
      
      // Format: "dd/mm/yyyy hh:mm:ss"
      if (created_at.includes("/") && created_at.includes(" ")) {
        const [datePart] = created_at.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        return new Date(year, month - 1, day);
      }
      
      // Format: "yyyy-mm-dd hh:mm:ss"
      if (created_at.includes("-") && created_at.includes(" ")) {
        const [datePart] = created_at.split(" ");
        return new Date(datePart);
      }
      
      // Format: "yyyy-mm-dd"
      if (created_at.includes("-") && !created_at.includes(" ")) {
        return new Date(created_at);
      }
      
      // Thử parse trực tiếp
      return new Date(created_at);
    } catch (error) {
      console.error('Lỗi parse created_at:', created_at, error);
      return null;
    }
  };

  const convertInputDateToDate = (inputDate) => {
    if (!inputDate) return null;
    return new Date(inputDate);
  };

  // **HÀM LỌC USERS THEO NGÀY**
  const getFilteredUsers = () => {
    if (!dateFilter.isEnabled || !users) {
      return users || [];
    }

    return users.filter(user => {
      const userDate = parseCreatedAt(user.created_at);
      if (!userDate) return false;

      // Lọc theo ngày cụ thể
      if (dateFilter.specificDate) {
        const specificDate = convertInputDateToDate(dateFilter.specificDate);
        if (!specificDate) return false;
        
        return (
          userDate.getFullYear() === specificDate.getFullYear() &&
          userDate.getMonth() === specificDate.getMonth() &&
          userDate.getDate() === specificDate.getDate()
        );
      }

      // Lọc theo khoảng thời gian
      if (dateFilter.startDate && dateFilter.endDate) {
        const startDate = convertInputDateToDate(dateFilter.startDate);
        const endDate = convertInputDateToDate(dateFilter.endDate);
        
        if (!startDate || !endDate) return false;
        
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        userDate.setHours(12, 0, 0, 0);
        
        return userDate >= startDate && userDate <= endDate;
      }

      // Chỉ có startDate
      if (dateFilter.startDate && !dateFilter.endDate) {
        const startDate = convertInputDateToDate(dateFilter.startDate);
        if (!startDate) return false;
        
        startDate.setHours(0, 0, 0, 0);
        userDate.setHours(12, 0, 0, 0);
        
        return userDate >= startDate;
      }

      // Chỉ có endDate
      if (!dateFilter.startDate && dateFilter.endDate) {
        const endDate = convertInputDateToDate(dateFilter.endDate);
        if (!endDate) return false;
        
        endDate.setHours(23, 59, 59, 999);
        userDate.setHours(12, 0, 0, 0);
        
        return userDate <= endDate;
      }

      return true;
    });
  };

  // **HÀM LỌC ORDERS THEO NGÀY**
  const getFilteredOrders = () => {
    if (!dateFilter.isEnabled || !orders) {
      return orders || [];
    }

    return orders.filter(order => {
      const orderDate = parseCreatedAt(order.created_at);
      if (!orderDate) return false;

      // Lọc theo ngày cụ thể
      if (dateFilter.specificDate) {
        const specificDate = convertInputDateToDate(dateFilter.specificDate);
        if (!specificDate) return false;
        
        return (
          orderDate.getFullYear() === specificDate.getFullYear() &&
          orderDate.getMonth() === specificDate.getMonth() &&
          orderDate.getDate() === specificDate.getDate()
        );
      }

      // Lọc theo khoảng thời gian
      if (dateFilter.startDate && dateFilter.endDate) {
        const startDate = convertInputDateToDate(dateFilter.startDate);
        const endDate = convertInputDateToDate(dateFilter.endDate);
        
        if (!startDate || !endDate) return false;
        
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        orderDate.setHours(12, 0, 0, 0);
        
        return orderDate >= startDate && orderDate <= endDate;
      }

      // Chỉ có startDate
      if (dateFilter.startDate && !dateFilter.endDate) {
        const startDate = convertInputDateToDate(dateFilter.startDate);
        if (!startDate) return false;
        
        startDate.setHours(0, 0, 0, 0);
        orderDate.setHours(12, 0, 0, 0);
        
        return orderDate >= startDate;
      }

      // Chỉ có endDate
      if (!dateFilter.startDate && dateFilter.endDate) {
        const endDate = convertInputDateToDate(dateFilter.endDate);
        if (!endDate) return false;
        
        endDate.setHours(23, 59, 59, 999);
        orderDate.setHours(12, 0, 0, 0);
        
        return orderDate <= endDate;
      }

      return true;
    });
  };

  // **HÀM LỌC SẢN PHẨM THEO NGÀY**
  const getFilteredProducts = () => {
    if (!dateFilter.isEnabled || !adminproducts) {
      return adminproducts || [];
    }

    return adminproducts.filter(product => {
      const productDate = parseCreatedAt(product.created_at);
      if (!productDate) return false;

      // Lọc theo ngày cụ thể
      if (dateFilter.specificDate) {
        const specificDate = convertInputDateToDate(dateFilter.specificDate);
        if (!specificDate) return false;
        
        return (
          productDate.getFullYear() === specificDate.getFullYear() &&
          productDate.getMonth() === specificDate.getMonth() &&
          productDate.getDate() === specificDate.getDate()
        );
      }

      // Lọc theo khoảng thời gian
      if (dateFilter.startDate && dateFilter.endDate) {
        const startDate = convertInputDateToDate(dateFilter.startDate);
        const endDate = convertInputDateToDate(dateFilter.endDate);
        
        if (!startDate || !endDate) return false;
        
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        productDate.setHours(12, 0, 0, 0);
        
        return productDate >= startDate && productDate <= endDate;
      }

      // Chỉ có startDate
      if (dateFilter.startDate && !dateFilter.endDate) {
        const startDate = convertInputDateToDate(dateFilter.startDate);
        if (!startDate) return false;
        
        startDate.setHours(0, 0, 0, 0);
        productDate.setHours(12, 0, 0, 0);
        
        return productDate >= startDate;
      }

      // Chỉ có endDate
      if (!dateFilter.startDate && dateFilter.endDate) {
        const endDate = convertInputDateToDate(dateFilter.endDate);
        if (!endDate) return false;
        
        endDate.setHours(23, 59, 59, 999);
        productDate.setHours(12, 0, 0, 0);
        
        return productDate <= endDate;
      }

      return true;
    });
  };

  // **HÀM LỌC DANH MỤC THEO NGÀY**
  const getFilteredCategories = () => {
    if (!dateFilter.isEnabled || !categories) {
      return categories || [];
    }

    return categories.filter(category => {
      const categoryDate = parseCreatedAt(category.created_at);
      if (!categoryDate) return false;

      // Lọc theo ngày cụ thể
      if (dateFilter.specificDate) {
        const specificDate = convertInputDateToDate(dateFilter.specificDate);
        if (!specificDate) return false;
        
        return (
          categoryDate.getFullYear() === specificDate.getFullYear() &&
          categoryDate.getMonth() === specificDate.getMonth() &&
          categoryDate.getDate() === specificDate.getDate()
        );
      }

      // Lọc theo khoảng thời gian
      if (dateFilter.startDate && dateFilter.endDate) {
        const startDate = convertInputDateToDate(dateFilter.startDate);
        const endDate = convertInputDateToDate(dateFilter.endDate);
        
        if (!startDate || !endDate) return false;
        
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        categoryDate.setHours(12, 0, 0, 0);
        
        return categoryDate >= startDate && categoryDate <= endDate;
      }

      // Chỉ có startDate
      if (dateFilter.startDate && !dateFilter.endDate) {
        const startDate = convertInputDateToDate(dateFilter.startDate);
        if (!startDate) return false;
        
        startDate.setHours(0, 0, 0, 0);
        categoryDate.setHours(12, 0, 0, 0);
        
        return categoryDate >= startDate;
      }

      // Chỉ có endDate
      if (!dateFilter.startDate && dateFilter.endDate) {
        const endDate = convertInputDateToDate(dateFilter.endDate);
        if (!endDate) return false;
        
        endDate.setHours(23, 59, 59, 999);
        categoryDate.setHours(12, 0, 0, 0);
        
        return categoryDate <= endDate;
      }

      return true;
    });
  };

  // **HÀM getCurrentMonthName ĐỂ PHẢN ÁNH BỘ LỌC**
  const getCurrentMonthName = () => {
    if (!dateFilter.isEnabled) {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      return `Tháng ${month}/${year}`;
    }

    if (dateFilter.specificDate) {
      const specificDate = convertInputDateToDate(dateFilter.specificDate);
      if (specificDate) {
        const month = specificDate.getMonth() + 1;
        const year = specificDate.getFullYear();
        return `Ngày ${specificDate.getDate()}/${month}/${year}`;
      }
    }

    if (dateFilter.startDate && dateFilter.endDate) {
      const startDate = convertInputDateToDate(dateFilter.startDate);
      const endDate = convertInputDateToDate(dateFilter.endDate);
      
      if (startDate && endDate) {
        const startMonth = startDate.getMonth() + 1;
        const startYear = startDate.getFullYear();
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();
        
        if (startMonth === endMonth && startYear === endYear) {
          return `Tháng ${startMonth}/${startYear}`;
        }
        
        return `${startMonth}/${startYear} - ${endMonth}/${endYear}`;
      }
    }

    if (dateFilter.startDate && !dateFilter.endDate) {
      const startDate = convertInputDateToDate(dateFilter.startDate);
      if (startDate) {
        const month = startDate.getMonth() + 1;
        const year = startDate.getFullYear();
        return `Từ ${month}/${year}`;
      }
    }

    if (!dateFilter.startDate && dateFilter.endDate) {
      const endDate = convertInputDateToDate(dateFilter.endDate);
      if (endDate) {
        const month = endDate.getMonth() + 1;
        const year = endDate.getFullYear();
        return `Đến ${month}/${year}`;
      }
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `Tháng ${month}/${year}`;
  };

  // **CÁC HÀM TÍNH TOÁN**
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

  const getTotalCancelledOrders = () => {
    const filteredOrders = getFilteredOrders();
    return filteredOrders.filter(order => order.status === "Đã hủy").length;
  };

  const getTotalRefundedOrders = () => {
    const filteredOrders = getFilteredOrders();
    return filteredOrders.filter(order => order.status === "Đã trả hàng").length;
  };

  const getTotalProducts = () => {
    const filteredProducts = getFilteredProducts();
    return filteredProducts ? filteredProducts.length : 0;
  };

  const getTotalCategories = () => {
    const filteredCategories = getFilteredCategories();
    return filteredCategories ? filteredCategories.length : 0;
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

  // **HÀM THỐNG KÊ ĐỂ SỬ DỤNG DỮ LIỆU ĐÃ LỌC**
  const getFilteredStatistics = () => {
    const filteredOrders = getFilteredOrders();
    const validCompletedOrders = filteredOrders.filter(order => {
      const validStatuses = ["Hoàn thành", "Đã giao hàng"];
      return validStatuses.includes(order.status) && 
             order.total_amount && 
             parseFloat(order.total_amount) > 0 &&
             order.created_at;
    });

    const cancelledOrders = filteredOrders.filter(order => 
      order.status === "Đã hủy"
    );

    const refundedOrders = filteredOrders.filter(order => 
      order.status === "Đã trả hàng"
    );

    // Tính tổng doanh thu
    const totalRevenue = validCompletedOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.total_amount) || 0);
    }, 0);

    // Tính tổng sản phẩm đã bán
    const totalSoldProducts = validCompletedOrders.reduce((total, order) => {
      if (order.products && Array.isArray(order.products)) {
        const orderTotal = order.products.reduce((orderSum, product) => {
          return orderSum + (Number(product.quantity) || 0);
        }, 0);
        return total + orderTotal;
      }
      return total;
    }, 0);

    return {
      revenue: totalRevenue,
      soldProducts: totalSoldProducts,
      completedOrders: validCompletedOrders.length,
      cancelledOrders: cancelledOrders.length,
      refundedOrders: refundedOrders.length,
      totalOrders: validCompletedOrders.length + cancelledOrders.length + refundedOrders.length
    };
  };

  // **CÁC HÀM CŨ CHO TRƯỜNG HỢP KHÔNG FILTER**
  const getThisMonthSoldProducts = () => {
    const today = new Date();
    const validOrders = getValidCompletedOrders();
    
    return validOrders.reduce((total, order) => {
      const orderDate = parseCreatedAt(order.created_at);
      if (!orderDate) return total;
      
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
    }, 0);
  };

  const getThisMonthCompletedOrders = () => {
    const today = new Date();
    const validOrders = getValidCompletedOrders();
    
    return validOrders.filter(order => {
      const orderDate = parseCreatedAt(order.created_at);
      if (!orderDate) return false;
      
      return (
        orderDate.getFullYear() === today.getFullYear() &&
        orderDate.getMonth() === today.getMonth()
      );
    }).length;
  };

  const getThisMonthCancelledOrders = () => {
    const today = new Date();
    const filteredOrders = getFilteredOrders();
    
    return filteredOrders.filter(order => {
      if (order.status !== "Đã hủy" || !order.created_at) return false;
      
      const orderDate = parseCreatedAt(order.created_at);
      if (!orderDate) return false;
      
      return (
        orderDate.getFullYear() === today.getFullYear() &&
        orderDate.getMonth() === today.getMonth()
      );
    }).length;
  };

  const getThisMonthRefundedOrders = () => {
    const today = new Date();
    const filteredOrders = getFilteredOrders();
    
    return filteredOrders.filter(order => {
      if (order.status !== "Đã trả hàng" || !order.created_at) return false;
      
      const orderDate = parseCreatedAt(order.created_at);
      if (!orderDate) return false;
      
      return (
        orderDate.getFullYear() === today.getFullYear() &&
        orderDate.getMonth() === today.getMonth()
      );
    }).length;
  };

  const getThisMonthRevenue = () => {
    const today = new Date();
    const validOrders = getValidCompletedOrders();
    
    return validOrders.reduce((sum, order) => {
      const orderDate = parseCreatedAt(order.created_at);
      if (!orderDate) return sum;
      
      if (
        orderDate.getFullYear() === today.getFullYear() &&
        orderDate.getMonth() === today.getMonth()
      ) {
        return sum + parseFloat(order.total_amount);
      }
      return sum;
    }, 0);
  };

  // **HÀM getThisMonthStatistics**
  const getThisMonthStatistics = () => {
    if (dateFilter.isEnabled) {
      return getFilteredStatistics();
    } else {
      const revenue = getThisMonthRevenue();
      const soldProducts = getThisMonthSoldProducts();
      const completedOrders = getThisMonthCompletedOrders();
      const cancelledOrders = getThisMonthCancelledOrders();
      const refundedOrders = getThisMonthRefundedOrders();
      
      return {
        revenue,
        soldProducts,
        completedOrders,
        cancelledOrders,
        refundedOrders,
        totalOrders: completedOrders + cancelledOrders + refundedOrders
      };
    }
  };

  const calculateRevenueStatistics = () => {
    const validOrders = getValidCompletedOrders();
    const monthlyRevenue = {};
    
    validOrders.forEach(order => {
      const orderDate = parseCreatedAt(order.created_at);
      if (!orderDate) return;
      
      const year = orderDate.getFullYear();
      const month = orderDate.getMonth() + 1;
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
      const orderDate = parseCreatedAt(order.created_at);
      if (!orderDate) return sum;
      
      if (
        orderDate.getFullYear() === today.getFullYear() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getDate() === today.getDate()
      ) {
        return sum + parseFloat(order.total_amount);
      }
      return sum;
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
    const filteredUsers = getFilteredUsers(); 
    filteredUsers.forEach(user => {
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

  const getRecentOrders = (limit = null) => {
    const filteredOrders = getFilteredOrders();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Chỉ hiển thị các trạng thái được chỉ định
    const validStatuses = [
      "Chờ xác nhận",
      "Đã xác nhận", 
      "Đang vận chuyển",
      "Đã giao hàng",
      "Hoàn thành"
    ];
    
    const recentOrders = filteredOrders
      .filter(order => {
        if (!order.created_at || !order.customer || !order.email || !validStatuses.includes(order.status)) {
          return false;
        }
        
        // Nếu có bộ lọc ngày được bật, sử dụng dữ liệu đã lọc
        if (dateFilter.isEnabled) {
          return true;
        }
        
        // Nếu không có bộ lọc, chỉ lấy đơn hàng trong tháng hiện tại
        const orderDate = parseCreatedAt(order.created_at);
        if (!orderDate) return false;
        
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .sort((a, b) => {
        const dateA = parseCreatedAt(a.created_at);
        const dateB = parseCreatedAt(b.created_at);
        return dateB - dateA; // Sắp xếp từ mới nhất đến cũ nhất
      });
    
    // Nếu có limit thì áp dụng, nếu không thì trả về tất cả
    return limit ? recentOrders.slice(0, limit) : recentOrders;
  };

  const formatOrderDate = (dateString) => {
    const date = parseCreatedAt(dateString);
    if (!date) return 'N/A';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Hoàn thành': '#10b981',
      'Đã giao hàng': '#10b981', 
      'Đang xử lý': '#f59e0b',
      'Chờ xác nhận': '#6b7280',
      'Đã hủy': '#ef4444',
      'Đã trả hàng': '#8b5cf6'
    };
    return statusColors[status] || '#6b7280';
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
    const filteredProducts = getFilteredProducts();
    if (!filteredProducts || filteredProducts.length === 0) return [];
    return [...filteredProducts]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, limit);
  };

  // **XỬ LÝ BỘ LỌC NGÀY**
  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => {
      const newFilter = { ...prev, [field]: value };
      
      if (field === 'specificDate' && value) {
        newFilter.startDate = '';
        newFilter.endDate = '';
      }
      
      if ((field === 'startDate' || field === 'endDate') && value) {
        newFilter.specificDate = '';
      }
      
      return newFilter;
    });
  };

  const handleApplyFilter = () => {
    const hasFilter = dateFilter.startDate || dateFilter.endDate || dateFilter.specificDate;
    
    if (!hasFilter) {
      toast.error('Vui lòng chọn thời gian để lọc!');
      return;
    }
    
    if (dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      
      if (startDate > endDate) {
        toast.error('Ngày bắt đầu không thể lớn hơn ngày kết thúc!');
        return;
      }
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      if (startDate > today) {
        toast.error('Ngày bắt đầu không thể là ngày tương lai!');
        return;
      }
    }
    
    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      if (endDate > today) {
        toast.error('Ngày kết thúc không thể là ngày tương lai!');
        return;
      }
    }
    
    if (dateFilter.specificDate) {
      const specificDate = new Date(dateFilter.specificDate);
      if (specificDate > today) {
        toast.error('Ngày được chọn không thể là ngày tương lai!');
        return;
      }
    }
    
    setDateFilter(prev => ({ ...prev, isEnabled: true }));
    toast.success('🎯 Đã áp dụng bộ lọc thành công!');
    console.log('Áp dụng bộ lọc:', dateFilter);
  };

  const handleClearFilter = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
      specificDate: '',
      isEnabled: false
    });
    toast.info('🗑️ Đã xóa bộ lọc!');
    console.log('Đã xóa bộ lọc');
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // USE EFFECTS
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminOrders());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchUsers());
      dispatch(fetchAdminProducts());
      dispatch(fetchAdminOrders());
      dispatch(fetchCategories());
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

  // **HÀM FORMAT TIỀN TỆ LINH HOẠT**
  const formatCurrency = (amount) => {
    if (amount === 0) return '0 VND';
    
    const absAmount = Math.abs(amount);
    
    if (absAmount >= 1000000000) {
      // Tỉ VND (>=1 tỷ)
      return `${(amount / 1000000000).toFixed(1)}Tỉ VND`;
    } else if (absAmount >= 1000000) {
      // Triệu VND (>=1 triệu)
      const millions = amount / 1000000;
      if (millions >= 100) {
        return `${Math.round(millions)}Tr VND`;
      } else {
        return `${millions.toFixed(1)}Tr VND`;
      }
    } else if (absAmount >= 1000) {
      // Nghìn VND (>=1 nghìn)
      return `${(amount / 1000).toFixed(0)}K VND`;
    } else {
      // Dưới 1000 VND
      return `${amount.toLocaleString()} VND`;
    }
  };

  // **TÍNH TOÁN DỮ LIỆU CHO HIỂN THỊ**
  const revenueStats = calculateRevenueStatistics();
  const todayRevenue = getTodayRevenue();
  const thisMonthRevenue = getThisMonthRevenue();
  const validOrders = getValidCompletedOrders();
  const totalSoldProducts = getTotalSoldProducts();
  const yearlyAverageRevenue = getYearlyAverageRevenue();
  const monthlyStats = getThisMonthStatistics();
  const filteredOrders = getFilteredOrders();
  const filteredUsers = getFilteredUsers();
  const currentMonthName = getCurrentMonthName();
  
  // CÁC GIÁ TRỊ CHO KPI CARDS
  const totalCancelledOrders = getTotalCancelledOrders();
  const totalRefundedOrders = getTotalRefundedOrders();
  const totalProducts = getTotalProducts();
  const totalCategories = getTotalCategories();
  const filteredProducts = getFilteredProducts();
  const filteredCategories = getFilteredCategories();

  return (
    <div className="chart-admin-dashboard">
      {/* Header bộ lọc ngày */}
      <div className="chart-admin-dashboard-header">
        <div className="chart-admin-date-controls">
          <div className="chart-admin-date-group">
            <label>Từ ngày</label>
            <input 
              type="date" 
              value={dateFilter.startDate}
              onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
              max={getTodayDateString()}
            />
          </div>
          <div className="chart-admin-date-group">
            <label>Đến ngày</label>
            <input 
              type="date" 
              value={dateFilter.endDate}
              onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
              min={dateFilter.startDate}
              max={getTodayDateString()}
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

      {/* HIỂN THỊ TRẠNG THÁI LỌC */}
      {dateFilter.isEnabled && (
        <div className="chart-admin-filter-status">
          <div className="chart-admin-filter-info">
            🔍 <strong>Đang lọc:</strong>
            {dateFilter.specificDate && ` Ngày ${formatDisplayDate(dateFilter.specificDate)}`}
            {dateFilter.startDate && dateFilter.endDate && 
             ` Từ ${formatDisplayDate(dateFilter.startDate)} đến ${formatDisplayDate(dateFilter.endDate)}`}
            {dateFilter.startDate && !dateFilter.endDate && 
             ` Từ ${formatDisplayDate(dateFilter.startDate)} đến hiện tại`}
            {!dateFilter.startDate && dateFilter.endDate && 
             ` Đến ${formatDisplayDate(dateFilter.endDate)}`}
            <span className="chart-admin-filter-result">
              ({filteredUsers.length} tài khoản, {filteredOrders.length} đơn hàng, {filteredProducts.length} sản phẩm, {filteredCategories.length} danh mục)
            </span>
          </div>
          <button className="chart-admin-remove-filter" onClick={handleClearFilter}>
            ✕
          </button>
        </div>
      )}

      {/* **8 KPI Cards với CSS Classes** */}
      <div className="chart-admin-kpi-section">
        {/* 🔵 Tài khoản */}
        <div className="chart-admin-kpi-card chart-admin-kpi-blue">
          <div className="chart-admin-kpi-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="chart-admin-kpi-info">
            <div className="chart-admin-kpi-title">
              {dateFilter.isEnabled ? 'Tài khoản đã lọc' : 'Tổng tài khoản'}
            </div>
            <div className="chart-admin-kpi-number">{filteredUsers?.length?.toLocaleString() || '0'} tài khoản</div>
          </div>
        </div>

        {/* 🟢 Đơn hoàn thành */}
        <div className="chart-admin-kpi-card chart-admin-kpi-green">
          <div className="chart-admin-kpi-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="chart-admin-kpi-info">
            <div className="chart-admin-kpi-title">
              {dateFilter.isEnabled ? 'Đơn hoàn thành (Đã lọc)' : 'Tổng đơn hoàn thành'}
            </div>
            <div className="chart-admin-kpi-number">{validOrders.length.toLocaleString()} đơn hàng</div>
          </div>
        </div>



        <div className="chart-admin-kpi-card chart-admin-kpi-orange">
          <div className="chart-admin-kpi-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="chart-admin-kpi-info">
            <div className="chart-admin-kpi-title">
              {dateFilter.isEnabled ? 'SP đã bán (Đã lọc)' : 'SP đã bán'}
            </div>
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
              {formatCurrency(revenueStats.totalRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* **Monthly Statistics Section** */}
      <div className="chart-admin-monthly-stats-section">
        <h3 className="chart-admin-section-title">
          📊 Thống Kê {currentMonthName} 
          {dateFilter.isEnabled && (
            <span style={{ 
              fontSize: '0.8em', 
              color: '#f59e0b', 
              marginLeft: '10px',
              fontWeight: 'normal' 
            }}>
              (Đã lọc)
            </span>
          )}
        </h3>
        <div className="chart-admin-monthly-stats-grid">
          <div className="chart-admin-monthly-stat-card">
            <div className="chart-admin-stat-icon">💸</div> 
            <div className="chart-admin-stat-info">
              <div className="chart-admin-stat-label">
                Doanh thu {dateFilter.isEnabled ? '(Đã lọc)' : currentMonthName}
              </div>
              <div className="chart-admin-stat-value">{monthlyStats.revenue.toLocaleString('vi-VN')} VND</div>
            </div>
          </div>
          
        
          
          <div className="chart-admin-monthly-stat-card">
            <div className="chart-admin-stat-icon">🎉</div> 
            <div className="chart-admin-stat-info">
              <div className="chart-admin-stat-label">
                Đơn hoàn thành {dateFilter.isEnabled ? '(Đã lọc)' : currentMonthName}
              </div>
              <div className="chart-admin-stat-value">{monthlyStats.completedOrders.toLocaleString()} đơn hàng</div>
            </div>
          </div>
          
          <div className="chart-admin-monthly-stat-card">
            <div className="chart-admin-stat-icon">❌</div>
            <div className="chart-admin-stat-info">
              <div className="chart-admin-stat-label">
                Đơn hủy {dateFilter.isEnabled ? '(Đã lọc)' : currentMonthName}
              </div>
              <div className="chart-admin-stat-value">{monthlyStats.cancelledOrders.toLocaleString()} đơn hủy</div>
            </div>
          </div>

          <div className="chart-admin-monthly-stat-card">
            <div className="chart-admin-stat-icon">🔄</div>
            <div className="chart-admin-stat-info">
              <div className="chart-admin-stat-label">
                Đơn đã trả hàng {dateFilter.isEnabled ? '(Đã lọc)' : currentMonthName}
              </div>
              <div className="chart-admin-stat-value">{(monthlyStats.refundedOrders || 0).toLocaleString()} đơn hàng</div>
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
            {revenueStats.highest?.total ? revenueStats.highest.total.toLocaleString('vi-VN') + ' VND' : '0 VND'}
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
            {revenueStats.lowest?.total ? revenueStats.lowest.total.toLocaleString('vi-VN') + ' VND' : '0 VND'}
          </div>
          <div className="chart-admin-stat-sublabel">
            {revenueStats.lowest?.orderCount || 0} đơn hàng
          </div>
        </div>

        <div className="chart-admin-revenue-stat-card">
          <div className="chart-admin-stat-label">Doanh thu trung bình tháng/năm</div>
          <div className="chart-admin-stat-amount chart-admin-blue">
            {revenueStats.average.toLocaleString('vi-VN')} VND
          </div>
          <div className="chart-admin-stat-sublabel">
            {currentMonthName}: {thisMonthRevenue.toLocaleString('vi-VN')} VND
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
        <div className="recent-orders-table">
          <h4 className="recent-orders-title">🛒 Đơn Hàng Gần Đây</h4>
          <div className="recent-orders-container">
            <div className="recent-orders-header">
              <span>STT</span>
              <span>Khách hàng</span>
              <span>Email</span>
              <span>Mã đơn</span>
              <span>Trạng thái</span>
              <span>Thời gian</span>
              <span>Giá trị</span>
            </div>
            {getRecentOrders().map((order, index) => (
              <div 
                key={`order-${order.id || order.order_id || index}`} 
                className="recent-orders-row recent-orders-row-clickable"
                onClick={() => {
                  const orderId = order.id || order.order_id;
                  if (orderId) {
                    navigate(`/admin/orderdetail/${orderId}`);
                  }
                }}
                title="Click để xem chi tiết đơn hàng"
              >
                <span className="recent-orders-stt">{index + 1}</span>
                <span className="recent-orders-customer">
                  {order.customer || 'N/A'}
                </span>
                <span className="recent-orders-email">
                  {order.email || 'N/A'}
                </span>
                <span className="recent-orders-code">
                  #{order.order_code || order.id || 'N/A'}
                </span>
                <span 
                  className="recent-orders-status"
                  data-status={order.status}
                >
                  {order.status || 'N/A'}
                </span>
                <span className="recent-orders-time">
                  {formatOrderDate(order.created_at)}
                </span>
                <span className="recent-orders-amount">
                  {order.total_amount 
                    ? formatCurrency(parseFloat(order.total_amount))
                    : '0 VND'
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
                  {formatCurrency(buyer.totalSpent)}
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
