/* eslint-disable no-unused-vars */
import { useDispatch, useSelector } from "react-redux";
import AddressItem from "./AddressItem";
import {
  deleteAddressNew,
  fetchAddressNew,
  setDefaultAddress,
} from "../slices/changeAddressSlice";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

export default function AddressList({
  addresses,
  selectedRadio,
  setSelectedRadio,
  setEditAddress,
  setShowUpdateModal,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { changeAddressNew: _ } = useSelector((state) => state.changeAddress);

  if (!Array.isArray(addresses) || addresses.length === 0) return null;

  const handleDeleteAddress = (addressId) => {
    Swal.fire({
      title: t("deleteAddress.confirmTitle"),
      text: t("deleteAddress.confirmText"),
      icon: "warning",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("deleteAddress.confirmBtn"),
      cancelButtonText: t("deleteAddress.cancelBtn"),
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteAddressNew(addressId))
          .unwrap()
          .then(() => {
            Swal.fire({
              title: t("deleteAddress.deletedTitle"),
              text: t("deleteAddress.deletedText"),
              icon: "success",
            });
            dispatch(fetchAddressNew());
          })
          .catch((error) => {
            Swal.fire({
              title: t("deleteAddress.errorTitle"),
              text: t("deleteAddress.errorText"),
              icon: "error",
            });
          });
      }
    });
  };

  const handleDefaultAddress = (addressId) => {
    Swal.fire({
      title: t("defaultAddress.confirmTitle"),
      text: t("defaultAddress.confirmText"),
      icon: "warning",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("defaultAddress.confirmBtn"),
      cancelButtonText: t("defaultAddress.cancelBtn"),
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(setDefaultAddress(addressId))
          .unwrap()
          .then(() => {
            Swal.fire({
              title: t("defaultAddress.successTitle"),
              text: t("defaultAddress.successText"),
              icon: "success",
            });
            dispatch(fetchAddressNew());
          })
          .catch((error) => {
            Swal.fire({
              title: t("defaultAddress.errorTitle"),
              text: t("defaultAddress.errorText"),
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
            isDefault={address?.is_default === 1}
            radioId={`radioDefault${idx + 2}`}
            handleDeleteAddress={() => handleDeleteAddress(address?.address_id)}
            checked={selectedRadio === address.address_id}
            onChange={() => setSelectedRadio(address.address_id)}
            onEdit={() => {
              setEditAddress(address);
              setShowUpdateModal(true);
            }}
            onChangDefault={() => handleDefaultAddress(address?.address_id)}
          />
          <hr className="address-divider" />
        </div>
      ))}
    </>
  );
}
