import { useEffect, useRef, useState } from "react";
import TooltipIcon from "./TooltipIcon";
const AutoHideTooltipIcon = ({
  icon,
  tooltip,
  className,
  onClick,
  startTime,
  seconds,
  children,
  ...rest
}) => {
  const [show, setShow] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!startTime) {
      setShow(true);
      return;
    }
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    if (diff >= seconds) {
      setShow(false);
    } else {
      setShow(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShow(false);
      }, (seconds - diff) * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTime, seconds]);

  if (!show) return null;
  if (children) {
    return children;
  }
  return (
    <TooltipIcon
      icon={icon}
      tooltip={tooltip}
      className={className}
      onClick={onClick}
      {...rest}
    />
  );
};

export default AutoHideTooltipIcon;
