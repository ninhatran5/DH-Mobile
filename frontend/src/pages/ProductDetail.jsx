import { useState, useCallback } from "react";
import { Modal } from "react-bootstrap";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import iphone2 from "../assets/images/iphone-15-pro_2__2_1_1_1.webp";
import iphone3 from "../assets/images/iphone-15-plus_1__1.webp";
import { MdOutlineZoomInMap } from "react-icons/md";
import Carousel from "react-bootstrap/Carousel";
import "../assets/css/product-detail.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Comment from "../components/Comment";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useSwipeable } from "react-swipeable";

const ProductDetail = () => {
  const [activeTab, setActiveTab] = useState("description");
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const productImages = [
    { id: 1, image: iphone },
    { id: 2, image: iphone2 },
    { id: 3, image: iphone3 },
  ];

  const phoneVersions = [
    {
      id: 1,
      version: "Titan đen",
    },
    {
      id: 2,
      version: "Titan tự nhiên",
    },
    {
      id: 3,
      version: "Titan trắng",
    },
    {
      id: 4,
      version: "Titan sa mạc",
    },
  ];

  const phoneColors = [
    {
      id: 1,
      colors: "red",
      values: "red",
    },
    {
      id: 2,
      colors: "green",
      values: "green",
    },
    {
      id: 3,
      colors: "yellow",
      values: "yellow",
    },
    {
      id: 4,
      colors: "blue",
      values: "blue",
    },
  ];

  const machineInformation = [
    {
      id: 1,
      name: "iPhone 16 Pro Max",
      priceSale: "24.000.000đ",
      priceOriginal: "24.500.000đ",
      quantity: 1000,
      desc: "iPhone 16 Pro Max mang đến thiết kế sang trọng với khung thép không gỉ và mặt lưng kính cường lực. Màn hình Super Retina XDR với công nghệ ProMotion cung cấp trải nghiệm hình ảnh mượt mà. Được trang bị chip A17 Bionic, nó mạnh mẽ và tiết kiệm năng lượng. Hệ thống camera cải tiến cho khả năng chụp ảnh và quay video ấn tượng, bao gồm chế độ ban đêm và video 4K. Hỗ trợ kết nối 5G, thời lượng pin lâu dài và chạy trên iOS mới nhất, iPhone 16 Pro Max là lựa chọn hoàn hảo cho những người yêu công nghệ.",
    },
  ];

  const [currentImage, setCurrentImage] = useState(iphone);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleThumbnailClick = (image) => {
    setCurrentImage(image);
    const index = productImages.findIndex((item) => item.image === image);
    setActiveIndex(index);
  };

  const handleShowModal = () => {
    const index = productImages.findIndex(
      (item) => item.image === currentImage
    );
    setActiveIndex(index);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleUpQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDownQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleChangQuantity = (e) => {
    let value = e.target.value;
    if (value === "") {
      setQuantity("");
    } else if (Number(value) >= 1 && !isNaN(value)) {
      setQuantity(Number(value));
    } else if (Number(value) === 0) {
      toast.warn(t("products.errorMin"));
      setQuantity(1);
    } else {
      setQuantity(1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "-" || e.key === "e") {
      e.preventDefault();
      toast.warn(t("products.errorSpecialCharacters"));
    }
  };

  const addToFavorites = () => {
    console.log("added");
    toast.success(t("products.addedToFavorites"));
  };

  const addToShoppingCart = () => {
    console.log("added");
    toast.success(t("products.addedToCart"));
    navigate("/shopping-cart");
  };

  const handleSelect = useCallback(
    (index) => {
      setActiveIndex(index);
      setCurrentImage(productImages[index].image);
    },
    [productImages]
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextIndex = (activeIndex + 1) % productImages.length;
      handleSelect(nextIndex);
    },
    onSwipedRight: () => {
      const prevIndex =
        activeIndex === 0 ? productImages.length - 1 : activeIndex - 1;
      handleSelect(prevIndex);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 5,
    swipeDuration: 250,
    touchEventOptions: { passive: true },
    rotationAngle: 0,
  });

  return (
    <>
      <Breadcrumb
        title={t("breadcrumbProductDetail.breadcrumbHeader")}
        mainItem={t("breadcrumbProductDetail.breadcrumbTitleHome")}
        mainItem2={t("breadcrumbProductDetail.breadcrumbTitleProduct")}
        secondaryItem={"iPhone 16 Pro Max"}
        linkMainItem={"/"}
        linkMainItem2={"/products"}
      />

      <div className="container-fluid" style={{ marginBottom: 80 }}>
        <div className="row">
          <div className="col-md-6 mb-5 position-relative">
            <div className="border rounded mb-3 p-3 text-center position-relative">
              <img
                src={currentImage}
                alt="iPhone"
                className="img-fluid"
                style={{ maxHeight: "400px", cursor: "pointer" }}
                onClick={handleShowModal}
              />
              <button
                className="btn-zoom btn position-absolute"
                style={{
                  top: "10px",
                  right: "10px",
                  zIndex: "1",
                  fontSize: 23,
                  color: "black",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                }}
                onClick={handleShowModal}
              >
                <MdOutlineZoomInMap />
              </button>
            </div>
            <div className="product_detail_image d-flex justify-content-center">
              {productImages.map((item) => (
                <img
                  key={item.id}
                  src={item.image}
                  alt="thumbnail"
                  className={`img-thumbnail mx-1 ${
                    item.image === currentImage ? "active" : ""
                  }`}
                  onClick={() => handleThumbnailClick(item.image)}
                />
              ))}
            </div>
          </div>

          <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
            <Modal.Header closeButton className="border-0"></Modal.Header>
            <Modal.Body className="text-center p-0">
              <div {...handlers} className="carousel-swipeable-container">
                <Carousel
                  data-bs-theme="dark"
                  interval={null}
                  activeIndex={activeIndex}
                  onSelect={handleSelect}
                  indicators={false}
                  touch={false}
                  slide={true}
                >
                  {productImages.map((item) => (
                    <Carousel.Item key={item.id}>
                      <img
                        className="d-block w-100"
                        src={item.image}
                        alt="Product image"
                        draggable={false}
                        loading="eager"
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
            </Modal.Body>
          </Modal>

          <div className="col-md-6">
            {machineInformation.map((item) => (
              <div key={item.id}>
                <h2 className="mb-3">{item.name}</h2>
                <div className="price">
                  <h4 className="text-price_sale mb-3">{item.priceSale}</h4>
                  <p className="text-price_original">{item.priceOriginal}</p>
                </div>
                <p className="text-muted">
                  {t("productDetail.quantity")}:{" "}
                  <span className="fw-bold">{item.quantity}</span>{" "}
                  {t("productDetail.product")}
                </p>
                <p className="text-muted">{item.desc}</p>
              </div>
            ))}
            <div className="mb-3">
              <label className="font-weight-bold">
                {t("productDetail.selectVersion")}:
                {!selectedVersion && <span className="text-danger">*</span>}
              </label>
              <div className="d-flex justify-content-start version-button-group">
                {phoneVersions.map((phoneVersion) => (
                  <button
                    key={phoneVersion.id}
                    className={`btn btn-outline-secondary mx-1 ${
                      selectedVersion === phoneVersion.id ? "active" : ""
                    }`}
                    onClick={() =>
                      setSelectedVersion(
                        selectedVersion === phoneVersion.id
                          ? null
                          : phoneVersion.id
                      )
                    }
                  >
                    {phoneVersion.version}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="font-weight-bold mb-2">
                {t("productDetail.selectColor")}:
                {!selectedColor && <span className="text-danger">*</span>}
              </label>
              <div className="d-flex justify-content-start">
                {phoneColors.map((phoneColor) => (
                  <div
                    key={phoneColor.id}
                    className={`color-circle mx-1 ${
                      selectedColor === phoneColor.id ? "active" : ""
                    }`}
                    style={{
                      backgroundColor: phoneColor.colors,
                      border:
                        selectedColor === phoneColor.id
                          ? `1px solid ${phoneColor.colors}`
                          : "1px solid #e0e0e0",
                      transform:
                        selectedColor === phoneColor.id
                          ? "scale(1.08)"
                          : "scale(1)",
                      boxShadow:
                        selectedColor === phoneColor.id
                          ? `0 0 0 1px #fff, 0 0 0 2px ${phoneColor.colors}`
                          : "none",
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setSelectedColor(
                        selectedColor === phoneColor.id ? null : phoneColor.id
                      )
                    }
                  ></div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 30 }}>
              <label className="font-weight-bold mb-2 me-3">
                {t("productDetail.quantity")}:
              </label>
              <div className="quantity-group mb-4">
                <button onClick={handleDownQuantity} className="btn-quantity">
                  -
                </button>
                <input
                  type="number"
                  className="input-quantity hide-spinner"
                  onChange={handleChangQuantity}
                  min={1}
                  value={quantity}
                  onKeyDown={handleKeyDown}
                />
                <button onClick={handleUpQuantity} className="btn-quantity">
                  +
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <button
                onClick={addToFavorites}
                className="btn-custom btn-favorite px-4"
                disabled={!selectedVersion || !selectedColor}
              >
                {t("productDetail.addToFavorites")}
              </button>
              <button
                onClick={addToShoppingCart}
                className="btn-custom px-4"
                disabled={!selectedVersion || !selectedColor}
              >
                {t("products.addToCart")}
              </button>
            </div>
          </div>
        </div>
        <div
          className="card_introducde_product_detail"
          style={{ marginTop: 80 }}
        >
          <ul className="introduce_productdetail nav">
            <li className="nav-item">
              <button
                style={{ fontWeight: 800 }}
                className={`nav-link ${
                  activeTab === "description" ? "active" : ""
                }`}
                onClick={() => setActiveTab("description")}
              >
                {t("productDetail.describe")}
              </button>
            </li>
            <li className="nav-item">
              <button
                style={{ fontWeight: 800 }}
                className={`nav-link ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                {t("productDetail.parameter")}
              </button>
            </li>
            <li className="nav-item">
              <button
                style={{ fontWeight: 800 }}
                className={`nav-link ${
                  activeTab === "reviews" ? "active" : ""
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                {t("productDetail.comment")}
              </button>
            </li>
          </ul>

          <div className=" p-4">
            {activeTab === "description" && (
              <div className="tab-pane fade show active">
                <p className="desc_productdetai">
                  This is the most powerful iPhone ever made. Sleek, fast...
                  This is the most powerful iPhone ever made. Sleek, fast...
                  This is the most powerful iPhone ever made. Sleek, fast...
                  This is the most powerful iPhone ever made. Sleek, fast...
                  This is the most powerful iPhone ever made. Sleek, fast...
                  This is the most powerful iPhone ever made. Sleek, fast...
                  This is the most powerful iPhone ever made. Sleek, fast...
                  This is the most powerful iPhone ever made. Sleek, fast...
                  This is the most powerful iPhone ever made. Sleek, fast...
                  This is the most powerful iPhone ever made. Sleek, fast...
                </p>
              </div>
            )}
            {activeTab === "info" && (
              <div className="tab-pane fade show active">
                <ul className="desc_productdetai mb-0">
                  <li>Weight: 0.79kg</li>
                  <li>Dimensions: 110 x 33 x 100 cm</li>
                  <li>Materials: 60% aluminum</li>
                  <li>Color options: Red, Blue, Grey, White</li>
                  <li>Sizes available: S, M, L, XL</li>
                </ul>
              </div>
            )}
            {activeTab === "reviews" && <Comment />}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
