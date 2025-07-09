import { FaStar, FaRegStar } from "react-icons/fa";
import "../assets/css/comment.css";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import ImageViewModal from "./ImageViewModal"; 

const Comment = ({ reviews }) => {
  const { t } = useTranslation();
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (images, index) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

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
                        <p style={{ fontSize: 11, color: "#8a8d91", marginTop: "-4px"}}>
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
                        {item.upload_urls && item.upload_urls.length > 0 && (
                          <div className="mb-3" style={{marginTop: "10px"}}>
                            <div className="comment-images-grid">
                              {item.upload_urls.map((imageUrl, imgIndex) => (
                                <img 
                                  key={imgIndex}
                                  src={imageUrl} 
                                  className="comment-image" 
                                  alt={`Review image ${imgIndex + 1}`}
                                  onClick={() => handleImageClick(item.upload_urls, imgIndex)}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {item.reply && (
                      <div className="admin-comment mt-3">
                        <div className="reply-indicator-fb ms-3">
                          <span className="reply-to">{item?.replied_by?.full_name || "Admin"}</span> {t("comment.replied_to")} <span className="reply-to">{item?.user?.full_name}</span>
                        </div>
                        <div className="d-flex flex-start">
                          <img
                            className="rounded-circle shadow-1-strong ms-3 me-3"
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
                            <div className="d-flex flex-column">
                              <div className="d-flex flex-start align-items-center flex-wrap">
                                <h6
                                  className="fw-bold mb-0 me-2"
                                  style={{ lineHeight: "1.3", fontSize: "14px" }}
                                >
                                  {item?.replied_by?.full_name || "Admin"}
                                </h6>
                                <span
                                  className="role-badge"
                                  style={{
                                    fontSize: 11,
                                    color: "#8a8d91",
                                    backgroundColor: "#ededed",
                                    padding: "2px 6px",
                                    borderRadius: "8px",
                                    display: "inline-block",
                                    lineHeight: "1.2",
                                  }}
                                >
                                  {item?.replied_by?.role === "admin"
                                    ? t("role.admin")
                                    : item?.replied_by?.role === "staff"
                                    ? t("role.staff")
                                    : t("role.Customer")}
                                </span>
                              </div>
                            </div>
                            <p style={{ fontSize: 11, color: "#8a8d91", marginBottom: "8px", marginTop: 2 }}>
                              {dayjs(item?.replied_by?.created_at).format(
                                "HH:mm / DD-MM-YYYY"
                              )}
                            </p>
                            <p className="mb-0" style={{ fontSize: "14px", color: "#1c1e21", lineHeight: "1.4" }}>
                              {item?.reply}
                            </p>
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
      
      <ImageViewModal
        show={showImageModal}
        handleClose={() => setShowImageModal(false)}
        images={selectedImages}
        initialIndex={selectedImageIndex}
      />
    </section>
  );
};

export default Comment;
