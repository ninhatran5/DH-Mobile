import { useEffect, useState } from "react";
import Loading from "./Loading";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { FaStar } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { fetchOrderDetail } from "../slices/orderSlice";
import numberFormat from "../../utils/numberFormat";
import { commentsPost } from "../slices/reviewSlice";
import { accumulatePoints } from "../slices/rankSlice";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../assets/css/reviewModal.css";
import { SlCloudUpload } from "react-icons/sl";

const ReviewModal = ({ show, handleClose, orderId, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState();
  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const maxLength = 200;
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      Swal.fire({
        icon: "warning",
        title: t("review.tooManyImages"),
        text: t("review.maxImagesText"),
      });
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  const handleNextPageOrderDetail = (id) => {
    handleClose();
    navigate(`/product-detail/${id}`);
  };

  const confirmClose = () => {
    Swal.fire({
      title: t("review.confirmCloseTitle"),
      text: t("review.confirmCloseText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("review.confirmCloseBtn"),
      cancelButtonText: t("review.cancelBtn"),
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleClose();
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVariantId) {
      Swal.fire({ icon: "error", title: t("review.noProductSelected") });
      return;
    }
    setIsLoading(true);
    dispatch(
      commentsPost({
        variant_id: selectedVariantId,
        rating,
        content: comment,
        images: selectedImages,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(accumulatePoints(orderId))
          .unwrap()
          .then(() => {
            Swal.fire({
              icon: "success",
              title: t("review.successTitle"),
              text: t("review.successTextWithPoints"),
              showConfirmButton: false,
              timer: 2000,
            });
          })
          .catch(() => {
            Swal.fire({
              icon: "success",
              title: t("review.successTitle"),
              text: t("review.successText"),
              showConfirmButton: false,
              timer: 1500,
            });
          });

        const reviewed = JSON.parse(
          localStorage.getItem("reviewedVariants") || "[]"
        );
        if (!reviewed.includes(selectedVariantId)) {
          reviewed.push(selectedVariantId);
          localStorage.setItem("reviewedVariants", JSON.stringify(reviewed));
        }

        const updated = reviewableProducts.filter(
          (p) => p.variant_id !== selectedVariantId
        );
        setReviewableProducts(updated);

        if (onSuccess) onSuccess(selectedVariantId);

        setComment("");
        setRating(0);
        setSelectedVariantId(undefined);
        setSelectedImages([]);

        if (updated.length === 0) {
          handleClose();
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: t("review.errorTitle"),
          text: error || t("review.errorText"),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!orderId) return;

    dispatch(fetchOrderDetail(orderId)).then((action) => {
      const reviewed = JSON.parse(
        localStorage.getItem("reviewedVariants") || "[]"
      );
      const products = action.payload?.products || [];
      const filtered = products.filter((p) => !reviewed.includes(p.variant_id));

      setReviewableProducts(filtered);

      if (filtered.length === 1) {
        setSelectedVariantId(filtered[0].variant_id);
      }
    });
  }, [orderId, dispatch]);

  return (
    <>
      {isLoading && <Loading />}
      <Modal size="lg" show={show} onHide={confirmClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="modal_change_address_title">{t("review.title")}</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            {reviewableProducts.map((product, index) => (
              <div className="d-flex mt-3" key={index}>
                <div className="border_image_return">
                  <img
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      handleNextPageOrderDetail(product.product_id)
                    }
                    className="image_return"
                    src={product.product_image || ""}
                    alt={product.product_name}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      handleNextPageOrderDetail(product.product_id)
                    }
                    className="title_return_product"
                  >
                    {product.product_name}
                  </p>
                  <div className="color_return_product">
                    <p className="desc_return_product">
                      {product.variant_attributes
                        ?.map((attr) => attr.attribute_value)
                        .join(", ") || "Không rõ"}
                    </p>
                    <p className="quantity_return_product">
                      x{product.quantity}
                    </p>
                  </div>
                  <p className="price_return_product">
                    {numberFormat(product.price || 0)}
                  </p>
                </div>
              </div>
            ))}

            {reviewableProducts.length > 1 && (
              <Form.Group className="mb-3">
                <p className="title_return">{t("review.selectProduct")}</p>
                <Form.Select
                  value={selectedVariantId || ""}
                  onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                  required
                >
                  <option value="">
                    {t("review.selectProductPlaceholder")}
                  </option>
                  {reviewableProducts.map((p) => (
                    <option key={p.variant_id} value={p.variant_id}>
                      {p.product_name} -{" "}
                      {p.variant_attributes
                        ?.map((attr) => attr.attribute_value)
                        .join(", ")}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <hr className="hr_return" />
            <div>
              <p className="title_return">{t("review.ratingTitle")}</p>
            </div>
            <div className="start_rating">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <FaStar
                    key={index}
                    size={28}
                    style={{ cursor: "pointer", marginRight: 5 }}
                    color={
                      starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"
                    }
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(null)}
                  />
                );
              })}
            </div>

            <hr className="hr_return" style={{ marginTop: "30px" }} />

            <div className="mb-3">
              <p className="title_return">{t("review.uploadImages")}</p>
              <div className="image-upload-container">
                <label className="custom-file-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <div className="upload-button">
                    <SlCloudUpload style={{ fontSize: 25 }} />
                    <span>{t("review.chooseImages")}</span>
                  </div>
                </label>

                {selectedImages.length > 0 && (
                  <div className="image-preview-grid">
                    {selectedImages.map((image) => (
                      <div key={image.id} className="image-preview-item">
                        <img src={image.preview} alt="Preview" />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(image.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="upload-hint">
                  {t("review.uploadHint")} ({selectedImages.length}/5)
                </p>
              </div>
            </div>

            <Form.Group className="mb-3">
              <p className="title_return">{t("review.writeReview")}</p>
              <Form.Control
                as="textarea"
                rows={4}
                value={comment}
                maxLength={maxLength}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("review.writeReviewPlaceholder")}
                className="textarea_review"
              />
              <p
                className="text-end text-muted mt-1"
                style={{ fontSize: "13px" }}
              >
                {comment.length}/{maxLength} {t("review.characters")}
              </p>
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={confirmClose}>
            {t("review.closeBtn")}
          </Button>
          <Button
            className="btn_save_address"
            onClick={handleSubmit}
            disabled={rating === 0 || !selectedVariantId}
          >
            {t("review.submitBtn")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReviewModal;
