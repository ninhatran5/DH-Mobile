// TooltipIcon.jsx
import React, { useState } from "react";

const TooltipIcon = ({ icon: Icon, tooltip, ...props }) => {
  const [show, setShow] = useState(false);

  if (!Icon) {
    return null;
  }

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        verticalAlign: "middle",
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Icon {...props} style={{ fontSize: 12, ...props.style }} />
      {show && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: "130%",
            transform: "translateX(-90%)",
            background: "#222",
            color: "#fff",
            padding: "5px 12px",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            fontSize: "12px",
            zIndex: 99999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
            pointerEvents: "none",
            minWidth: "max-content",
          }}
        >
          {tooltip}
        </span>
      )}
    </span>
  );
};

export default TooltipIcon;
