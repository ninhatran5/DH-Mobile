import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "../../slices/BannerSlice";
import '../../assets/admin/banner.css';
import { Link } from "react-router-dom";
const ListBanner = () => {
  const dispatch = useDispatch();
  const banners = useSelector((state) => state.banner.banners || []);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const handleEdit = (banner) => {
    console.log("Edit banner:", banner);
  };

  return (
    <div className="adminbanner-container">
      <div className="adminbanner-header">
        <div className="adminbanner-title">
          <h1>Danh sách Banner</h1>
          <p>Quản lý tất cả các banner quảng cáo trên hệ thống</p>
        </div>
      </div>

      <div className="adminbanner-table-container">
       <table className="adminbanner-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Hình ảnh</th>
      <th>Tiêu đề</th>
      <th>Liên kết</th>
      <th>Trạng thái</th>
      <th>Ngày tạo</th>
      <th>Ngày cập nhật</th>
      <th>Thao tác</th>
    </tr>
  </thead>
  <tbody>
    {banners.map((banner) => (
      <tr key={banner.banner_id}>
        <td>{banner.banner_id}</td>
        <td>
          <div className="adminbanner-thumbnail">
            <img src={banner.image_url} alt={banner.title} />
          </div>
        </td>
        <td>
          <div className="adminbanner-banner-title">
            <span>{banner.title}</span>
            <div className="adminbanner-banner-url">
              {banner.link_url || "Không có link"}
            </div>
          </div>
        </td>
        <td>
          {banner.link_url ? (
            <a
              href={banner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="adminbanner-link"
            >
              {banner.link_url}
            </a>
          ) : (
            "Không có"
          )}
        </td>
        <td>
          <span
            className={`adminbanner-badge ${
              banner.is_active
                ? "adminbanner-badge-success"
                : "adminbanner-badge-secondary"
            }`}
          >
            {banner.is_active ? "Hoạt động" : "Không hoạt động"}
          </span>
        </td>
        <td>{new Date(banner.created_at).toLocaleString("vi-VN")}</td>
        <td>{new Date(banner.updated_at).toLocaleString("vi-VN")}</td>
        <td className="adminbanner-actions-cell">
          <Link
            to={`/admin/editbanner/${banner.banner_id}`}
            className="adminbanner-btn adminbanner-btn-icon adminbanner-btn-edit"
            title="Chỉnh sửa"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4 21h17v-2H4v2zm14.71-11.29l-2.83-2.83a1 1 0 00-1.42 0l-8.46 8.46a1 1 0 00-.26.46l-1 4a1 1 0 001.21 1.21l4-1a1 1 0 00.46-.26l8.46-8.46a1 1 0 000-1.42zM7.71 17.29l-.58.15.15-.58 7.44-7.44.43.43-7.44 7.44zM17 8.41l-.41-.41.71-.71.41.41-.71.71z" />
            </svg>
          </Link>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      </div>
    </div>
  );
};

export default ListBanner;
