import { useDispatch, useSelector } from "react-redux";
import AddressItem from "./AddressItem";
import {
  deleteAddressNew,
  fetchAddressNew,
} from "../slices/changeAddressSlice";
import { toast } from "react-toastify";

export default function AddressList({ addresses }) {
  const dispatch = useDispatch();
  const { changeAddressNew: _ } = useSelector((state) => state.address);
  if (!Array.isArray(addresses) || addresses.length === 0) return null;
  const handleDeleteAddress = (addressId) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?");
    if (confirmed) {
      dispatch(deleteAddressNew(addressId))
        .unwrap()
        .then(() => {
          toast.success("Xóa địa chỉ thành công");
          dispatch(fetchAddressNew());
        })
        .catch((error) => {
          toast.error("Xóa địa chỉ thất bại");
          console.error("Lỗi khi xóa địa chỉ:", error);
        });
    }
  };

  return (
    <>
      {addresses.map((address, idx) => (
        <div key={address?.address_id || idx}>
          <AddressItem
            name={address?.recipient_name || ""}
            phone={address?.phone || ""}
            address={address?.address || ""}
            isDefault={false}
            radioId={`radioDefault${idx + 2}`}
            handleDeleteAddress={() => handleDeleteAddress(address?.address_id)}
          />
          <hr className="address-divider" />
        </div>
      ))}
    </>
  );
}
