import { useState, useCallback, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { MdOutlineZoomInMap } from "react-icons/md";
import Carousel from "react-bootstrap/Carousel";
import "../assets/css/product-detail.css";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Comment from "../components/Comment";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useSwipeable } from "react-swipeable";
import checkLogin from "../../utils/checkLogin";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../components/Loading";
import { fetchProductDetail } from "../slices/productDetailSlice";
import { fetchProductVariationDetail } from "../slices/productVariationDetails";
import numberFomat from "../../utils/numberFormat";
import {
  fetchFavoriteProduct,
  fetchListFavorite,
} from "../slices/favoriteProductsSlice";
import { fetchAddToCart } from "../slices/cartSlice";

// Hàm tổng hợp tất cả thuộc tính từ variants
function getAllAttributes(variants) {
  const attrMap = {};
  variants.forEach((variant) => {
    variant.attributes.forEach((attr) => {
      if (!attrMap[attr.attribute_id]) {
        attrMap[attr.attribute_id] = {
          attribute_id: attr.attribute_id,
          name: attr.name,
          values: [],
        };
      }
      attr.values.forEach((val) => {
        if (
          !attrMap[attr.attribute_id].values.some(
            (v) => v.value_id === val.value_id
          )
        ) {
          attrMap[attr.attribute_id].values.push(val);
        }
      });
    });
  });
  return Object.values(attrMap);
}

// Hàm tìm variant_id phù hợp với lựa chọn
function findVariantId(variants, selectedOptions) {
  return (
    variants.find((variant) =>
      variant.attributes.every(
        (attr) => selectedOptions[attr.attribute_id] === attr.values[0].value_id
      )
    )?.variant_id || null
  );
}

const ProductDetail = () => {
  const [activeTab, setActiveTab] = useState("description");
  const [selectedOptions, setSelectedOptions] = useState({});
  const { id } = useParams();
  const dispatch = useDispatch();
  const { productDetails, loading } = useSelector(
    (state) => state.productDetail
  );
  const { productVariationDetails } = useSelector(
    (state) => state.productVariationDetail
  );
  console.log(
    "🚀 ~ ProductDetail ~ productVariationDetails:",
    productVariationDetails
  );
  const { favoriteProducts: _ } = useSelector((state) => state.favoriteProduct);

  const { t } = useTranslation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const productImages = Array.isArray(productDetails.image_url)
    ? productDetails.image_url.map((url, idx) => ({ id: idx + 1, image: url }))
    : productDetails.image_url
    ? [{ id: 1, image: productDetails.image_url }]
    : [];

  const [currentImage, setCurrentImage] = useState(null);
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

  const addToFavorites = async () => {
    if (!checkLogin()) {
      return;
    }
    try {
      await dispatch(fetchFavoriteProduct(productDetails.product_id));
      toast.success(t("products.addedToFavorites"));
      dispatch(fetchListFavorite()); // Thêm dòng này để cập nhật danh sách yêu thích
    } catch (error) {
      toast.error(error || t("products.errorAddingFavorite"));
    }
  };

  // Lấy danh sách variants từ API
  const variants = productVariationDetails?.data?.variants || [];
  const allAttributes = getAllAttributes(variants);
  const variantId = findVariantId(variants, selectedOptions);

  const addToShoppingCart = () => {
    // Validate số lượng
    if (!quantity || quantity < 1) {
      toast.warn(t("products.errorMin"));
      return;
    }

    // Validate chọn đủ thuộc tính
    if (
      allAttributes.length > 0 &&
      Object.keys(selectedOptions).length < allAttributes.length
    ) {
      toast.warn(t("Vui lòng chọn đầy đủ phiên bản sản phẩm!"));
      return;
    }

    // Validate variant_id
    if (!variantId) {
      toast.warn(t("Không tìm thấy biến thể phù hợp!"));
      return;
    }

    if (checkLogin()) {
      const payload = {
        product_id: productDetails.product_id,
        quantity,
        variant_id: variantId,
      };
      dispatch(fetchAddToCart(payload));
      toast.success(t("products.addedToCart"));
    }
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

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetail(id));
      dispatch(fetchProductVariationDetail(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (productImages.length > 0) {
      setCurrentImage(productImages[0].image);
    }
  }, [productImages]);

  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("breadcrumbProductDetail.breadcrumbHeader")}
        mainItem={t("breadcrumbProductDetail.breadcrumbTitleHome")}
        mainItem2={t("breadcrumbProductDetail.breadcrumbTitleProduct")}
        secondaryItem={productDetails.name}
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
            <div key={productDetails.product_id}>
              <h2 className="mb-3">{productDetails.name}</h2>
              <div className="price">
                <h4 className="text-price_sale">
                  {numberFomat(productDetails.price)}
                </h4>
                <p className="text-price_original">
                  {numberFomat(productDetails?.price_original)}
                </p>
              </div>
              <p className="text-muted">
                {t("productDetail.quantity")}:{" "}
                <span className="fw-bold me-1">
                  {productVariationDetails?.data?.stock}
                </span>
                {t("productDetail.product")}
              </p>
              <p className="text-muted">{productDetails.description}</p>
            </div>

            <div className="mb-3">
              <label className="font-weight-bold mt-3">
                {t("productDetail.selectVersion")}:
              </label>
              <div className="d-flex flex-column gap-2 version-button-group">
                {allAttributes.map((attr) => (
                  <div
                    key={attr.attribute_id}
                    className="d-flex align-items-center mb-2"
                  >
                    <label
                      style={{
                        minWidth: 80,
                        fontWeight: 600,
                        marginRight: 8,
                      }}
                    >
                      {attr.name}:
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {attr.values.map((val) => (
                        <button
                          key={val.value_id}
                          className={`btn btn-outline-secondary mx-1 ${
                            selectedOptions?.[attr.attribute_id] ===
                            val.value_id
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedOptions((prev) => {
                              // Nếu đang chọn rồi thì bỏ chọn
                              if (prev[attr.attribute_id] === val.value_id) {
                                const newOptions = { ...prev };
                                delete newOptions[attr.attribute_id];
                                return newOptions;
                              }
                              // Nếu chưa chọn thì chọn
                              return {
                                ...prev,
                                [attr.attribute_id]: val.value_id,
                              };
                            })
                          }
                        >
                          {val.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 40 }}>
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
              >
                {t("productDetail.addToFavorites")}
              </button>
              <button onClick={addToShoppingCart} className="btn-custom px-4">
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
                  {productDetails.description}
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
