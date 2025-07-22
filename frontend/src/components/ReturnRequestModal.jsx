// components/ReturnRequestModal.jsx
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetail, refundOrder } from "../slices/orderSlice";
import numberFormat from "../../utils/numberFormat";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ReturnRequestModal = ({ show, handleClose, orderId, caseType = 1 }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const maxChars = 2000;
  const dispatch = useDispatch();
  const { orderDetail } = useSelector((state) => state.order);
  const navigate = useNavigate();
  const handleNextPageOrderDetail = (id) => {
    handleClose();
    navigate(`/product-detail/${id}`);
  };

  const returnReasonsCase1 = [
    { value: "", label: t("returnRequest.selectReason") },
    { value: "Hàng bể vỡ", label: t("returnRequest.reasonBroken") },
    {
      value: "Hàng lỗi, không hoạt động",
      label: t("returnRequest.reasonDefective"),
    },
    { value: "Hàng giả, nhái", label: t("returnRequest.reasonFake") },
    {
      value: "Hàng khác với mô tả",
      label: t("returnRequest.reasonNotAsDescribed"),
    },
    { value: "Hàng đã qua sử dụng", label: t("returnRequest.reasonUsed") },
    { value: "Lý do khác", label: t("returnRequest.reasonOther") },
  ];
  const returnReasonsCase2 = [
    { value: "", label: t("returnRequest.selectReason") },
    { value: "Thiếu hàng", label: t("returnRequest.reasonMissing") },
    {
      value: "Người bán gửi sai hàng",
      label: t("returnRequest.reasonWrongSent"),
    },
    { value: "Lý do khác", label: t("returnRequest.reasonOther") },
  ];

  const returnReasons =
    caseType === 1 ? returnReasonsCase1 : returnReasonsCase2;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      Swal.fire({
        icon: "warning",
        title: t("returnRequest.tooManyImagesTitle"),
        text: t("returnRequest.max3ImagesText"),
      });
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setImages((prev) => {
      const imgToRemove = prev.find((img) => img.id === imageId);
      if (imgToRemove?.preview) {
        URL.revokeObjectURL(imgToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  useEffect(() => {
    if (!orderId) return;
    dispatch(fetchOrderDetail(orderId));
  }, [orderId, dispatch]);

  const handleSubmit = async () => {
    try {
      await dispatch(
        refundOrder({
          id: orderId,
          reason,
          reasonOther: description,
          images,
        })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: t("returnRequest.successTitle"),
        text: t("returnRequest.successText"),
        confirmButtonText: t("returnRequest.closeBtn"),
      });

      handleClose();
      setReason("");
      setDescription("");
      setImages([]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("returnRequest.errorTitle"),
        text: error || t("returnRequest.errorText"),
      });
    }
  };

  const handleCloseWithConfirm = async () => {
    const result = await Swal.fire({
      title: t("returnRequest.confirmCloseTitle"),
      text: t("returnRequest.confirmCloseText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("returnRequest.closeBtn"),
      cancelButtonText: t("returnRequest.cancelBtn"),
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      handleClose();
    }
  };

  return (
    <>
      <Modal size="lg" show={show} onHide={handleCloseWithConfirm}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="modal_change_address_title">
              {t("returnRequest.title")}
            </h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container-fluid">
            {orderDetail?.products?.map((product, index) => (
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
                      {product.variant_attributes?.find(
                        (attr) =>
                          attr.attribute_name.toLowerCase() === "màu sắc"
                      )?.attribute_value || t("returnRequest.unknownColor")}
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

            <hr className="hr_return" />
            <div className="return-reason-group d-flex align-items-center mb-3">
              <label
                htmlFor="reasonSelect"
                className="return-label me-2 mb-0"
                style={{ minWidth: "80px" }}
              >
                {t("returnRequest.reasonLabel")}
              </label>
              <div className="flex-grow-1">
                <select
                  id="reasonSelect"
                  className="return-select form-select w-100"
                  value={reason}
                  style={{ fontSize: "15px" }}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {returnReasons.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="hr_return" />
            <div>
              <p className="refund_amount">{t("returnRequest.refundAmount")}</p>
              <p className="refund_price">
                {numberFormat(orderDetail?.total_amount || 0)}
              </p>
            </div>

            <hr className="hr_return" />
            <div className="mb-3">
              <label className="return-label form-label">
                {t("returnRequest.uploadImages")}
              </label>
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
                    <i
                      className="bi bi-cloud-arrow-up"
                      style={{ fontSize: 20 }}
                    ></i>
                    <span style={{ marginLeft: 8 }}>
                      {t("returnRequest.chooseImages")}
                    </span>
                  </div>
                </label>

                {images.length > 0 && (
                  <div className="image-preview-grid">
                    {images.map((image) => (
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
                <p
                  className="upload-hint text-muted"
                  style={{ fontSize: "13px" }}
                >
                  {t("returnRequest.uploadHint")} ({images.length}/3)
                </p>
              </div>
            </div>

            <hr className="hr_return" />
            <div className="return-description mb-3">
              <label
                htmlFor="additionalInfo"
                className="return-label form-label"
              >
                {t("returnRequest.descriptionLabel")}
              </label>
              <textarea
                id="additionalInfo"
                className="return-textarea form-control"
                rows="4"
                placeholder={t("returnRequest.descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={maxChars}
              ></textarea>
              <p
                className="text-end text-muted mt-1"
                style={{ fontSize: "13px" }}
              >
                {description.length}/{maxChars} {t("returnRequest.characters")}
              </p>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="email_return">{t("returnRequest.emailLabel")}</p>
              <p className="email_address_return">{orderDetail?.email || ""}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseWithConfirm}>
            {t("returnRequest.closeBtn")}
          </Button>
          <Button
            className="btn_save_address"
            onClick={handleSubmit}
            disabled={!description}
          >
            {t("returnRequest.submitBtn")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReturnRequestModal;
