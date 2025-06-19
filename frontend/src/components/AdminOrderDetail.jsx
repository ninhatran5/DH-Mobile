import React, { useEffect, useRef } from "react";
import "../assets/admin/OrderStatusSteps.css";

const OrderStatusSteps = ({ status }) => {
  const statusOrder = [
    { key: "Chờ xác nhận", label: "Chờ xác nhận" },
    { key: "Đã xác nhận", label: "Đã xác nhận" },
    { key: "Chờ lấy hàng", label: "Chờ lấy hàng" },
    { key: "Đang vận chuyển", label: "Đang vận chuyển" },
    { key: "Đang giao hàng", label: "Đang giao hàng" },
    { key: "Đã Giao hàng", label: "Đã Giao hàng" },
    { key: "Hoàn thành", label: "Hoàn thành" },
  ];

  const currentIndex = statusOrder.findIndex(
    (s) => s.key.toLowerCase() === status?.trim().toLowerCase()
  );

  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && currentIndex >= 0) {
      const percent = (currentIndex / (statusOrder.length - 1)) * 100;
      ref.current.style.setProperty("--progress", `${percent}%`);
    }
  }, [currentIndex]);

  return (
    <div className="adminorder-status-container" ref={ref}>
      <ul className="adminorder-status-steps">
        {statusOrder.map((step, index) => (
          <li
            key={step.key}
            className={`adminorder-step ${index <= currentIndex ? "active" : ""} ${
              index === currentIndex ? "current" : ""
            }`}
          >
            <div className="adminorder-circle">
              {index <= currentIndex ? <span>&#10003;</span> : <span />}
            </div>
            <p className="adminorder-label">{step.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderStatusSteps;
