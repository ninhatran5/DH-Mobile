import React from "react";
import Slider from "react-slick";
import tecnoLogo from "../assets/images/Tecno_Mobile_logo.svg.png";
import vivoLogo from "../assets/images/Vivo_logo_2019.svg.png";
import honorLogo from "../assets/images/LOGO_Honor.svg.png";
import redmagicLogo from "../assets/images/redmagic-logo.png.webp";
import nokiaLogo from "../assets/images/nokia-new-logo-2023-png-vector.svg";
import asusLogo from "../assets/images/AsusTek-black-logo.png";
import sonyLogo from "../assets/images/sony.png";
import masstelLogo from "../assets/images/Masstel-logo.png";
import bkav from "../assets/images/logo-bkav.png";
import appleLogo from "../assets/images/logo-apple.webp";
import vnpayLogo from "../assets/images/logo-vndpay.webp";
import samsungLogo from "../assets/images/logo-samsung.svg";

import "../assets/css/slider.css";
import { useTranslation } from "react-i18next";

const SliderLogoBrand = () => {
  const settings = {
    infinite: true,
    slidesToShow: 8,
    slidesToScroll: 1,
    autoplay: true,
    speed: 3800, // Giảm tốc độ chuyển động
    autoplaySpeed: 100, // Thay đổi tốc độ chuyển tiếp
    cssEase: "ease-in-out",
    arrows: false,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  const logos = [
    bkav,
    vnpayLogo,
    samsungLogo,
    appleLogo,
    tecnoLogo,
    vivoLogo,
    honorLogo,
    redmagicLogo,
    nokiaLogo,
    asusLogo,
    sonyLogo,
    masstelLogo,
  ];
  const { t } = useTranslation();

  return (
    <>
      <div className="container">
        <div className="partner-page">
          <div className="slide-partner">
            <div className="partner">
              <p className="partner-title text-center">{t("home.partners")}</p>
              <p className="partner-des text-center">PARTNERS AND CUSTOMERS</p>
            </div>
            <div className="slider-container">
              <Slider {...settings} key={logos.length}>
                {logos.map((logo, index) => (
                  <div key={index} className="logo-slide">
                    <img
                      src={logo}
                      alt={`Brand logo ${index + 1}`}
                      className="logo-img"
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
          <Slider {...{ ...settings, rtl: true }} key={logos.length + 1}>
            {logos.map((logo, index) => (
              <div key={index} className="logo-slide">
                <img
                  src={logo}
                  alt={`Brand logo ${index + 1}`}
                  className="logo-img"
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </>
  );
};

export default SliderLogoBrand;
