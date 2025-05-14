import React, { useState } from 'react';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/account.css';
import { Link } from 'react-router-dom';
const AccountsList = () => {
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for accounts
  const accounts = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      email: "nguyenvana@example.com",
      phone: "0912345678",
      role: "Khách hàng",
      status: "Hoạt động",
      lastLogin: "15/07/2023"
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      email: "tranthib@example.com",
      phone: "0987654321",
      role: "Khách hàng",
      status: "Hoạt động",
      lastLogin: "20/07/2023"
    },
    {
      id: 3,
      name: "Lê Văn C",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      email: "levanc@example.com",
      phone: "0898765432",
      role: "Nhân viên",
      status: "Hoạt động",
      lastLogin: "18/07/2023"
    },
    {
      id: 4,
      name: "Phạm Thị D",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg",
      email: "phamthid@example.com",
      phone: "0923456789",
      role: "Quản trị viên",
      status: "Hoạt động",
      lastLogin: "22/07/2023"
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      avatar: "https://randomuser.me/api/portraits/men/78.jpg",
      email: "hoangvane@example.com",
      phone: "0934567890",
      role: "Khách hàng",
      status: "Bị khóa",
      lastLogin: "10/06/2023"
    },
    {
      id: 6,
      name: "Lý Thị F",
      avatar: "https://randomuser.me/api/portraits/women/90.jpg",
      email: "lythif@example.com",
      phone: "0945678901",
      role: "Khách hàng",
      status: "Bị khóa",
      lastLogin: "05/05/2023"
    }
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAccounts(accounts.map(account => account.id));
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleSelectAccount = (accountId) => {
    if (selectedAccounts.includes(accountId)) {
      setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
    } else {
      setSelectedAccounts([...selectedAccounts, accountId]);
    }
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const filteredAccounts = accounts.filter(account => {
    // Apply search filter
    if (searchTerm && !account.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !account.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !account.phone.includes(searchTerm)) {
      return false;
    }
    
    // Apply role filter
    if (filterRole && account.role !== filterRole) {
      return false;
    }
    
    // Apply status filter
    if (filterStatus && account.status !== filterStatus) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="admin_account-container">
      {/* Header Section */}
      <div className="admin_account-header">
        <div className="admin_account-title">
          <h1>Tài khoản</h1>
          <p className="text-muted">Quản lý danh sách tài khoản người dùng</p>
        </div>
        <div className="admin_account-actions">
          <Link 
            to="/admin/accounts/add" 
            className="admin_account-btn admin_account-btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 113, 227, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <i 
              className="bi bi-person-plus" 
              style={{ 
                color: '#ffffff', 
                fontSize: '1rem'
              }}
            ></i>
            <span style={{ fontWeight: '500' }}>Thêm tài khoản</span>
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <div className="admin_account-top-row">
        <div className="admin_account-search-box">
          <i className="bi bi-search admin_account-search-icon" style={{ color: '#0071e3' }}></i>
          <input
            type="text"
            className="admin_account-search-input"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin_account-filters">
          <button 
            className="admin_account-btn admin_account-btn-outline" 
            onClick={handleFilterToggle}
          >
            <i className="bi bi-funnel" style={{ color: '#5ac8fa' }}></i> Bộ lọc
          </button>
          <button className="admin_account-btn admin_account-btn-outline">
            <i className="bi bi-sort-down" style={{ color: '#5ac8fa' }}></i> Sắp xếp
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="admin_account-filter-panel">
          <div className="admin_account-filter-row">
            <div className="admin_account-filter-column">
              <div className="admin_account-filter-group">
                <label className="admin_account-filter-label">Vai trò</label>
                <select 
                  className="admin_account-filter-select" 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="Khách hàng">Khách hàng</option>
                  <option value="Nhân viên">Nhân viên</option>
                  <option value="Quản trị viên">Quản trị viên</option>
                </select>
              </div>
            </div>
            <div className="admin_account-filter-column">
              <div className="admin_account-filter-group">
                <label className="admin_account-filter-label">Trạng thái</label>
                <select 
                  className="admin_account-filter-select" 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Bị khóa">Bị khóa</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Actions */}
      {selectedAccounts.length > 0 && (
        <div className="admin_account-bulk-actions">
          <div className="admin_account-bulk-actions-info">{selectedAccounts.length} tài khoản đã chọn</div>
          <div className="admin_account-bulk-actions-buttons">
            <button className="admin_account-btn admin_account-btn-outline">
              <i className="bi bi-envelope" style={{ color: '#5ac8fa' }}></i> Gửi email
            </button>
            <button className="admin_account-btn admin_account-btn-danger">
              <i className="bi bi-lock" style={{ color: '#ffffff' }}></i> Khóa tài khoản
            </button>
          </div>
        </div>
      )}

      <div className="admin_account-list">
        <table className="admin_account-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}>
                <input
                  type="checkbox"
                  className="admin_account-checkbox"
                  onChange={handleSelectAll}
                  checked={selectedAccounts.length === accounts.length}
                />
              </th>
              <th style={{ width: '40px' }}></th>
              <th style={{ width: '15%' }}>Tên người dùng</th>
              <th style={{ width: '20%' }}>Email</th>
              <th className="admin_account-hide-sm" style={{ width: '12%' }}>Số điện thoại</th>
              <th style={{ width: '12%' }}>Vai trò</th>
              <th style={{ width: '12%' }}>Trạng thái</th>
              <th className="admin_account-hide-sm" style={{ width: '12%' }}>Đăng nhập gần nhất</th>
              <th style={{ width: '100px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map(account => (
              <tr key={account.id} className={selectedAccounts.includes(account.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    className="admin_account-checkbox"
                    checked={selectedAccounts.includes(account.id)}
                    onChange={() => handleSelectAccount(account.id)}
                  />
                </td>
                <td>
                  <div className="admin_account-avatar">
                    <img src={account.avatar} alt={account.name} />
                  </div>
                </td>
                <td>
                  <div className="admin_account-name">{account.name}</div>
                </td>
                <td className="admin_account-email" style={{ wordBreak: 'break-word' }}>{account.email}</td>
                <td className="admin_account-hide-sm">{account.phone}</td>
                <td>
                  <span className={`admin_account-role admin_account-role-${account.role === 'Quản trị viên' ? 'admin' : account.role === 'Nhân viên' ? 'staff' : 'customer'}`}>
                    {account.role}
                  </span>
                </td>
                <td>
                  <span className={`admin_account-status ${account.status === 'Hoạt động' ? 'admin_account-status-active' : 'admin_account-status-locked'}`}>
                    {account.status}
                  </span>
                </td>
                <td className="admin_account-hide-sm">{account.lastLogin}</td>
                <td>
                  <div className="admin_account-actions-col">
                    <button className="admin_account-action-btn admin_account-edit-btn" title="Sửa">
                      <i className="bi bi-pencil" style={{ color: '#0071e3' }}></i>
                    </button>
                    <button className="admin_account-action-btn" title="Xem chi tiết">
                      <i className="bi bi-eye" style={{ color: '#5ac8fa' }}></i>
                    </button>
                    <button className="admin_account-action-btn admin_account-delete-btn" title="Khóa tài khoản">
                      <i className="bi bi-lock" style={{ color: '#ff3b30' }}></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="admin_account-pagination">
        <div className="admin_account-pagination-info">
          Hiển thị 1-6 trong tổng số 6 tài khoản
        </div>
        <div className="admin_account-pagination-controls">
          <button className="admin_account-page-btn admin_account-page-btn-disabled">
            <i className="bi bi-chevron-left" style={{ color: '#8e8e93' }}></i>
          </button>
          <button className="admin_account-page-btn admin_account-page-btn-active">1</button>
          <button className="admin_account-page-btn admin_account-page-btn-disabled">
            <i className="bi bi-chevron-right" style={{ color: '#8e8e93' }}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsList; 