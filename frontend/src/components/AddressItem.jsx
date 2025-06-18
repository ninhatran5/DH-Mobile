import { FaTrash } from "react-icons/fa";
import { TbEditCircle } from "react-icons/tb";

export default function AddressItem({
  name,
  phone,
  address,
  isDefault,
  checked,
  onEdit,
  onChange,
  handleDeleteAddress,
  radioName = "radioDefault",
  radioId,
}) {
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
            {isDefault && (
              <div className="default_address_profile">
                <p>Mặc định</p>
              </div>
            )}
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
        </div>
        <div className="full_address_profile">
          <p className="address_profile">{address}</p>
        </div>
      </label>
    </div>
  );
}
