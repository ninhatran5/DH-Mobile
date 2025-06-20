import React, { useEffect, useRef } from "react";
import "../assets/admin/OrderStatusSteps.css";
import { FiCheckCircle, FiPackage, FiTruck, FiSend, FiAward, FiClock } from "react-icons/fi";

const OrderStatusSteps = ({ status }) => {
  const statusOrder = [
    { key: "Chờ xác nhận", label: "Chờ xác nhận", icon: <FiClock /> },
    { key: "Đã xác nhận", label: "Đã xác nhận", icon: <FiCheckCircle /> },
    { key: "Chờ lấy hàng", label: "Chờ lấy hàng", icon: <FiPackage /> },
    { key: "Đang vận chuyển", label: "Đang vận chuyển", icon: <FiTruck /> },
    { key: "Đang giao hàng", label: "Đang giao hàng", icon: <FiSend /> },
    { key: "Đã giao hàng", label: "Đã giao hàng", icon: <FiAward /> },
    { key: "Hoàn thành", label: "Hoàn thành", icon: <FiAward /> },
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
              {step.icon}
            </div>
            <p className="adminorder-label">{step.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderStatusSteps;
