import { FaStar, FaRegStar } from "react-icons/fa";
import "../assets/css/comment.css";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const Comment = ({ reviews }) => {
  const { t } = useTranslation();
  return (
    <section>
      <div className="container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-md-12 col-lg-10">
            <div className="text-body">
              {reviews.map((item, index) => {
                const filledStars = Array.from(
                  { length: item.rating },
                  (_, i) => (
                    <FaStar
                      key={`filled-${index}-${i}`}
                      className="star-filled me-1"
                    />
                  )
                );
                const emptyStars = Array.from(
                  { length: item.maxStars - item.rating },
                  (_, i) => (
                    <FaRegStar
                      key={`empty-${index}-${i}`}
                      className="star-empty me-1"
                    />
                  )
                );

                return (
                  <div className="hr_comment p-4" key={index}>
                    <div className="d-flex flex-start">
                      <img
                        className="rounded-circle shadow-1-strong me-3"
                        src={
                          item?.user?.image_url ||
                          "https://bootdey.com/img/Content/avatar/avatar1.png"
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://bootdey.com/img/Content/avatar/avatar1.png";
                        }}
                        alt="avatar"
                        width={60}
                        height={60}
                      />
                      <div>
                        <h6 className="fw-bold">{item?.user?.full_name}</h6>
                        <p style={{ fontSize: 12 }}>
                          {dayjs(item?.created_at).format("HH:mm / DD-MM-YYYY")}
                        </p>
                        <div className="d-flex">
                          {filledStars}
                          {emptyStars}
                        </div>
                        {item.variant_attributes &&
                          item.variant_attributes.length > 0 && (
                            <div
                              className="text-muted mt-2"
                              style={{ fontSize: 13 }}
                            >
                              {item.variant_attributes.map((attr, i) => (
                                <span key={i}>
                                  {attr.attribute_name}:{" "}
                                  <b>{attr.attribute_value}</b>
                                  {i < item.variant_attributes.length - 1
                                    ? " | "
                                    : ""}
                                </span>
                              ))}
                            </div>
                          )}
                        <p className="mt-2">{item?.content}</p>
                      </div>
                    </div>
                    {item.reply && (
                      <div className="admin-comment mt-4 ms-5">
                        <div className="d-flex flex-start">
                          <img
                            className="rounded-circle shadow-1-strong me-3"
                            src={
                              item?.replied_by?.image_url ||
                              "https://bootdey.com/img/Content/avatar/avatar1.png"
                            }
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://bootdey.com/img/Content/avatar/avatar1.png";
                            }}
                            alt="avatar"
                            width={60}
                            height={60}
                          />
                          <div>
                            <div className="d-flex flex-start align-items-center">
                              <h6
                                className="fw-bold mb-0"
                                style={{ lineHeight: "1.5" }}
                              >
                                {item?.replied_by?.full_name || "Admin"}
                              </h6>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "#6c757d",
                                  marginLeft: 8,
                                  display: "inline-block",
                                  lineHeight: "0.8",
                                  verticalAlign: "middle",
                                }}
                              >
                                -{" "}
                                {item?.replied_by?.role === "admin"
                                  ? t("role.admin")
                                  : item?.replied_by?.role === "staff"
                                  ? t("role.staff")
                                  : t("role.Customer")}
                              </span>
                            </div>
                            <p style={{ fontSize: 12 }}>
                              {dayjs(item?.replied_by?.created_at).format(
                                "HH:mm / DD-MM-YYYY"
                              )}
                            </p>
                            <p className="mt-1">{item?.reply}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comment;
