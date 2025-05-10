import "../assets/css/checkimei.css";
import image1 from "../assets/images/illustration-1.webp";
import { FaCheckDouble } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import { useState } from "react";

const CheckImei = () => {
  const [showResult, setShowResult] = useState(false);
  const handleSearchClick = () => {
    setShowResult(true); // Bấm nút sẽ hiện kết quả
  };
  return (
    <>
      <section id="checkimei-hero" className="checkimei-hero section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="checkimei-hero-content">
                <div className="checkimei-company-badge mb-4">
                  <FaCheckDouble style={{ marginRight: 10 }} />
                  Kiểm tra thông tin
                </div>

                <h1 className="mb-4">
                  XÁC MINH <br />
                  THÔNG TIN THIẾT BỊ <br />
                  <span className="checkimei-accent-text">NHANH CHÓNG</span>
                </h1>

                <p className="mb-4 mb-md-5">
                  Chúng tôi cung cấp giải pháp tối ưu cho nhu cầu di động của
                  bạn. Khám phá những dịch vụ chất lượng và hỗ trợ tận tâm từ DH
                  Mobile.
                </p>

                <div className="h-100">
                  <div className="d-flex justify-left-center h-100">
                    <div className="searchbar">
                      <input
                        className="search_input"
                        type="text"
                        placeholder="Tìm kiếm..."
                      />
                      <a
                        onClick={handleSearchClick}
                        style={{ cursor: "pointer" }}
                        className="search_icon"
                      >
                        <FaSearch />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="checkimei-hero-image">
                <img src={image1} alt="Hero" className="img-fluid" />

                <div className="checkimei-customers-badge">
                  <p className="mb-0">
                    "Kiểm tra IMEI nhanh chóng và chính xác trên DH Mobile."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {showResult && (
            <div className="row checkimei-stats-row mt-5">
              <div className="d-flex flex-column flex-lg-row col-lg-12">
                <div className="checkimei_image col-lg-6">
                  <img src={iphone} width={300} height={300} alt="iPhone 12" />
                </div>
                <div className="imei-info-card col-lg-6 ms-3 mt-3 mt-lg-0">
                  <h2>iPhone 12 64GB White</h2>
                  <p>
                    <strong>IMEI:</strong> 355877307367361
                  </p>
                  <p>
                    <strong>MEID:</strong> 35587730736736
                  </p>
                  <p>
                    <strong>GSMA Blacklist Status:</strong> CLEAN
                  </p>
                  <p>
                    <strong>iCloud Lock / iCloud Status:</strong> Check here
                  </p>
                  <p>
                    <strong>Carrier/SIM Lock:</strong> Click to buy carrier/SIM
                    lock check!
                  </p>
                  <p>
                    <strong>Check result provided by:</strong> DH Mobile
                  </p>
                  <p>
                    <strong>Timestamp:</strong> 10 May 2025 5:51 PM CEST
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CheckImei;
