import Select from "react-select";
import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanks } from "../slices/walletSlice";

const BankSelect = ({ value, onChange, placeholder }) => {
  const [internal, setInternal] = useState(null);
  const isControlled = value !== undefined && onChange;
  const dispatch = useDispatch();
  const { banks } = useSelector((state) => state.wallet);
  const bankOptions = banks?.map((bank) => ({
    value: bank.code,
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={bank.logo}
          alt={bank.shortName}
          style={{
            width: "50px",
            height: "40px",
            marginRight: "10px",
            objectFit: "contain",
          }}
        />
        <span>
          {bank.code} - {bank.name}
        </span>
      </div>
    ),
    rawData: bank,
  }));
  const selectedOption = useMemo(() => {
    if (isControlled) {
      return bankOptions?.find((o) => o.value === value) || null;
    }
    return internal;
  }, [value, internal, isControlled]);

  const handleChange = (opt) => {
    if (isControlled) {
      onChange(opt?.rawData);
    } else {
      setInternal(opt);
    }
  };

  useEffect(() => {
    dispatch(fetchBanks());
  }, [dispatch]);
  return (
    <Select
      options={bankOptions}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isSearchable
      formatOptionLabel={(option) => option.label}
      styles={{
        control: (base) => ({
          ...base,
          padding: "2px",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          minHeight: "48px",
          fontSize: "14px",
        }),
        option: (base, { isFocused }) => ({
          ...base,
          backgroundColor: isFocused ? "#f3f4f6" : "white",
          color: "#1f2937",
          padding: "8px 15px",
          display: "flex",
          alignItems: "center",
          fontSize: "14px",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }),
      }}
    />
  );
};

export default BankSelect;
