import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import iphone2 from "../assets/images/iphone-15-pro_2__2_1_1_1.webp";
import iphone3 from "../assets/images/iphone-15-plus_1__1.webp";
import { MdOutlineZoomInMap } from "react-icons/md";
import Carousel from "react-bootstrap/Carousel";

import "../assets/css/product-detail.css";
import { Link } from "react-router-dom";

const ProductDetail = () => {
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

  const [currentImage, setCurrentImage] = useState(iphone);
  const [showModal, setShowModal] = useState(false);

  const handleThumbnailClick = (image) => {
    setCurrentImage(image);
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>Chi Tiết Sản Phẩm</h4>
                <div className="breadcrumb__links">
                  <Link style={{ textDecoration: "none" }} to={"/"}>
                    Trang chủ
                  </Link>
                  <Link style={{ textDecoration: "none" }} to={"/products"}>
                    Sản phẩm
                  </Link>
                  <span>Chi tiết sản phẩm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-fluid py-5">
        <div className="row">
          {/* Cột hình ảnh sản phẩm */}
          <div className="col-md-6 position-relative">
            <div className="border rounded mb-3 p-3 text-center position-relative">
              <img
                src={currentImage}
                alt="iPhone"
                className="img-fluid"
                style={{ maxHeight: "400px" }}
              />
              <button
                className="btn-zoom btn position-absolute"
                style={{
                  top: "10px",
                  right: "10px",
                  zIndex: "1",
                  fontSize: 23,
                  color: "black",
                  border: "none", // Thêm dòng này
                  outline: "none",
                  background: "transparent", // Nếu cần, thêm để đảm bảo không có nền
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
                  className="img-thumbnail mx-1"
                  onClick={() => handleThumbnailClick(item.image)}
                />
              ))}
            </div>
          </div>

          {/* Modal ảnh */}
          <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
            <Modal.Body className="text-center">
              <Carousel data-bs-theme="dark">
                {productImages.map((item) => (
                  <Carousel.Item key={item.id}>
                    <img
                      className="d-block w-100"
                      src={item.image}
                      alt="First slide"
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Modal.Body>
          </Modal>

          <div className="col-md-6">
            <h2 className="mb-3">iPhone 16 Pro Max</h2>
            <h4 className="text-price mb-3">12.000.000đ</h4>
            <p className="text-muted">
              iPhone 16 Pro Max mang đến thiết kế sang trọng với khung thép
              không gỉ và mặt lưng kính cường lực. Màn hình Super Retina XDR với
              công nghệ ProMotion cung cấp trải nghiệm hình ảnh mượt mà. Được
              trang bị chip A17 Bionic, nó mạnh mẽ và tiết kiệm năng lượng. Hệ
              thống camera cải tiến cho khả năng chụp ảnh và quay video ấn
              tượng, bao gồm chế độ ban đêm và video 4K. Hỗ trợ kết nối 5G, thời
              lượng pin lâu dài và chạy trên iOS mới nhất, iPhone 16 Pro Max là
              lựa chọn hoàn hảo cho những người yêu công nghệ.
            </p>

            <div className="mb-3">
              <label className="font-weight-bold">
                Chọn phiên bản điện thoại
              </label>
              <div className="d-flex justify-content-start">
                {phoneVersions.map((phoneVersion) => (
                  <button
                    key={phoneVersion.id}
                    className="btn btn-outline-secondary mx-1"
                  >
                    {phoneVersion.version}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="font-weight-bold">Chọn màu</label>
              <div className="d-flex justify-content-start">
                {phoneColors.map((phoneColor) => (
                  <div
                    key={phoneColor.id}
                    className="color-circle mx-1"
                    style={{ backgroundColor: phoneColor.colors }}
                    onClick={() => console.log(phoneColor.values)}
                  ></div>
                ))}
              </div>
            </div>
            <div className="align-items-center mb-4">
              <input
                type="number"
                min="1"
                defaultValue="1"
                className="form-control w-25 mr-3"
              />
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <button className="btn btn-danger px-4">
                Thêm vào yêu thích
              </button>
              <button className="btn btn-primary px-4">
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <a
                className="nav-link active"
                data-toggle="tab"
                href="#description"
              >
                Description
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#info">
                Additional Info
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#reviews">
                Reviews (1)
              </a>
            </li>
          </ul>

          <div className="tab-content border p-4 bg-light">
            <div className="tab-pane fade show active" id="description">
              <p>
                This is the most powerful iPhone ever made. Sleek, fast, and
                packed with features. Perfect for photography, productivity, and
                everything in between.
              </p>
            </div>
            <div className="tab-pane fade" id="info">
              <ul className="mb-0">
                <li>Weight: 0.79kg</li>
                <li>Dimensions: 110 x 33 x 100 cm</li>
                <li>Materials: 60% aluminum</li>
                <li>Color options: Red, Blue, Grey, White</li>
                <li>Sizes available: S, M, L, XL</li>
              </ul>
            </div>
            <div className="tab-pane fade" id="reviews">
              <div className="mb-3">
                <strong>Ariana Grande</strong>
                <p className="mb-1">★★★★★</p>
                <p>Great phone! Totally worth the upgrade.</p>
              </div>
              <form>
                <div className="form-group">
                  <label>Your Review</label>
                  <textarea className="form-control" rows="3"></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Name</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Email</label>
                    <input type="email" className="form-control" />
                  </div>
                </div>
                <button type="submit" className="btn btn-success">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
