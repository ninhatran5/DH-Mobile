import React, { useState, useEffect } from "react";
import '../../assets/admin/Chart.css';

const Chart = () => {
    const [activeTab, setActiveTab] = useState('day');
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        searchTerm: '',
        dateRange: 'all'
    });
    
    const itemsPerPage = 5;
    
    // Mock transactions data
    const transactions = [
        {
            id: 'GD-789',
            customer: {
                initials: 'NV',
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@example.com',
                avatarClass: 'admin_thongke-bg-primary-soft'
            },
            product: 'Gói Premium',
            date: '20/02/2024',
            amount: '299,000đ',
            status: {
                text: 'Hoàn thành',
                class: 'admin_thongke-status-active'
            }
        },
        {
            id: 'GD-788',
            customer: {
                initials: 'TH',
                name: 'Trần Thị B',
                email: 'tranthib@example.com',
                avatarClass: 'admin_thongke-bg-success-soft'
            },
            product: 'Gói Cơ Bản',
            date: '19/02/2024',
            amount: '199,000đ',
            status: {
                text: 'Đang xử lý',
                class: 'admin_thongke-status-processing'
            }
        },
        {
            id: 'GD-787',
            customer: {
                initials: 'LH',
                name: 'Lê Hoàng C',
                email: 'lehoangc@example.com',
                avatarClass: 'admin_thongke-bg-info-soft'
            },
            product: 'Gói Pro',
            date: '19/02/2024',
            amount: '399,000đ',
            status: {
                text: 'Thất bại',
                class: 'admin_thongke-status-inactive'
            }
        },
        {
            id: 'GD-786',
            customer: {
                initials: 'PD',
                name: 'Phạm Đức D',
                email: 'phamducd@example.com',
                avatarClass: 'admin_thongke-bg-primary-soft'
            },
            product: 'Gói Premium',
            date: '18/02/2024',
            amount: '299,000đ',
            status: {
                text: 'Hoàn thành',
                class: 'admin_thongke-status-active'
            }
        },
        {
            id: 'GD-785',
            customer: {
                initials: 'VH',
                name: 'Vũ Hoàng E',
                email: 'vuhoange@example.com',
                avatarClass: 'admin_thongke-bg-success-soft'
            },
            product: 'Gói Cơ Bản',
            date: '18/02/2024',
            amount: '199,000đ',
            status: {
                text: 'Hoàn thành',
                class: 'admin_thongke-status-active'
            }
        },
        {
            id: 'GD-784',
            customer: {
                initials: 'NT',
                name: 'Ngô Thị F',
                email: 'ngothif@example.com',
                avatarClass: 'admin_thongke-bg-info-soft'
            },
            product: 'Gói Pro',
            date: '17/02/2024',
            amount: '399,000đ',
            status: {
                text: 'Đang xử lý',
                class: 'admin_thongke-status-processing'
            }
        },
        {
            id: 'GD-783',
            customer: {
                initials: 'DM',
                name: 'Đỗ Minh G',
                email: 'domingh@example.com',
                avatarClass: 'admin_thongke-bg-primary-soft'
            },
            product: 'Gói Premium',
            date: '17/02/2024',
            amount: '299,000đ',
            status: {
                text: 'Hoàn thành',
                class: 'admin_thongke-status-active'
            }
        },
        {
            id: 'GD-782',
            customer: {
                initials: 'TK',
                name: 'Trương Kim H',
                email: 'truongkimh@example.com',
                avatarClass: 'admin_thongke-bg-success-soft'
            },
            product: 'Gói Cơ Bản',
            date: '16/02/2024',
            amount: '199,000đ',
            status: {
                text: 'Thất bại',
                class: 'admin_thongke-status-inactive'
            }
        },
        {
            id: 'GD-781',
            customer: {
                initials: 'LV',
                name: 'Lý Văn I',
                email: 'lyvani@example.com',
                avatarClass: 'admin_thongke-bg-info-soft'
            },
            product: 'Gói Pro',
            date: '16/02/2024',
            amount: '399,000đ',
            status: {
                text: 'Hoàn thành',
                class: 'admin_thongke-status-active'
            }
        },
        {
            id: 'GD-780',
            customer: {
                initials: 'HT',
                name: 'Hoàng Thị K',
                email: 'hoangthik@example.com',
                avatarClass: 'admin_thongke-bg-primary-soft'
            },
            product: 'Gói Premium',
            date: '15/02/2024',
            amount: '299,000đ',
            status: {
                text: 'Đang xử lý',
                class: 'admin_thongke-status-processing'
            }
        },
        {
            id: 'GD-780',
            customer: {
                initials: 'HT',
                name: 'Hoàng Thị K',
                email: 'hoangthik@example.com',
                avatarClass: 'admin_thongke-bg-primary-soft'
            },
            product: 'Gói Premium',
            date: '15/02/2024',
            amount: '299,000đ',
            status: {
                text: 'Đang xử lý',
                class: 'admin_thongke-status-processing'
            }
        },
        {
            id: 'GD-780',
            customer: {
                initials: 'HT',
                name: 'Hoàng Thị K',
                email: 'hoangthik@example.com',
                avatarClass: 'admin_thongke-bg-primary-soft'
            },
            product: 'Gói Premium',
            date: '15/02/2024',
            amount: '299,000đ',
            status: {
                text: 'Đang xử lý',
                class: 'admin_thongke-status-processing'
            }
        }
    ];
    
    // Apply filters to transactions
    const getFilteredTransactions = () => {
        let filtered = [...transactions];
        
        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(transaction => {
                if (filters.status === 'active') return transaction.status.class === 'admin_thongke-status-active';
                if (filters.status === 'processing') return transaction.status.class === 'admin_thongke-status-processing';
                if (filters.status === 'inactive') return transaction.status.class === 'admin_thongke-status-inactive';
                return true;
            });
        }
        
        // Filter by search term (ID, customer name or email)
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(transaction => 
                transaction.id.toLowerCase().includes(term) || 
                transaction.customer.name.toLowerCase().includes(term) ||
                transaction.customer.email.toLowerCase().includes(term)
            );
        }
        
        // Filter by date range
        if (filters.dateRange !== 'all') {
            const today = new Date();
            const getDate = (dateStr) => {
                const [day, month, year] = dateStr.split('/').map(Number);
                return new Date(year, month - 1, day);
            };
            
            filtered = filtered.filter(transaction => {
                const transactionDate = getDate(transaction.date);
                
                if (filters.dateRange === 'today') {
                    return transactionDate.toDateString() === today.toDateString();
                }
                
                if (filters.dateRange === 'week') {
                    const oneWeekAgo = new Date(today);
                    oneWeekAgo.setDate(today.getDate() - 7);
                    return transactionDate >= oneWeekAgo;
                }
                
                if (filters.dateRange === 'month') {
                    const oneMonthAgo = new Date(today);
                    oneMonthAgo.setMonth(today.getMonth() - 1);
                    return transactionDate >= oneMonthAgo;
                }
                
                return true;
            });
        }
        
        return filtered;
    };
    
    // Toggle filter panel
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };
    
    // Update a single filter
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    // Reset all filters
    const resetFilters = () => {
        setFilters({
            status: 'all',
            searchTerm: '',
            dateRange: 'all'
        });
        setCurrentPage(1);
    };
    
    // Get transactions based on pagination (for mobile)
    const getCurrentTransactions = () => {
        const filteredTransactions = getFilteredTransactions();
        
        if (!isMobile) {
            return filteredTransactions; // On desktop, return all transactions
        }
        
        // On mobile, return paginated data
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    };
    
    // Change page handler
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Simulate loading when changing pages
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    };
    
    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Simulate loading when changing tabs
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 700);
    };
    
    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Simulate initial loading
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);
    
    // Calculate total pages based on filtered transactions
    const filteredTransactions = getFilteredTransactions();
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    
    // Current transactions to display
    const displayedTransactions = getCurrentTransactions();
    
    return(
        <div className="container-fluid admin_thongke-dashboard">
            <div className="admin_thongke-dashboard-header">
                <h4>Tổng quan hệ thống</h4>
                <div className="admin_thongke-chart-period-selector">
                    <button 
                        className={`admin_thongke-chart-period-btn ${activeTab === 'day' ? 'admin_thongke-chart-period-btn-active' : ''}`} 
                        onClick={() => handleTabChange('day')}
                    >
                        Hôm nay
                    </button>
                    <button 
                        className={`admin_thongke-chart-period-btn ${activeTab === 'week' ? 'admin_thongke-chart-period-btn-active' : ''}`} 
                        onClick={() => handleTabChange('week')}
                    >
                        Tuần này
                    </button>
                    <button 
                        className={`admin_thongke-chart-period-btn ${activeTab === 'month' ? 'admin_thongke-chart-period-btn-active' : ''}`} 
                        onClick={() => handleTabChange('month')}
                    >
                        Tháng này
                    </button>
                    <button 
                        className={`admin_thongke-chart-period-btn ${activeTab === 'year' ? 'admin_thongke-chart-period-btn-active' : ''}`} 
                        onClick={() => handleTabChange('year')}
                    >
                        Năm nay
                    </button>
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
                            <div className="admin_thongke-stat-value">1,234</div>
                            <div className="admin_thongke-stat-change admin_thongke-positive">
                                <i className="bi bi-arrow-up-right"></i>
                                <span>12.5% so với tuần trước</span>
                            </div>
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
                            <div className="admin_thongke-stat-value">45,678,000đ</div>
                            <div className="admin_thongke-stat-change admin_thongke-positive">
                                <i className="bi bi-arrow-up-right"></i>
                                <span>8.3% so với tuần trước</span>
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
                            <div className="admin_thongke-stat-value">567</div>
                            <div className="admin_thongke-stat-change admin_thongke-negative">
                                <i className="bi bi-arrow-down-right"></i>
                                <span>3.2% so với tuần trước</span>
                            </div>
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
                            <div className="admin_thongke-stat-value">890</div>
                            <div className="admin_thongke-stat-change admin_thongke-positive">
                                <i className="bi bi-arrow-up-right"></i>
                                <span>5.7% so với tuần trước</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="row mt-4">
                <div className="col-12">
                    <div className="admin_thongke-card admin_thongke-table-card">
                        <div className="admin_thongke-card-header">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5>Giao dịch gần đây</h5>
                                <div className="admin_thongke-card-actions">
                                    <button 
                                        className={`admin_thongke-btn admin_thongke-btn-outline me-2 ${showFilters ? 'admin_thongke-btn-active' : ''}`}
                                        onClick={toggleFilters}
                                    >
                                        <i className="bi bi-filter me-1"></i> Lọc
                                    </button>
                                    <button className="admin_thongke-btn admin_thongke-btn-outline">
                                        <i className="bi bi-download me-1"></i> Xuất
                                    </button>
                                </div>
                            </div>
                            
                            {/* Filter Panel */}
                            {showFilters && (
                                <div className="admin_thongke-filter-panel mt-3">
                                    <div className="row">
                                        <div className="col-md-4 mb-2">
                                            <div className="admin_thongke-filter-group">
                                                <label>Tìm kiếm</label>
                                                <input 
                                                    type="text" 
                                                    className="admin_thongke-filter-input" 
                                                    placeholder="Theo tên, email hoặc mã GD" 
                                                    value={filters.searchTerm}
                                                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3 mb-2">
                                            <div className="admin_thongke-filter-group">
                                                <label>Trạng thái</label>
                                                <select 
                                                    className="admin_thongke-filter-select"
                                                    value={filters.status}
                                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                                >
                                                    <option value="all">Tất cả</option>
                                                    <option value="active">Hoàn thành</option>
                                                    <option value="processing">Đang xử lý</option>
                                                    <option value="inactive">Thất bại</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-3 mb-2">
                                            <div className="admin_thongke-filter-group">
                                                <label>Thời gian</label>
                                                <select 
                                                    className="admin_thongke-filter-select"
                                                    value={filters.dateRange}
                                                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                                >
                                                    <option value="all">Tất cả</option>
                                                    <option value="today">Hôm nay</option>
                                                    <option value="week">7 ngày gần đây</option>
                                                    <option value="month">30 ngày gần đây</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-2 mb-2 d-flex align-items-end">
                                            <button 
                                                className="admin_thongke-btn admin_thongke-btn-outline w-100" 
                                                onClick={resetFilters}
                                            >
                                                <i className="bi bi-x-circle me-1"></i> Đặt lại
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="admin_thongke-card-body">
                            {isLoading ? (
                                <div className="admin_thongke-loading-container">
                                    <div className="admin_thongke-loading-spinner"></div>
                                    <p>Đang tải dữ liệu...</p>
                                </div>
                            ) : (
                                <div className="admin_thongke-product-list admin_thongke-scrollable-table">
                                    {filteredTransactions.length > 0 ? (
                                        <table className="admin_thongke-product-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '120px' }}>Mã giao dịch</th>
                                                    <th>Khách hàng</th>
                                                    <th>Sản phẩm</th>
                                                    <th>Ngày</th>
                                                    <th>Số tiền</th>
                                                    <th>Trạng thái</th>
                                                    <th style={{ width: '120px' }}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayedTransactions.map((transaction) => (
                                                    <tr key={transaction.id}>
                                                        <td data-label="Mã giao dịch">
                                                            <span className="admin_thongke-transaction-id">#{transaction.id}</span>
                                                        </td>
                                                        <td data-label="Khách hàng">
                                                            <div className="d-flex align-items-center">
                                                                <div className={`admin_thongke-avatar-circle ${transaction.customer.avatarClass} me-2`}>
                                                                    {transaction.customer.initials}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-medium">{transaction.customer.name}</div>
                                                                    <small className="text-muted">{transaction.customer.email}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td data-label="Sản phẩm">{transaction.product}</td>
                                                        <td data-label="Ngày">{transaction.date}</td>
                                                        <td data-label="Số tiền" style={{ fontWeight: '500', color: 'var(--admin_thongke-text)' }}>
                                                            {transaction.amount}
                                                        </td>
                                                        <td data-label="Trạng thái">
                                                            <span className={`admin_thongke-product-status ${transaction.status.class}`}>
                                                                {transaction.status.text}
                                                            </span>
                                                        </td>
                                                        <td data-label="Thao tác">
                                                            <div className="admin_thongke-product-actions-col">
                                                                <button className="admin_thongke-action-btn admin_thongke-icon-larger" title="Xem chi tiết">
                                                                    <i className="bi bi-eye" style={{ color: '#5ac8fa' }}></i>
                                                                </button>
                                                                <button className="admin_thongke-action-btn admin_thongke-icon-larger" title="In">
                                                                    <i className="bi bi-printer" style={{ color: '#0071e3' }}></i>
                                                                </button>
                                                                <button className="admin_thongke-action-btn admin_thongke-delete-btn admin_thongke-icon-larger" title="Xóa">
                                                                    <i className="bi bi-trash" style={{ color: '#ff3b30' }}></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="admin_thongke-no-results">
                                            <i className="bi bi-search mb-2" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                                            <p>Không tìm thấy giao dịch nào phù hợp với bộ lọc</p>
                                            <button 
                                                className="admin_thongke-btn admin_thongke-btn-outline admin_thongke-btn-sm" 
                                                onClick={resetFilters}
                                            >
                                                Đặt lại bộ lọc
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Pagination for mobile only */}
                            {isMobile && !isLoading && (
                                <div className="admin_thongke-pagination">
                                    <div className="admin_thongke-pagination-info">
                                        {filteredTransactions.length > 0 ? (
                                            <>Hiển thị {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)} trong tổng số {filteredTransactions.length} giao dịch</>
                                        ) : (
                                            <>Không có giao dịch nào phù hợp với bộ lọc</>
                                        )}
                                    </div>
                                    
                                    {filteredTransactions.length > itemsPerPage && (
                                        <div className="admin_thongke-pagination-controls">
                                            <button 
                                                className={`admin_thongke-page-btn ${currentPage === 1 ? 'admin_thongke-page-btn-disabled' : ''}`}
                                                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                aria-label="Trang trước"
                                            >
                                                <i className="bi bi-chevron-left" style={{ color: currentPage === 1 ? '#8e8e93' : '#0071e3' }}></i>
                                            </button>
                                            
                                            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                                // Show pages around current page
                                                let pageToShow;
                                                if (totalPages <= 3) {
                                                    pageToShow = i + 1;
                                                } else if (currentPage <= 2) {
                                                    pageToShow = i + 1;
                                                } else if (currentPage >= totalPages - 1) {
                                                    pageToShow = totalPages - 2 + i;
                                                } else {
                                                    pageToShow = currentPage - 1 + i;
                                                }
                                                
                                                return (
                                                    <button 
                                                        key={pageToShow}
                                                        className={`admin_thongke-page-btn ${currentPage === pageToShow ? 'admin_thongke-page-btn-active' : ''}`}
                                                        onClick={() => handlePageChange(pageToShow)}
                                                        aria-label={`Trang ${pageToShow}`}
                                                    >
                                                        {pageToShow}
                                                    </button>
                                                );
                                            })}
                                            
                                            <button 
                                                className={`admin_thongke-page-btn ${currentPage === totalPages ? 'admin_thongke-page-btn-disabled' : ''}`}
                                                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                aria-label="Trang sau"
                                            >
                                                <i className="bi bi-chevron-right" style={{ color: currentPage === totalPages ? '#8e8e93' : '#0071e3' }}></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Show full list information only on desktop */}
                            {!isMobile && !isLoading && (
                                <div className="admin_thongke-pagination">
                                    <div className="admin_thongke-pagination-info">
                                        {filteredTransactions.length > 0 ? (
                                            <>Hiển thị tất cả {filteredTransactions.length} giao dịch</>
                                        ) : (
                                            <>Không có giao dịch nào phù hợp với bộ lọc</>
                                        )}
                                    </div>
                                    
                                    {Object.values(filters).some(val => val !== 'all' && val !== '') && (
                                        <button 
                                            className="admin_thongke-btn admin_thongke-btn-outline admin_thongke-btn-sm" 
                                            onClick={resetFilters}
                                        >
                                            <i className="bi bi-x-circle me-1"></i> Xóa bộ lọc
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chart;