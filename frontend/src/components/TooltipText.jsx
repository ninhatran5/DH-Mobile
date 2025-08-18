import { Tooltip } from "react-tooltip";

export default function TooltipText({
  id,
  tooltip,
  className = "",
  children,
  ...props
}) {
  return (
    <>
      <span
        data-tooltip-id={id}
        data-tooltip-content={tooltip}
        className={className}
        style={{ cursor: "pointer" }}
        {...props}
      >
        {children}
      </span>
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
    </>
  );
}
