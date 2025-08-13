/* eslint-disable react-hooks/exhaustive-deps */
import { Link, useSearchParams } from "react-router-dom";
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
  limit,
  showPagination = true,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { news, loading, meta } = useSelector((state) => state.blog);
  const perPage = meta?.per_page || 10;
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageParam);
  const totalPages =
    meta?.last_page || Math.ceil((news?.length || 0) / perPage);
  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(1);
  }, [news, totalPages]);

  useEffect(() => {
    setSearchParams((params) => {
      params.set("page", currentPage);
      return params;
    });
  }, [currentPage, setSearchParams]);

  useEffect(() => {
    if (currentPage !== pageParam) setCurrentPage(pageParam);
  }, [pageParam]);

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
        <div className="container">
          {showHeader && (
            <div className="row">
              <div className="section-header d-flex align-items-center justify-content-between mt-5 ">
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
