import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { fetchProducts } from "../slices/productSlice";
import Loading from "../components/Loading";
import { fetchProductDetail } from "../slices/productDetailSlice";
import { fetchProductVariationDetail } from "../slices/productVariationDetails";
import numberFomat from "../../utils/numberFormat";
import {
  fetchFavoriteProduct,
  fetchListFavorite,
} from "../slices/favoriteProductsSlice";
import { fetchAddToCart, fetchCart } from "../slices/cartSlice";
import { fetchSpecification } from "../slices/specificationsSlice";
import ListProductCard from "../components/ListProductCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments } from "../slices/reviewSlice";
import coins from "../assets/images/coins.png";
import numberFormatCoins from "../../utils/numberFormatCoins";
import "../assets/admin/product.css";
import { calculateAverageRating } from "../../utils/reviewUtils";
import { FaStar, FaRegStar } from "react-icons/fa";

function stripHtmlTags(html) {
  if (!html) {
    return "";
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function getAllAttributes(variants) {
  const attrMap = {};
  variants.forEach((variant) => {
    variant.attributes
      .filter(
        (attr) => attr.attribute_id && attr.name && Array.isArray(attr.values)
      )
      .forEach((attr) => {
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

function findVariantId(variants, selectedOptions) {
  return (
    variants.find((variant) =>
      variant.attributes
        .filter(
          (attr) =>
            attr.attribute_id &&
            Array.isArray(attr.values) &&
            attr.values.length > 0
        )
        .every(
          (attr) =>
            selectedOptions[attr.attribute_id] === attr.values[0].value_id
        )
    )?.variant_id || null
  );
}

// Hàm kiểm tra tổ hợp thuộc tính hợp lệ
function isValidCombination(variants, selectedOptions, currentAttrId, valueId) {
  // Nếu chưa chọn đủ thuộc tính, tất cả giá trị đều hợp lệ
  const selectedCount = Object.keys(selectedOptions).length;
  if (selectedCount === 0) return true;

  // Lọc các biến thể khớp với các thuộc tính đã chọn (ngoại trừ thuộc tính hiện tại)
  return variants.some((variant) => {
    return variant.attributes.every((attr) => {
      // Bỏ qua kiểm tra cho thuộc tính đang được đánh giá
      if (attr.attribute_id === currentAttrId) {
        return attr.values.some((val) => val.value_id === valueId);
      }
      // Kiểm tra xem thuộc tính đã chọn có khớp với biến thể không
      return (
        selectedOptions[attr.attribute_id] === undefined ||
        attr.values.some(
          (val) => val.value_id === selectedOptions[attr.attribute_id]
        )
      );
    });
  });
}

const ProductDetail = ({ productId, isQuickView, hideExtraInfo = false }) => {
  const [activeTab, setActiveTab] = useState("description");
  const [selectedOptions, setSelectedOptions] = useState({});
  const { id: paramId } = useParams();
  const id = productId || paramId;
  const dispatch = useDispatch();
  const { productDetails, loading } = useSelector(
    (state) => state.productDetail
  );
  const { productVariationDetails } = useSelector(
    (state) => state.productVariationDetail
  );
  const userID = localStorage.getItem("userID");
  const { reviews } = useSelector((state) => state.review);
  const { specifications } = useSelector((state) => state.specification);
  const { favoriteProducts: _ } = useSelector((state) => state.favoriteProduct);
  const { products = [] } = useSelector((state) => state.product);
  const { t } = useTranslation();
  const variants = useMemo(
    () => productVariationDetails?.data?.variants || [],
    [productVariationDetails]
  );
  const allAttributes = getAllAttributes(variants);
  const variantId = findVariantId(variants, selectedOptions);
  const selectedVariant = variants.find((v) => v.variant_id === variantId);

  function getSelectedValueImage() {
    for (let attr of allAttributes) {
      const selectedValueId = selectedOptions[attr.attribute_id];
      if (selectedValueId) {
        const value = attr.values.find((v) => v.value_id === selectedValueId);
        if (value && value.image_url) return value.image_url;
      }
    }
    return null;
  }

  const { totalReviews, averageRating } = calculateAverageRating(reviews);
  const selectedValueImage = getSelectedValueImage();

  const productImages = useMemo(() => {
    if (selectedValueImage) {
      return [{ id: 1, image: selectedValueImage }];
    }
    if (selectedVariant?.image_url) {
      return [{ id: 1, image: selectedVariant.image_url }];
    }
    if (Array.isArray(productDetails.data?.image_url)) {
      return productDetails.data.image_url.map((url, idx) => ({
        id: idx + 1,
        image: url,
      }));
    }
    if (productDetails.data?.image_url) {
      return [{ id: 1, image: productDetails.data.image_url }];
    }
    return [];
  }, [selectedValueImage, selectedVariant, productDetails]);

  const [currentImage, setCurrentImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const productImgRef = useRef(null);

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
      toast.warn(t("toast.errorMin"));
      setQuantity(1);
    } else {
      setQuantity(1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "-" || e.key === "e") {
      e.preventDefault();
      toast.warn(t("toast.errorSpecialCharacters"));
    }
  };

  const addToFavorites = async () => {
    if (!checkLogin()) {
      return;
    }
    try {
      await dispatch(fetchFavoriteProduct(productDetails?.data?.product_id));
      toast.success(t("toast.addedToFavorites"));
      dispatch(fetchListFavorite());
    } catch (error) {
      toast.error(error || t("toast.errorAddingFavorite"));
    }
  };

  const addToShoppingCart = async () => {
    if (!quantity || quantity < 1) {
      toast.warn(t("toast.errorMin"));
      return;
    }

    if (
      allAttributes.length > 0 &&
      Object.keys(selectedOptions).length < allAttributes.length
    ) {
      toast.warn(t("toast.selectAllVariant"));
      return;
    }

    if (!variantId) {
      toast.warn(t("toast.outOfStock"));
      return;
    }

    if (quantity > selectedVariant?.stock) {
      toast.warn(t("toast.overLimit"));
      return;
    }
    if (checkLogin()) {
      animateToCart();
      const payload = {
        product_id: productDetails.data?.product_id,
        quantity,
        variant_id: variantId,
      };
      await dispatch(fetchAddToCart(payload));
      await dispatch(fetchCart());
      toast.success(t("toast.addedToCart"));
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
      dispatch(fetchSpecification(id));
      dispatch(fetchComments(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (userID) {
      dispatch(fetchSpecification(userID));
    }
  }, [dispatch, userID]);

  useEffect(() => {
    if (productImages.length > 0) {
      setCurrentImage(productImages[0].image);
    }
  }, [productImages]);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  useEffect(() => {
    if (variants.length > 0) {
      const defaultVariant = variants[0];
      const defaultOptions = {};
      defaultVariant.attributes.forEach((attr) => {
        if (
          attr.attribute_id &&
          Array.isArray(attr.values) &&
          attr.values.length > 0
        ) {
          defaultOptions[attr.attribute_id] = attr.values[0].value_id;
        }
      });

      setSelectedOptions((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(defaultOptions)) {
          return defaultOptions;
        }
        return prev;
      });
    } else {
      setSelectedOptions({});
    }
  }, [id, variants]);
  const relatedProducts = useMemo(() => {
    if (!productDetails.data || !productDetails.data.category_id) return [];
    return products.filter(
      (p) =>
        p.category_id === productDetails.data.category_id &&
        p.product_id !== productDetails.data.product_id
    );
  }, [products, productDetails]);

  const animateToCart = () => {
    const img = productImgRef.current;
    const cart = document.querySelector(".header-cart-icon");
    if (!img || !cart) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    const clone = img.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = imgRect.left + "px";
    clone.style.top = imgRect.top + "px";
    clone.style.width = imgRect.width + "px";
    clone.style.height = imgRect.height + "px";
    clone.style.transition = "all 1.5s cubic-bezier(.4,2,.6,1)";
    clone.style.zIndex = 1000;
    document.body.appendChild(clone);

    setTimeout(() => {
      clone.style.left = cartRect.left + "px";
      clone.style.top = cartRect.top + "px";
      clone.style.width = "40px";
      clone.style.height = "40px";
      clone.style.opacity = 0.5;
    }, 10);

    setTimeout(() => {
      document.body.removeChild(clone);
    }, 1600);
  };

  return (
    <>
      {loading && <Loading />}
      {!isQuickView && !hideExtraInfo && (
        <Breadcrumb
          title={t("breadcrumbProductDetail.breadcrumbHeader")}
          mainItem={t("breadcrumbProductDetail.breadcrumbTitleHome")}
          mainItem2={t("breadcrumbProductDetail.breadcrumbTitleProduct")}
          secondaryItem={productDetails.data?.name}
          linkMainItem={"/"}
          linkMainItem2={"/products"}
        />
      )}

      <div
        className={isQuickView ? "" : "container-fluid"}
        style={isQuickView ? { padding: 0, margin: 0 } : { marginBottom: 80 }}
      >
        <div className="row">
          {/* Ẩn ảnh trái nếu là quick view hoặc hideExtraInfo */}
          {!isQuickView && (
            <div className="col-md-6 mb-5 position-relative">
              <div className="border rounded mb-3 p-3 text-center position-relative">
                <img
                  ref={productImgRef}
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
          )}

          {/* Ẩn modal carousel nếu là quick view hoặc hideExtraInfo */}
          {!isQuickView && (
            <Modal
              show={showModal}
              onHide={handleCloseModal}
              centered
              size="lg"
            >
              <Modal.Header closeButton className="border-0"></Modal.Header>
              <Modal.Body className="text-center p-0">
                <div
                  {...handlers}
                  className="carousel-swipeable-container-fluid"
                >
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
          )}

          <div className={isQuickView ? "col-12" : "col-md-6"}>
            <div key={productDetails.data?.product_id}>
              <h2 className="mb-3">{productDetails.data?.name}</h2>
              <div className="price">
                <h4 className="text-price_sale">
                  {numberFomat(
                    selectedVariant?.price || productDetails?.data?.price
                  )}
                </h4>
                <p className="text-price_original">
                  {numberFomat(
                    selectedVariant?.price_original ||
                      productDetails?.data?.price_original
                  )}
                </p>
              </div>
              {totalReviews > 0 && (
                <div className="mb-3">
                  <div className="d-flex align-items-center" style={{ gap: 8 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      {Array.from({ length: 5 }, (_, i) =>
                        i < Math.floor(averageRating) ? (
                          <FaStar
                            key={i}
                            className="star-filled"
                            style={{
                              color: "#ffd530",
                              fontSize: 19,
                              marginRight: 1,
                            }}
                          />
                        ) : (
                          <FaRegStar
                            key={i}
                            className="star-empty"
                            style={{
                              color: "#e0e0e0",
                              fontSize: 19,
                              marginRight: 1,
                            }}
                          />
                        )
                      )}
                    </div>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 16,
                        color: "#333",
                        marginLeft: 4,
                        letterSpacing: 0.2,
                      }}
                    >
                      {averageRating}
                    </span>
                    <span
                      style={{ color: "#888", fontSize: 14, marginLeft: 2 }}
                    >
                      ({totalReviews} {t("comment.reviews")})
                    </span>
                  </div>
                </div>
              )}
              {Object.keys(selectedOptions).length === allAttributes.length && (
                <p className="text-muted">
                  {t("productDetail.quantity")}:{" "}
                  <span className="fw-bold me-1">
                    {selectedVariant?.stock ?? 0}
                  </span>
                  {t("productDetail.product")}
                </p>
              )}
              <div
                className="card-coins-products d-flex align-items-center"
                style={{ marginTop: "-20px", marginBottom: "-5px" }}
              >
                <img style={{ width: 20 }} src={coins} />
                <p style={{marginTop: 17, marginLeft: 8}}
                  className="coins-products"
                  dangerouslySetInnerHTML={{
                    __html: t("productDetail.coinReward", {
                      coins: `<span class="fw-bold">${numberFormatCoins(
                        (selectedVariant?.price ||
                          productDetails?.data?.price ||
                          0) / 100
                      )}</span>`,
                    }),
                  }}
                />
              </div>
              <p style={{marginBottom: "10px"}}>
                <span className="fw-bold"> {t("productDetail.describe")}: </span>{" "}
                {productDetails.data?.description
                  ? stripHtmlTags(productDetails.data.description)
                  : ""}
              </p>
              <p style={{marginBottom: "-6px"}}>
                <p style={{marginBottom: "6px"}} className="fw-bold">{t("productDetail.parameter")}:</p>
                <ul className="">
                  {specifications?.map((spec) => (
                    <li key={spec.spec_id}>
                      <span className="fw-bold me-2">{spec.spec_name}:</span>
                      <span>{spec.spec_value}</span>
                    </li>
                  ))}
                </ul>
              </p>
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
                      {attr.values.map((val) => {
                        const isValid = isValidCombination(
                          variants,
                          selectedOptions,
                          attr.attribute_id,
                          val.value_id
                        );
                        return (
                          <button
                            key={val.value_id}
                            className={`btn btn-outline-secondary mx-1 ${
                              selectedOptions?.[attr.attribute_id] ===
                              val.value_id
                                ? "active"
                                : ""
                            } ${!isValid ? "disabled" : ""}`}
                            disabled={!isValid}
                            onClick={() =>
                              setSelectedOptions((prev) => {
                                if (prev[attr.attribute_id] === val.value_id) {
                                  const newOptions = { ...prev };
                                  delete newOptions[attr.attribute_id];
                                  return newOptions;
                                }
                                return {
                                  ...prev,
                                  [attr.attribute_id]: val.value_id,
                                };
                              })
                            }
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
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
              <button
                onClick={addToShoppingCart}
                className="btn-custom px-4"
                disabled={selectedVariant?.stock === 0}
              >
                {t("products.addToCart")}
              </button>
            </div>
          </div>
        </div>

        {!isQuickView && (
          <>
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
                    className={`nav-link ${
                      activeTab === "info" ? "active" : ""
                    }`}
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

              <div className="p-4">
                {activeTab === "description" && (
                  <div className="tab-pane fade show active">
                    <p className="desc_productdetai">
                      {productDetails.data?.description
                        ? stripHtmlTags(productDetails.data.description)
                        : ""}
                    </p>
                  </div>
                )}
                {activeTab === "info" && (
                  <div className="tab-pane fade show active">
                    <ul className="desc_productdetai mb-0">
                      {specifications?.map((spec) => (
                        <li key={spec.spec_id}>
                          <span className="fw-bold me-2">
                            {spec.spec_name}:
                          </span>
                          <span>{spec.spec_value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === "reviews" && <Comment reviews={reviews} />}
              </div>
            </div>
            {!hideExtraInfo && (
              <div style={{ marginTop: 30 }}>
                <ListProductCard
                  title={t("home.relatedProducts")}
                  desc={t("home.goToShop")}
                  gotoShop={"/products"}
                  products={relatedProducts}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
