import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "../../slices/BannerSlice";
import "../../assets/admin/banner.css";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import dayjs from "dayjs";

const ListBanner = () => {
  const dispatch = useDispatch();
  const banners = useSelector((state) => state.banner.banners || []);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="adminbanner-container">
      <div className="adminbanner-header">
        <h2 className="adminbanner-title">Danh sách Banner</h2>
        <div className="adminbanner-toolbar">
          <input
            type="text"
            placeholder="Tìm kiếm banner..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="adminbanner-search-input"
          />
        </div>
      </div>

      <div className="adminbanner-table-container">
        <table className="adminbanner-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tiêu banner </th>
              <th>Liên kết</th>
              <th>Ngày tạo</th>
              <th>Ngày cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.map((banner, index) => (
              <tr key={banner.banner_id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="adminbanner-img"
                  />
                </td>
                <td>
                  <div className="adminbanner-banner-title">
                    {banner.title
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </div>
                </td>
                <td>{banner.link_url || "Không có"}</td>
                <td>{dayjs(banner.created_at).format("HH:mm - DD/MM/YYYY")}</td>
                <td>{dayjs(banner.updated_at).format("HH:mm - DD/MM/YYYY")}</td>
                <td>
                  <Link
                    to={`/admin/editbanner/${banner.banner_id}`}
                    className="adminbanner-action-btn edit"
                  >
                    <FaEdit style={{ fontSize: 15 }} />
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
