import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import News from "./News";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchBlogs } from "../slices/blogSlice";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import { perPage } from "../../utils/consts";

export default function Blogs({
  showHeader = true,
  padding,
  limit,
  showPagination = true,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { news, loading } = useSelector((state) => state.blog);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil((news?.length || 0) / perPage);

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
    ? news.slice((currentPage - 1) * perPage, currentPage * perPage)
    : [];

  return (
    <>
      {loading && <Loading />}
      <section id="latest-blog" className={padding}>
        <div className="container-fluid">
          {showHeader && (
            <div className="row">
              <div className="section-header d-flex align-items-center justify-content-between mt-5">
                <h3 className="section-title">{t("home.blog")}</h3>
                <div className="btn-wrap align-right">
                  <Link to={"/blogs"} className="btn-link text-decoration-none">
                    {t("home.seeAll")}
                  </Link>
                </div>
              </div>
            </div>
          )}
          <div className="row">
            {(limit ? paginatedNews.slice(0, limit) : paginatedNews).map(
              (item) => (
                <News key={item.news_id} item={item} />
              )
            )}
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
