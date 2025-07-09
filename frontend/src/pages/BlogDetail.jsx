import { BiSolidQuoteAltLeft } from "react-icons/bi";
import "../assets/css/blogDetail.css";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Loading from "../components/Loading";
import dayjs from "dayjs";
import { fetchBlogDetail } from "../slices/blogDetailSlice";
import { fetchBlogs } from "../slices/blogSlice";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BlogDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { blogDetails, loading } = useSelector((state) => state.blogDetail);
  const { news } = useSelector((state) => state.blog);

  // Tìm blog trước và sau
  const currentIndex = news.findIndex(blog => blog.news_id === parseInt(id));
  const previousBlog = currentIndex > 0 ? news[currentIndex - 1] : null;
  const nextBlog = currentIndex < news.length - 1 ? news[currentIndex + 1] : null;

  useEffect(() => {
    dispatch(fetchBlogDetail(id));
    dispatch(fetchBlogs());
  }, [id, dispatch]);
  return (
    <>
      {loading && <Loading />}
      <section className="blog-hero spad">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-lg-9 text-center">
              <div className="blog__hero__text">
                <h2>{blogDetails?.title}</h2>
                <ul>
                  <li>
                    <span className="me-1">{t("blog.date")}</span>
                    {dayjs(blogDetails?.create).format("DD/MM/YYYY")}
                  </li>
                  <li>
                    <span className="me-1">{t("blog.update")}</span>
                    {dayjs(blogDetails?.updated_at).format("DD/MM/YYYY")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-details spad">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-lg-12">
              <div className="blog__details__pic">
                <img src={blogDetails?.image_url} alt={blogDetails?.title} />
              </div>
            </div>
            <div className="col-lg-8">
              <div className="blog__details__content">
                <div
                  className="blog__details__text"
                  dangerouslySetInnerHTML={{
                    __html: blogDetails?.content || "",
                  }}
                ></div>
                <div className="blog__details__option">
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-6">
                      <div
                        className="blog__details__author"
                        style={{ display: "flex", alignItems: "end" }}
                      >
                        <div className="blog__details__author__pic">
                          <img
                            src={blogDetails?.user?.image_url}
                            alt={"Avatar"}
                          />
                        </div>
                        <div className="blog__details__author__text">
                          <h5>{blogDetails?.user?.full_name}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="blog__details__btns">
                  <div className="row">
                    {previousBlog && (
                      <div className={nextBlog ? "col-lg-6 col-md-6 col-sm-6" : "col-lg-12 col-md-12 col-sm-12"}>
                        <a
                          style={{ textDecoration: "none" }}
                          className="blog__details__btns__item"
                          onClick={() => navigate(`/blog-detail/${previousBlog.news_id}`)}
                        >
                          <p style={{ cursor: "pointer" }}>
                            <span className="arrow_left">
                              <GrFormPreviousLink style={{ marginBottom: 9 }} />
                            </span>
                            {t("blog.previous")}
                          </p>
                          <h5 style={{ 
                            cursor: "pointer",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%"
                          }}>
                            {previousBlog.title}
                          </h5>
                        </a>
                      </div>
                    )}
                    {nextBlog && (
                      <div className={previousBlog ? "col-lg-6 col-md-6 col-sm-6" : "col-lg-12 col-md-12 col-sm-12"}>
                        <a
                          style={{ textDecoration: "none" }}
                          className="blog__details__btns__item blog__details__btns__item--next"
                          onClick={() => navigate(`/blog-detail/${nextBlog.news_id}`)}
                        >
                          <p style={{ cursor: "pointer" }}>
                            {t("blog.next")}
                            <span className="arrow_right">
                              <GrFormNextLink style={{ marginBottom: 11 }} />
                            </span>
                          </p>
                          <h5 style={{ 
                            cursor: "pointer",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%"
                          }}>
                            {nextBlog.title}
                          </h5>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default BlogDetail;
