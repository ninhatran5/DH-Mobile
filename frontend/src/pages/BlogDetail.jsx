import { BiSolidQuoteAltLeft } from "react-icons/bi";
import "../assets/css/blogDetail.css";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Loading from "../components/Loading";
import dayjs from "dayjs";
import { fetchBlogDetail } from "../slices/blogDetailSlice";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BlogDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { blogDetails, loading } = useSelector((state) => state.blogDetail);

  useEffect(() => {
    dispatch(fetchBlogDetail(id));
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
                {/* <div className="blog__details__quote">
                  <i>
                    <BiSolidQuoteAltLeft style={{ fontSize: 22 }} />
                  </i>
                  <p>
                    “When designing an advertisement for a particular product
                    many things should be researched like where it should be
                    displayed.”
                  </p>
                  <h6>_ John Smith _</h6>
                </div> */}

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
                    <div className="col-lg-6 col-md-6 col-sm-6">
                      <a
                        style={{ textDecoration: "none" }}
                        className="blog__details__btns__item"
                      >
                        <p style={{ cursor: "pointer" }}>
                          <span className="arrow_left">
                            <GrFormPreviousLink style={{ marginBottom: 9 }} />
                          </span>
                          Trước đó
                        </p>
                        <h5 style={{ cursor: "pointer" }}>
                          It S Classified How To Utilize Free Classified Ad
                          Sites
                        </h5>
                      </a>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6">
                      <a
                        style={{ textDecoration: "none" }}
                        className="blog__details__btns__item blog__details__btns__item--next"
                      >
                        <p style={{ cursor: "pointer" }}>
                          Tiếp theo
                          <span className="arrow_right">
                            <GrFormNextLink style={{ marginBottom: 11 }} />
                          </span>
                        </p>
                        <h5 style={{ cursor: "pointer" }}>
                          Tips For Choosing The Perfect Gloss For Your Lips
                        </h5>
                      </a>
                    </div>
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
