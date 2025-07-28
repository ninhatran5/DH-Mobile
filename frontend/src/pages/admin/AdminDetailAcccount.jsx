import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserById } from "../../slices/adminuserSlice";
import {
  FaArrowLeft,
  FaUser,
  FaUserTie,
  FaStar,
  FaCoins,
  FaEnvelope,
  FaPhone,
  FaAddressBook,
  FaUserCog,
  FaMapMarkerAlt,
  FaHome,
  FaLocationArrow,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./AdminDetailAcccount.css";

const ProfileAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { selectedUser, loading, error } = useSelector(
    (state) => state.adminuser
  );

  useEffect(() => {
    if (id) dispatch(fetchUserById(id));
  }, [dispatch, id]);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      alert("Không thể quay lại trang trước!");
    }
  };

  if (loading)
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải thông tin...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12 text-red-600">
        <FaExclamationTriangle className="text-4xl mb-4 mx-auto" />
        <p>Lỗi: {error}</p>
      </div>
    );

  if (!selectedUser)
    return (
      <div className="text-center py-12 text-gray-600">
        Không tìm thấy người dùng.
      </div>
    );

  const {
    image_url,
    username,
    full_name,
    email,
    phone,
    address,
    ward,
    district,
    city,
    role,
    tier_id,
    loyalty_points,
    created_at,
    updated_at,
  } = selectedUser;

  return (
    <div className="container">
      <button onClick={goBack} className="back-button">
        <FaArrowLeft className="icon-detailacccount" style={{ color: '#007bff' }} />
        Quay lại
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-header-overlay"></div>
        </div>

        <div className="profile-content">
          <div className="avatar-detailacccount">
            <img
              src={image_url}
              alt="Ảnh đại diện"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
            <div className="avatar-placeholder">
              <FaUser className="icon-detailacccount" style={{ color: '#6c757d' }} />
            </div>
          </div>

          <h1 className="profile-name">{full_name || "Không rõ tên"}</h1>
          <div className="profile-info">
            <p>@{username}</p>
            <span className="role">
              <FaUserTie className="icon-detailacccount" style={{ color: '#17a2b8' }} />
              {role}
            </span>
            <span className="tier">
              <FaStar className="icon-detailacccount" style={{ color: '#ffc107' }} />
              Hạng {tier_id}
            </span>
            <span className="points">
              <FaCoins className="icon-detailacccount" style={{ color: '#28a745' }} />
              {loyalty_points} điểm
            </span>
          </div>

          <div className="tongthe11">
            <div className="section">
              <h3 className="section-title">
               <span> <FaAddressBook className="icon-detailacccount" style={{ color: '#6c757d' }} /> Thông tin liên hệ</span>
              </h3>
              <div className="section-content">
                <div className="item">
                  <FaEnvelope className="icon-detailacccount" style={{ color: '#007bff', fontWeight: 'bold' }} /> Thư điện tử
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#000' }}>Email: {email}</p>
                  </div>
                </div>
                <div className="item">
                  <FaPhone className="icon-detailacccount" style={{ color: '#007bff', fontWeight: 'bold' }} /> Số điện thoại
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#000' }}>Số điện thoại: {phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="section">
              <h3 className="section-title">
               <span> <FaUserCog className="icon-detailacccount" style={{ color: '#17a2b8', fontWeight: 'bold' }} />
                Chi tiết tài khoản</span>
              </h3>
              <div className="section-content">
                <div className="item">
                  <span className="role" style={{ fontWeight: 'bold' }}>Vai trò: {role}</span>
                </div>
                <div className="item">
                  <span className="tier" style={{ fontWeight: 'bold' }}>Hạng thành viên: Hạng {tier_id}</span>
                </div>
                <div className="item">
                  <span style={{ fontWeight: 'bold' }}>Điểm tích lũy: {loyalty_points} điểm</span>
                </div>
              </div>
            </div>
          </div>
          
          <br />
          <div className="section">
            <h3 className="section-title">
            <span>  <FaMapMarkerAlt className="icon-detailacccount" style={{ color: '#dc3545' }} />
              Thông tin địa chỉ</span>
            </h3>
            <div className="section-content">
              <div className="item">
                <span>
                  <FaHome className="icon-detailacccount" style={{ color: '#6c757d' }} />
                  Địa chỉ nhà
                </span>
                <p style={{ fontWeight: 'bold', color: '#000' }}>{address}</p>
              </div>

              <div className="item">
                <FaLocationArrow className="icon-detailacccount" style={{ color: '#28a745' }} /> Vị trí
                <div>
                  <p style={{ fontWeight: 'bold', color: '#000' }}>Xã/Phường: {ward}</p>
                  <p style={{ fontWeight: 'bold', color: '#000' }}>Huyện/Quận: {district}</p>
                  <p style={{ fontWeight: 'bold', color: '#000' }}>Tỉnh/Thành phố: {city}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="section timeline">
            <h3 className="section-title">
              <span><FaClock className="icon-detailacccount" style={{ color: '#ffc107' }} />
              Lịch sử hoạt động</span>
            </h3>
            <div className="event">
              <div className="dot"></div>
              <div className="content">
                <p>Tài khoản được tạo</p>
                <p className="date" style={{ fontWeight: 'bold', color: '#000' }}>
                  {new Date(created_at).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="event">
              <div className="dot"></div>
              <div className="content">
                <p>Cập nhật gần nhất</p>
                <p className="date" style={{ fontWeight: 'bold', color: '#000' }}>
                  {new Date(updated_at).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;
