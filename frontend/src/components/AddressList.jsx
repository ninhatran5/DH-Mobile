import { useDispatch, useSelector } from "react-redux";
import AddressItem from "./AddressItem";
import {
  deleteAddressNew,
  fetchAddressNew,
} from "../slices/changeAddressSlice";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

export default function AddressList({ addresses }) {
  const dispatch = useDispatch();
  const { changeAddressNew: _ } = useSelector((state) => state.address);

  if (!Array.isArray(addresses) || addresses.length === 0) return null;

  const handleDeleteAddress = (addressId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Địa chỉ này sẽ bị xóa khỏi danh sách!",
      icon: "warning",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteAddressNew(addressId))
          .unwrap()
          .then(() => {
            Swal.fire({
              title: "Đã xóa!",
              text: "Địa chỉ đã được xóa.",
              icon: "success",
            });
            dispatch(fetchAddressNew());
          })
          // eslint-disable-next-line no-unused-vars
          .catch((error) => {
            Swal.fire({
              title: "Lỗi!",
              text: "Xóa địa chỉ thất bại.",
              icon: "error",
            });
          });
      }
    });
  };

  return (
    <>
      {addresses.map((address, idx) => (
        <div key={address?.address_id || idx}>
          <AddressItem
            name={address?.recipient_name || ""}
            phone={address?.phone || ""}
            address={address?.address || ""}
            ward={address?.ward || ""}
            district={address?.district || ""}
            city={address?.city || ""}
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
