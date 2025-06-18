import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../assets/css/changeAddress.css";
import { TbEditCircle } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProfile } from "../slices/profileSlice";
import { MdAddCircleOutline } from "react-icons/md";
import Loading from "./Loading";
import AddAddressModal from "./AddAddressModal";
import { addAddresNew, fetchAddressNew } from "../slices/changeAddressSlice";
import { FaTrash } from "react-icons/fa";
import AddressList from "./AddressList";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

export default function ChangeAddressModal({ show, handleClose }) {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.profile);
  const { changeAddressNew } = useSelector((state) => state.changeAddress);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchAddressNew());
  }, [dispatch]);

  const handleCloseWithConfirm = async () => {
    const result = await MySwal.fire({
      title: "Bạn có chắc chắn muốn đóng?",
      text: "Các thay đổi chưa được lưu sẽ bị mất.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đóng",
      cancelButtonText: "Hủy",
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
          <h4 className="modal_change_address_title">Chọn địa chỉ nhận hàng</h4>
        </Modal.Header>
        <Modal.Body>
          <div className="container-fluid">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="radioDefault"
                id="radioDefault1"
                defaultChecked
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
                  <div className="d-flex">
                    <button
                      disabled={true}
                      className="edit-address-btn"
                      type="button"
                    >
                      <TbEditCircle />
                    </button>
                    <button
                      disabled={true}
                      className="delete-address-btn"
                      type="button"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="full_address_profile">
                  <p className="address_profile">
                    {profile?.user?.address || ""}
                  </p>
                </div>
                <div className="default_address_profile">
                  <p>Mặc định</p>
                </div>
              </label>
            </div>
            <hr className="address-divider" />
            <AddressList addresses={changeAddressNew} />
            <div onClick={nagivateToAddAddress} className="add_address_new">
              <p className="icon_add_address">
                <MdAddCircleOutline />
              </p>
              <p className="text_add_address" onClick={nagivateToAddAddress}>
                Thêm địa chỉ mới
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseWithConfirm}>
            Hủy
          </Button>
          <Button onClick={handleClose} className="btn_save_address">
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>

      <AddAddressModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddAddress={async (data) => {
          const result = await Swal.fire({
            title: "Bạn có muốn lưu địa chỉ này?",
            text: "Thông tin địa chỉ sẽ được thêm vào danh sách của bạn.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Lưu",
            cancelButtonText: "Hủy",
            reverseButtons: true, // "Hủy" nằm bên phải
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
                "Đã lưu!",
                "Địa chỉ đã được thêm thành công.",
                "success"
              );
              setShowAddModal(false);
              // eslint-disable-next-line no-unused-vars
            } catch (error) {
              Swal.fire("Lỗi!", "Không thể thêm địa chỉ.", "error");
            }
          }
        }}
      />
    </>
  );
}
