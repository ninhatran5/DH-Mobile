import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../../slices/adminuserSlice";
import "../../assets/admin/DetailAcccount.css";
import defaultAvatar from "../../assets/images/adminacccount.jpg";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { users, loading, error } = useSelector((state) => state.adminuser);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    } else {
      const foundUser = users.find((u) => u.user_id?.toString() === id);
      if (foundUser) {
        setUser(foundUser);
      } else {
        navigate("/admin/accounts");
      }
    }
  }, [users, id, dispatch, navigate]);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;
  if (!user) return null;

  return (
    <div className="admin-edit-account-container">
      <div className="titledeitail">
         <h2 className="admin-edit-account-title">Chi tiết người dùng</h2>
     <div className="admin-edit-account-form-buttons">
          <button
            type="button"
            className="admin-edit-account-btn-cancel" style={{ float:"right"}}
            onClick={() => navigate("/admin/accounts")}
          >
            Quay lại
          </button>
        </div>
      </div>
     
      <div className="user-detail-wrapper">
        {/* Avatar + Thông tin cá nhân */}
        <div className="user-detail-section user-detail-flex">
          <div className="user-detail-avatar">
            <img
              src={user.image_url || defaultAvatar}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
              alt="Avatar"
            />
          </div>
          
          <div className="user-detail-info">
            <div className="user-detail-section-title">Thông tin cá nhân</div>
            <div className="user-detail-info-grid">
              <div className="user-detail-info-item">
                <label>Họ tên:  {user.full_name} </label>
            
              </div>
              <div className="user-detail-info-item">
                <label>Tên tài khoản: {user.username}</label>
              
              </div>
              <div className="user-detail-info-item">
                <label>Email: {user.email}</label>
           
              </div>
              <div className="user-detail-info-item">
                <label>Số điện thoại: {user.phone || "Chưa cập nhật"}</label>
           
              </div>
              <div className="user-detail-info-item">
                <label>Vai trò: {user.role}</label>
           
              </div>
            </div>
          </div>
        </div>

        {/* Địa chỉ */}
       <div className="user-detail-section">
  <div className="user-detail-section-title">Địa chỉ</div>
  <div className="user-detail-info-grid">
    <div className="user-detail-info-item">
      <label>Thành phố: {user.city || "Chưa cập nhật"}</label>
    </div>
    <div className="user-detail-info-item">
      <label>Quận: {user.district || "Chưa cập nhật"}</label>
    </div>
    <div className="user-detail-info-item">
      <label>Phường: {user.ward || "Chưa cập nhật"}</label>
    </div>
    <div className="user-detail-info-item">
      <label>Địa chỉ cụ thể: {user.address || "Chưa cập nhật"}</label>
    </div>
  </div>
</div>


       
      </div>
    </div>
  );
};

export default UserDetail;
