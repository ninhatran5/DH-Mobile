import { useCallback } from "react";
import { formatNumberInput, sanitizeNumberInput } from "./numberFormatInput";

export default function useNumberInput(field) {
  const displayValue = formatNumberInput(field.value);

  const handleChange = useCallback(
    (e) => {
      const sanitized = sanitizeNumberInput(e.target.value);
      field.onChange(sanitized);
    },
    [field]
  );

  return { displayValue, handleChange };
}