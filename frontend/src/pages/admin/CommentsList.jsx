import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNews } from "../../slices/newsSlice";
import { Link } from "react-router-dom";

const CommentsList = () => {
  const dispatch = useDispatch();
  const { newsList, loading, error } = useSelector((state) => state.adminNews);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  if (loading) return <p className="text-center py-4">Đang tải danh sách tin tức...</p>;
  if (error) return <p className="text-red-500 text-center py-4">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Tin tức</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          + Thêm tin tức mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsList && newsList.map((news) => (
          <div key={news._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {news.image_url && (
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {news.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {news.description || news.content}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img
                    src={news.user?.image_url || "https://via.placeholder.com/40"}
                    alt={news.user?.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {news.user?.full_name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(news.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  news.status === "published" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {news.status === "published" ? "Đã đăng" : "Chưa đăng"}
                </span>
              </div>

              <div className="flex gap-2">
                <Link 
                  to={`/admin/news/${news._id}`}
                  className="flex-1 bg-blue-50 text-blue-600 text-center py-2 rounded hover:bg-blue-100"
                >
                  Chi tiết
                </Link>
                <button className="flex-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100">
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {newsList && newsList.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có tin tức nào</p>
        </div>
      )}
    </div>
  );
};

export default CommentsList;
