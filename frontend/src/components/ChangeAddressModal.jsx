/* eslint-disable no-unused-vars */
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../assets/css/changeAddress.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProfile } from "../slices/profileSlice";
import { MdAddCircleOutline } from "react-icons/md";
import Loading from "./Loading";
import AddAddressModal from "./AddAddressModal";
import {
  addAddresNew,
  fetchAddressNew,
  updateAddresNew,
} from "../slices/changeAddressSlice";
import AddressList from "./AddressList";
import UpdateAddressModal from "./UpdateAddressModal";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useTranslation } from "react-i18next";
const MySwal = withReactContent(Swal);

export default function ChangeAddressModal({
  show,
  handleClose,
  onSaveAddress,
  currentSelectedAddress, // Thêm prop để nhận địa chỉ hiện tại đang được chọn
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.profile);
  const { changeAddressNew } = useSelector((state) => state.changeAddress);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState("profile");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchAddressNew());
  }, [dispatch]);

  // Effect để tự động chọn địa chỉ mặc định khi modal mở
  useEffect(() => {
    if (show && changeAddressNew && changeAddressNew.length > 0) {
      // Nếu có địa chỉ hiện tại đang được chọn trong checkout
      if (currentSelectedAddress) {
        if (currentSelectedAddress.address_id) {
          setSelectedRadio(currentSelectedAddress.address_id);
        } else {
          setSelectedRadio("profile");
        }
      } else {
        // Tìm địa chỉ mặc định
        const defaultAddress = changeAddressNew.find(
          (address) => address.is_default === 1
        );
        if (defaultAddress) {
          setSelectedRadio(defaultAddress.address_id);
        } else {
          // Nếu không có địa chỉ mặc định, chọn profile
          setSelectedRadio("profile");
        }
      }
    } else if (show) {
      // Nếu không có địa chỉ nào được lưu, chọn profile
      setSelectedRadio("profile");
    }
  }, [show, changeAddressNew, currentSelectedAddress]);

  const handleCloseWithConfirm = async () => {
    const result = await MySwal.fire({
      title: t("address.confirmCloseTitle"),
      text: t("address.confirmCloseText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("returnRequest.closeBtn"),
      cancelButtonText: t("address.cancelBtn"),
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      handleClose();
    }
  };

  const nagivateToAddAddress = () => {
    setShowAddModal(true);
    handleClose();
  };

  const handleUpdateAddress = async (data) => {
    if (!editAddress || !editAddress.address_id) {
      Swal.fire("Lỗi!", "Không tìm thấy địa chỉ để cập nhật.", "error");
      return;
    }
    await dispatch(
      updateAddresNew({
        id: editAddress.address_id,
        data: {
          recipient_name: data.fullName,
          phone: data.phone,
          email: data.email,
          address: data.addressDetail,
          ward: data.ward,
          district: data.district,
          city: data.city,
        },
      })
    );
    setShowUpdateModal(false);
    setEditAddress(null);
    dispatch(fetchAddressNew());
  };

  return (
    <>
      {loading && <Loading />}
      <Modal
        show={show}
        onHide={handleCloseWithConfirm}
        backdrop="static"
        keyboard={false}
        size="xl"
      >
        <Modal.Header closeButton>
          <h4 className="modal_change_address_title">
            {t("address.selectAddressTitle")}
          </h4>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="radioDefault"
                id="radioDefault1"
                checked={selectedRadio === "profile"}
                onChange={() => setSelectedRadio("profile")}
              />
              <label className="form-check-label" htmlFor="radioDefault1">
                <div className="address-header">
                  <div className="name_address">
                    <p className="name_address_profile">
                      {profile?.user?.full_name || ""}
                    </p>
                    <p className="phone_address_profile">
                      {profile?.user?.phone || ""}
                    </p>
                  </div>
                </div>
                <div className="full_address_profile">
                  <p className="address_profile">
                    {`${profile?.user?.address || ""}${
                      profile?.user?.ward ? ", " + profile.user.ward : ""
                    }${
                      profile?.user?.district
                        ? ", " + profile.user.district
                        : ""
                    }${profile?.user?.city ? ", " + profile.user.city : ""}`}
                  </p>
                </div>
              </label>
            </div>
            <hr className="address-divider" />
            <AddressList
              addresses={changeAddressNew}
              selectedRadio={selectedRadio}
              setSelectedRadio={setSelectedRadio}
              setShowUpdateModal={setShowUpdateModal}
              setEditAddress={setEditAddress}
            />
            <div onClick={nagivateToAddAddress} className="add_address_new">
              <p className="icon_add_address">
                <MdAddCircleOutline />
              </p>
              <p className="text_add_address" onClick={nagivateToAddAddress}>
                {t("address.addNew")}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseWithConfirm}>
            {t("address.cancelBtn")}
          </Button>
          <Button
            onClick={async () => {
              if (selectedRadio === "profile") {
                await onSaveAddress(null);
              } else {
                const address = changeAddressNew.find(
                  (a) => a.address_id === selectedRadio
                );
                if (address) {
                  await onSaveAddress(address);
                }
              }
              handleClose();
            }}
            className="btn_save_address"
          >
            {t("address.saveBtn")}
          </Button>
        </Modal.Footer>
      </Modal>

      <AddAddressModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddAddress={async (data) => {
          const result = await Swal.fire({
            title: t("address.confirmSaveTitle"),
            text: t("address.confirmSaveText"),
            icon: "question",
            showCancelButton: true,
            confirmButtonText: t("address.saveBtn"),
            cancelButtonText: t("address.cancelBtn"),
            reverseButtons: true,
          });

          if (result.isConfirmed) {
            try {
              await dispatch(
                addAddresNew({
                  recipient_name: data.fullName,
                  phone: data.phone,
                  email: data.email,
                  address: data.addressDetail,
                  ward: data.ward,
                  district: data.district,
                  city: data.city,
                })
              );
              await dispatch(fetchAddressNew());
              Swal.fire(
                t("address.savedTitle"),
                t("address.savedText"),
                "success"
              );
              setShowAddModal(false);
            } catch (error) {
              Swal.fire(
                t("address.errorTitle"),
                t("address.errorText"),
                "error"
              );
            }
          }
        }}
      />

      <UpdateAddressModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        onUpdateAddress={handleUpdateAddress}
        defaultValues={{
          fullName: editAddress?.recipient_name,
          phone: editAddress?.phone,
          email: editAddress?.email,
          city: editAddress?.city,
          district: editAddress?.district,
          ward: editAddress?.ward,
          addressDetail: editAddress?.address,
        }}
      />
    </>
  );
}
