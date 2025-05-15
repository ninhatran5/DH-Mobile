import { Link } from "react-router-dom";
import blogsImage1 from "../assets/images/post-thumb-1.jpg";
import { useTranslation } from "react-i18next";

export default function Blogs({ showHeader = true, padding }) {
  const { t } = useTranslation();

  const blogsItem = [
    {
      id: 1,
      title: "Tất tần tật giá bán iPhone 16 Series chính hãng VN/A",
      des: `Tại sự kiện "Glowtime" vừa diễn ra, Apple đã giới thiệu
            đến công chúng dòng iPhone 16 Series. Năm nay, iPhone 16
            sẽ bao gồm các phiên bản iPhone 16, iPhone 16 Plus,
            iPhone...  `,
      image: blogsImage1,
      date: "22/4/2021",
      author: "Nguyễn Văn A",
    },
    {
      id: 2,
      title: "Tin tức mới nhất về iPhone 16",
      des: `Apple đã công bố ngày ra mắt cho iPhone 16 và nhiều thông tin khác.`,
      image: blogsImage1,
      date: "23/4/2021",
      author: "Trần Thị B",
    },
    {
      id: 3,
      title: "So sánh iPhone 16 và iPhone 15",
      des: `Năm nay, Apple mang đến nhiều cải tiến cho dòng iPhone mới.`,
      image: blogsImage1,
      date: "24/4/2021",
      author: "Lê Văn C",
    },
  ];

  return (
    <>
      <section id="latest-blog" className={padding}>
        <div className="container-fluid">
          {showHeader && (
            <div className="row">
              <div className="section-header d-flex align-items-center justify-content-between my-5">
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
            {blogsItem.map((item) => (
              <div className="card-products col-md-4" key={item.id}>
                <article className="post-item card border-0 shadow-sm d-flex flex-column">
                  <div className="image-holder zoom-effect">
                    <Link to={`/blog-detail/${item.id}`}>
                      <img
                        src={item.image}
                        alt="post"
                        className="card-img-top"
                      />
                    </Link>
                  </div>
                  <div className="card-body flex-grow-1">
                    <div className="post-meta d-flex text-uppercase gap-3 my-2 align-items-center">
                      <div className="meta-date">{item.date}</div>
                    </div>
                    <div className="post-header">
                      <h3 className="post-title">
                        <Link
                          to={`/blog-detail/${item.id}`}
                          className="text-decoration-none fw-bold"
                          style={{ color: "black" }}
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p>{item.des}</p>
                    </div>
                  </div>
                  <div className="card-footer text-end">
                    <small>
                      {" "}
                      {t("blog.poster")}: {item.author}
                    </small>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
