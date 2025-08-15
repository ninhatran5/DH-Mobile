import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";
import { TbEditCircle } from "react-icons/tb";
import { MdShareLocation } from "react-icons/md";

export default function AddressItem({
  name,
  phone,
  address,
  ward,
  district,
  city,
  isDefault,
  checked,
  onEdit,
  onChange,
  handleDeleteAddress,
  radioName = "radioDefault",
  radioId,
  onChangDefault,
}) {
  const { t } = useTranslation();

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="radio"
        name={radioName}
        id={radioId}
        checked={checked}
        onChange={onChange}
      />
      <label className="form-check-label" htmlFor={radioId}>
        <div className="address-header">
          <div className="name_address">
            <p className="name_address_profile">{name}</p>
            <p className="phone_address_profile">{phone}</p>
          </div>
          <button className="edit-address-btn" type="button" onClick={onEdit}>
            <TbEditCircle />
          </button>
          <button
            className="delete-address-btn"
            type="button"
            onClick={handleDeleteAddress}
          >
            <FaTrash />
          </button>
          {!isDefault && (
            <button
              className="set-location-address-btn"
              type="button"
              onClick={onChangDefault}
              title={t("address.setAsDefault")}
            >
              <MdShareLocation />
            </button>
          )}
        </div>
        <div className="full_address_profile">
          <p className="address_profile">
            {(address ? address + ", " : "") +
              (ward ? ward + ", " : "") +
              (district ? district + ", " : "") +
              (city || "")}
          </p>
        </div>
        {isDefault && (
          <div className="default_address_profile">
            <p>{t("address.default")}</p>
          </div>
        )}
      </label>
    </div>
  );
}
