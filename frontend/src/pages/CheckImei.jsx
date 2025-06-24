import "../assets/css/checkimei.css";
import image1 from "../assets/images/illustration-1.webp";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import { FaCheckDouble } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const CheckImei = () => {
  const { t } = useTranslation();
  const [showResult, setShowResult] = useState(false);

  const handleSearchClick = () => {
    setShowResult(true);
  };

  return (
    <section id="checkimei-hero" className="checkimei-hero section">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="checkimei-hero-content">
              <div className="checkimei-company-badge mb-4">
                <FaCheckDouble style={{ marginRight: 10 }} />
                {t("checkimei.badge")}
              </div>

              <h1 className="mb-4">
                {t("checkimei.title.line1")}
                <br />
                {t("checkimei.title.line2")}
                <br />
                <span className="checkimei-accent-text">
                  {t("checkimei.title.highlight")}
                </span>
              </h1>

              <p className="mb-4 mb-md-5">{t("checkimei.description")}</p>

              <div className="h-100">
                <div className="d-flex justify-left-center h-100">
                  <div className="searchbar">
                    <input
                      className="search_input"
                      type="text"
                      placeholder={t("checkimei.searchPlaceholder")}
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
                <p className="mb-0">{t("checkimei.review")}</p>
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
                <h2>{t("checkimei.result.model")}</h2>
                <p>
                  <strong>IMEI:</strong> 355877307367361
                </p>
                <p>
                  <strong>MEID:</strong> 35587730736736
                </p>
                <p>
                  <strong>{t("checkimei.result.blacklist")}:</strong> CLEAN
                </p>
                <p>
                  <strong>{t("checkimei.result.icloud")}:</strong>{" "}
                  {t("checkimei.result.icloudCheck")}
                </p>
                <p>
                  <strong>{t("checkimei.result.simlock")}:</strong>{" "}
                  {t("checkimei.result.simlockCheck")}
                </p>
                <p>
                  <strong>{t("checkimei.result.provider")}:</strong> DH Mobile
                </p>
                <p>
                  <strong>{t("checkimei.result.timestamp")}:</strong>{" "}
                  10 May 2025 5:51 PM CEST
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CheckImei;
