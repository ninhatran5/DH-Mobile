import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchBanners } from "../slices/homeSlice";
import { isAllowedPage } from "../../utils/pageHelpers";
import "../assets/css/bannerPopupEvent.css";

const BannerPopup = () => {
  const [showBannerPopup, setShowBannerPopup] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const { banners } = useSelector((state) => state.home);

  const eventBanners = useMemo(
    () => banners.filter((event) => event.title.includes("Event")),
    [banners]
  );

  const allowed = useMemo(
    () => isAllowedPage(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  useEffect(() => {
    if (eventBanners.length && allowed) {
      const hasSeen = sessionStorage.getItem("hasSeenBannerPopup");
      if (!hasSeen) {
        setShowBannerPopup(true);
        sessionStorage.setItem("hasSeenBannerPopup", "1");
      }
    }
  }, [eventBanners, allowed]);

  if (!showBannerPopup || !allowed) return null;

  return (
    <div className="banner-popup-overlay-evt2025">
      <div className="banner-popup-modal-evt2025">
        <button
          className="banner-popup-close-btn-evt2025"
          onClick={() => setShowBannerPopup(false)}
          aria-label="Đóng"
        >
          ×
        </button>
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="banner-popup-swiper-evt2025"
        >
          {eventBanners.map((banner, index) => (
            <SwiperSlide key={index}>
              <img
                src={banner.image_url}
                alt={banner.title}
                className="banner-popup-img-evt2025"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default BannerPopup;
