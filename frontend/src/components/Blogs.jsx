import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import News from "./News";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchBlogs } from "../slices/blogSlice";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";

export default function Blogs({
  showHeader = true,
  padding,
  limit = 3,
  showPagination = true,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { news, loading } = useSelector((state) => state.blog);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = limit;
  const totalPages = Math.ceil((news?.length || 0) / newsPerPage);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [news]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const paginatedNews = news
    ? news.slice((currentPage - 1) * newsPerPage, currentPage * newsPerPage)
    : [];

  return (
    <>
      {loading && <Loading />}
      <section id="latest-blog" className={padding}>
        <div className="container-fluid">
          {showHeader && (
            <div className="row">
              <div className="section-header d-flex align-items-center justify-content-between mt-5">
                <h2 className="section-title">{t("home.blog")}</h2>
                <div className="btn-wrap align-right">
                  <Link to={"/blogs"} className="btn-link text-decoration-none">
                    {t("home.seeAll")}
                  </Link>
                </div>
              </div>
            </div>
          )}
          <div className="row">
            {paginatedNews.map((item) => (
              <News key={item.news_id} item={item} />
            ))}
          </div>
          {showPagination && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </section>
    </>
  );
}
