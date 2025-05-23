import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export default function News({ item }) {
  const { t } = useTranslation();

  return (
    <div className="card-products col-md-4" key={item.id}>
      <article className="post-item card border-0 shadow-sm d-flex flex-column">
        <div className="image-holder zoom-effect">
          <Link to={`/blog-detail/${item.news_id}`}>
            <img src={item.image_url} alt="post" className="card-img-top" />
          </Link>
        </div>
        <div className="card-body flex-grow-1">
          <div className="post-meta d-flex text-uppercase gap-3 my-2 align-items-center">
            <div className="meta-date">
              {item.updated_at
                ? new Date(item.updated_at).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : ""}
            </div>
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
            <p>{truncateText(item.content, 170)}</p>
          </div>
        </div>
        <div className="card-footer text-end">
          <small>
            {t("blog.poster")}: {item.author}
          </small>
        </div>
      </article>
    </div>
  );
}
