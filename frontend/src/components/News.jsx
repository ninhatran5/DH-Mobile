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
          <div className="post-meta d-flex text-uppercase gap-3 my-2 align-items-center mb-2">
            <div className="meta-date">
              <small className="me-1"> {t("blog.date")}</small>
              {item.created_at && (
                <>
                  {new Date(item.created_at).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(item.created_at).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </>
              )}
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
        <div className="card-footer text-end d-flex justify-content-between align-items-center">
          <div className="meta-date-updated">
            <span className="me-1" style={{ fontSize: 12 }}>
              {" "}
              {t("blog.update")}
            </span>
            {item.updated_at && (
              <>
                {new Date(item.updated_at).toLocaleDateString("vi-VN")} -{" "}
                {new Date(item.updated_at).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </>
            )}
          </div>
          <small>
            {t("blog.poster")}: <span className="fw-bold">{item.author}</span>
          </small>
        </div>
      </article>
    </div>
  );
}
