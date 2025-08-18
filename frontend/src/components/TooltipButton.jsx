import { Tooltip } from "react-tooltip";

export default function TooltipButton({ id, tooltip, onClick, className, children, ...props }) {
  return (
    <button
      className={className}
      type="button"
      onClick={onClick}
      data-tooltip-id={id}
      data-tooltip-content={tooltip}
      {...props}
    >
      {children}
      <Tooltip
        id={id}
        place="top"
        effect="solid"
        style={{
          fontSize: "14px",
          padding: "5px 10px",
          zIndex: 9999,
          backgroundColor: "#333",
          color: "#fff",
          borderRadius: "4px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}
