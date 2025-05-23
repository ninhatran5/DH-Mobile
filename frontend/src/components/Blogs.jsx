import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import News from "./News";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchBlogs } from "../slices/blogSlice";
import Loading from "../components/Loading";
export default function Blogs({ showHeader = true, padding, limit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { news, loading } = useSelector((state) => state.blog);
  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

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
            {(limit ? news.slice(0, limit) : news).map((item) => (
              <News key={item.news_id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
